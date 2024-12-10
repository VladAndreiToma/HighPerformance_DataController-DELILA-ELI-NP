#this code aims to fetch data of interest from the HV module by CAEN @ 172.18.6.203
#id parameters of the module: check the module list provided aside this script txt file
from influxdb import InfluxDBClient
from epics import caget
from datetime import datetime
import threading
import time
from requests.exceptions import ConnectionError, Timeout
import os
import subprocess

# Set up client to the database and make a connection repoller --- in case at some point something piles up on database comm
def initialize_client(retries=5, delay=5):
    """Attempts to initialize the InfluxDB client withretries."""
    for attempt in range(retries): 
        try:
            client = InfluxDBClient(host='localhost', port=8086, database='HVmodule_CAEN_SY4527_database')
            client.ping()  # Test if client is responsive
            print("InfluxDB client initialized successfully.")
            return client
        except Exception as e:
            print(f"Attempt {attempt + 1} to initialize client failed: {e}")
            if attempt < retries - 1:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("All retry attempts failed. Unable to initialize client.")
                return None

# create a client instance with the connection function
iAmClient = initialize_client()

# Define a path to write your stuff in terms of DB health connection
health_Status_file = "./health_status_with_InfluxDB.txt"

# Ensure the directory exists
os.makedirs(os.path.dirname(health_Status_file), exist_ok=True)
print("Health status file path:", os.path.abspath(health_Status_file))

# Set up process variables naming convention
bNo = 9
channels = 12
msn = 'fcebd5e8815db780'
voltage = 'VMon'
current = 'IMon'
max_voltage = 'SVMax'
bTemp = "Temp"
status = 'Status'

def write_data_with_retries(client, data, retries=10, delay=5):
    """Attempts to write data to InfluxDB with retries."""
    """increasing the retry attempts in order to make sure nothig happens"""
    """on avarege connection should be restored after 2 3 tries"""
    for attempt in range(retries):
        try:
            client.write_points(data)
            print("Data written successfully.\n\n")
            return True
        except (ConnectionError, Timeout) as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < retries - 1:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("All retry attempts failed. Data not written.")
                return False

def get_data_from_module_with_epics(fmodule, fboards, fchannels):
    data_json = []
    for bContor in range(fboards):
        for chContor in range(fchannels):
            gotVoltage = caget(fmodule + ":" + str(bContor).zfill(2) + ":" + str(chContor).zfill(3) + ":" + voltage)
            gotCurrent = caget(fmodule + ":" + str(bContor).zfill(2) + ":" + str(chContor).zfill(3) + ":" + current)
            gotVoltageMax = caget(fmodule + ":" + str(bContor).zfill(2) + ":" + str(chContor).zfill(3) + ":" + max_voltage)
            gotTemperature = caget(fmodule + ":" + str(bContor).zfill(2) + ":" + bTemp)
            data_json.append({
                'measurement': 'hv_module',
                'tags': {
                    'board': bContor,
                    'channel': chContor
                },
                'fields': {
                    voltage: gotVoltage,
                    current: gotCurrent,
                    max_voltage: gotVoltageMax,
                    bTemp: gotTemperature
                }
            })
    print(bContor, chContor, gotVoltage, gotCurrent, gotTemperature, gotVoltageMax)
    print("Writing to client: JSON body [ voltage, current, board temp., max voltages ]")
    if iAmClient:
        write_data_with_retries(iAmClient, data_json)

# Periodic job assigner for the EPICS communication
def periodic_job_that_calls_fetch():
    get_data_from_module_with_epics(msn, bNo, channels)
    '''using threading for autocall'''
    threading.Timer(2, periodic_job_that_calls_fetch).start()

# Checking if client instance is alive if it is allive write in health_Status file alive, if not write not alive
def is_client_alive(client):
    try:
        clientVersion = client.ping() 
        print(f"InfluxDB server version:{clientVersion}")
        return True
    except Exception as e:
        print(f"InfluxDB client is not alive: {e}")
        return False

def log_health_status():
    status = "alive" if is_client_alive(iAmClient) else "not-alive"
    currentTime = datetime . now() . strftime("%Y-%m-%d %H:%M:%S")
    '''try:
        print( f"Attempting to log health status: {currentTime} - {status}" )
        with open( health_Status_file , "a" ) as hf:
            hf . write( f"{currentTime}: InfluxDB client is {status}\n")
        print(f"Logged health status: {status}")
    except Exception as e:
        print(f"Failed to write health status: {e}")'''

# automatic threader for the health connection checking of the script with the db
def periodic_health_check():
    log_health_status()
    '''using threading for autocall'''
    threading . Timer( 60 , periodic_health_check ) . start()


# path where the epics comm will write data
connectionWithEpicsStatusFile = "./connection_with_epics_file.txt"
os.makedirs( os . path . dirname( connectionWithEpicsStatusFile ) , exist_ok = True )
print( "Health status file path: ", os . path . abspath( connectionWithEpicsStatusFile ) )

#function to check the connection with the epics modules
def check_epics_connection( epics_IP ):
    try:
        responseFromEpics = subprocess . run( ['ping' , '-c' , '1' , epics_IP ],  stdout=subprocess.PIPE )
        return [ responseFromEpics . returncode == 0 , responseFromEpics ]
    except Exception as e:
        return [ False , responseFromEpics ]
    

def epics_control_manager(epics_IP):
    global iAmClient
    retryInterval = 300

    while True:
        epics_connection, message = check_epics_connection(epics_IP=epics_IP)

        # Always log the status inside a with block
        if epics_connection:
            with open(connectionWithEpicsStatusFile, "a") as WES:
                currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                WES.write(f'{currentTime} - EPICS COMM STATUS OK!!!!\n')

            if iAmClient is None or not is_client_alive(iAmClient):
                with open(connectionWithEpicsStatusFile, "a") as WES:
                    WES.write("\n******Re-initialize influx DB client*********\n")
                iAmClient = initialize_client()

            if iAmClient:
                periodic_job_that_calls_fetch()
                periodic_health_check()
            
            time.sleep(retryInterval)
        else:
            with open(connectionWithEpicsStatusFile, "a") as WES:
                currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                WES.write(f"{currentTime} - EPICS DOWN. NO COMM . Retry in {retryInterval/60} mins\n")
            
            time.sleep(retryInterval)


# epics ip address
epicsIP = '172.18.6.203'
manager_thread = threading . Thread( target=epics_control_manager , args=( epicsIP, ) )
manager_thread . start()

# Main loop to keep the script running
try:
    while True:
        time.sleep(10)
except KeyboardInterrupt:
    print("Fetcher aborted by user!")



