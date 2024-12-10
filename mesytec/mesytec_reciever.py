'''
import socket
import json
from influxdb import InfluxDBClient
from requests . exceptions import ConnectionError , Timeout
import os
import subprocess
import time

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

def initialize_a_client_connection(retries = 10 , delay = 5):
    # tries every 5 seconds 10 times to avoid peer connectio
    for attempt in range( retries ):
        try:
            client = InfluxDBClient( host='localhost' , port='8086' , database='HVmodule_CAEN_SY4527_database' )
            client . ping()  # testing responsiveness of client
            print( "influx db initialized ok" )
            return client
        except Exception as e:
            print(f"Attempt {attempt + 1} to initialize client failed: {e}")
            if attempt < retries - 1:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("All retry attempts failed. Unable to initialize client.")
                return None
            

# MAKE INITIAL CLIENT INSTANCE
ClientMSYTECWantsToWrite = initialize_a_client_connection()


# Format the addresses from which we take the data
remote_ip = '172.18.6.59'  # The address of the remote computer
remote_port = 5000  # Since that PC exports via port 5000

# This script has a client socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((remote_ip, remote_port))

# Map to clean up the keys
theCleanKeyTransition = {
    'RU {}': 'RU',
    'RUP {}': 'RUP',
    'RUL {}': 'RUL',
    'RI {}': 'RI',
    'RIL {}': 'RIL',
    'RP {}': 'RP',
    'RTC {}': 'RTC',
    'RT {}': 'RT',
    'RRA': 'RRA'
}

def clean_value(key, value):
    # Remove '\n\rMHV-4>' from the value
    value = value.split('\n\rMHV-4>')[0].strip()
    
    # Extract the part after the colon if present
    if ':' in value:
        parts = value.split(':', 1)
        if len(parts) > 1:
            value = parts[1].strip()
    
    # Handle specific conversions based on key
    if key in ['RU', 'RUL', 'RT', 'RRA']:
        # Convert to float if possible
        try:
            value = float(value.split()[0])
        except ValueError:
            pass  # Keep as string if conversion fails
    elif key in ['RI', 'RIL']:
        # Remove the 'uA' unit and convert to float
        try:
            value = float(value.replace('uA', '').strip())
        except ValueError:
            pass  # Keep as string if conversion fails
    elif key == 'RP':
        # Convert polarity to +1 for positive, -1 for negative
        value = +1 if 'positive' in value.lower() else -1
    
    elif key == 'RTC':
        # Split the RTC value into its components (sense, offset, slope)
        parts = value.split(';')
        sense = int(parts[0].split(':')[1].strip()) if len(parts) > 0 else None
        offset = float(parts[1].split(':')[1].strip().replace(' C', '')) if len(parts) > 1 else None
        slope = float(parts[2].split(':')[1].strip().replace(' V/C', '')) if len(parts) > 2 else None
        # Store as a dictionary
        value = {
            'sense': sense,
            'offset': offset,
            'slope': slope
        }
    
    # Handle any other key-specific cleaning if needed
    return value

try:
    while True:
        data = client_socket.recv(1024).decode('utf-8')
        
        # the json to be put inside the db
        jsonToPutInDB = []

        if data:
            # Parse the received JSON data
            parsed_data = json.loads(data)
            
            # Create a new dictionary to hold the cleaned data
            cleaned_data = {}
            
            # Preserve the 'channel' key if present
            if 'channel' in parsed_data:
                cleaned_data['channel'] = parsed_data['channel']
            
            # Iterate over the received data and clean up keys and values
            for key, value in parsed_data.items():
                if key == 'channel':
                    continue

                # Clean the key using the mapping
                newKey = theCleanKeyTransition.get(key, key).replace("{}", "").strip()

                # Clean the value using the helper function
                cleaned_value = clean_value(newKey, value)

                # Add the cleaned key-value pair to the new dictionary
                cleaned_data[newKey] = cleaned_value
            
            # Print the cleaned JSON data
            print(f"Received and cleaned JSON data: {json.dumps(cleaned_data, indent=2)}")

            # forming the json for the db
            jsonToPutInDB . append({
                'measurement': 'mesytec_module',
                'tags': {
                    'channel': cleaned_data['channel']
                },
                'fields': {
                    'RU': cleaned_data['RU'],
                    'RUP': cleaned_data['RUP'],
                    'RUL': cleaned_data['RUL'],
                    'RI': cleaned_data['RI'],
                    'RIL': cleaned_data['RIL'],
                    'RP': cleaned_data['RP'],
                    'RTC_sense': cleaned_data['RTC']['sense'],
                    'RTC_offset': cleaned_data['RTC']['offset'],
                    'RTC_slope': cleaned_data['RTC']['slope'],
                    'RT': cleaned_data['RT'],
                    'RRA': cleaned_data['RRA']
                }
            })

            # writting to the database:
            write_data_with_retries( ClientMSYTECWantsToWrite , jsonToPutInDB )

        else:
            break

except KeyboardInterrupt:
    print("Stopping the client")
finally:
    client_socket.close()
'''


import socket
import json
import threading
from influxdb import InfluxDBClient
from requests.exceptions import ConnectionError, Timeout
import time

from datetime import datetime


def write_data_with_retries(client, data, retries=10, delay=5):
    """Attempts to write data to InfluxDB with retries."""
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


def initialize_a_client_connection(retries=10, delay=5):
    """Initialize InfluxDB client connection with retries."""
    for attempt in range(retries):
        try:
            client = InfluxDBClient(host='localhost', port='8086', database='HVmodule_CAEN_SY4527_database')
            client.ping()  # testing responsiveness of client
            print("InfluxDB initialized successfully.")
            return client
        except Exception as e:
            print(f"Attempt {attempt + 1} to initialize client failed: {e}")
            if attempt < retries - 1:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("All retry attempts failed. Unable to initialize client.")
                return None


def clean_value(key, value):
    """Clean the value based on its key."""
    value = value.split('\n\rMHV-4>')[0].strip()

    if ':' in value:
        parts = value.split(':', 1)
        if len(parts) > 1:
            value = parts[1].strip()

    # Handle specific conversions based on key
    if key in ['RU', 'RUL', 'RT', 'RRA']:
        try:
            value = float(value.split()[0])
        except ValueError:
            pass
    elif key in ['RI', 'RIL']:
        try:
            value = float(value.replace('uA', '').strip())
        except ValueError:
            pass
    elif key == 'RP':
        value = +1 if 'positive' in value.lower() else -1
    elif key == 'RTC':
        parts = value.split(';')
        sense = int(parts[0].split(':')[1].strip()) if len(parts) > 0 else None
        offset = float(parts[1].split(':')[1].strip().replace(' C', '')) if len(parts) > 1 else None
        slope = float(parts[2].split(':')[1].strip().replace(' V/C', '')) if len(parts) > 2 else None
        value = {'sense': sense, 'offset': offset, 'slope': slope}

    return value


def connect_and_receive_data(client):
    """Connect to the socket and receive data in a loop."""
    remote_ip = '172.18.6.59'
    remote_port = 5000
    theCleanKeyTransition = {
        'RU {}': 'RU',
        'RUP {}': 'RUP',
        'RUL {}': 'RUL',
        'RI {}': 'RI',
        'RIL {}': 'RIL',
        'RP {}': 'RP',
        'RTC {}': 'RTC',
        'RT {}': 'RT',
        'RRA': 'RRA'
    }

    while True:
        try:
            # This script has a client socket
            client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            client_socket.connect((remote_ip, remote_port))
            print("Connected to the remote server.")

            while True:
                data = client_socket.recv(1024).decode('utf-8')
                jsonToPutInDB = []

                if data:
                    # Parse the received JSON data
                    parsed_data = json.loads(data)
                    cleaned_data = {}

                    # Preserve the 'channel' key if present
                    if 'channel' in parsed_data:
                        cleaned_data['channel'] = parsed_data['channel']

                    # Iterate over the received data and clean up keys and values
                    for key, value in parsed_data.items():
                        if key == 'channel':
                            continue

                        newKey = theCleanKeyTransition.get(key, key).replace("{}", "").strip()
                        cleaned_value = clean_value(newKey, value)
                        cleaned_data[newKey] = cleaned_value

                    print(f"Received and cleaned JSON data: {json.dumps(cleaned_data, indent=2)}")

                    # Forming the JSON for the database
                    jsonToPutInDB.append({
                        'measurement': 'mesytec_module',
                        'tags': {'channel': cleaned_data['channel']},
                        'fields': {
                            'RU': cleaned_data['RU'],
                            'RUP': cleaned_data['RUP'],
                            'RUL': cleaned_data['RUL'],
                            'RI': cleaned_data['RI'],
                            'RIL': cleaned_data['RIL'],
                            'RP': cleaned_data['RP'],
                            'RTC_sense': cleaned_data['RTC']['sense'],
                            'RTC_offset': cleaned_data['RTC']['offset'],
                            'RTC_slope': cleaned_data['RTC']['slope'],
                            'RT': cleaned_data['RT'],
                            'RRA': cleaned_data['RRA']
                        }
                    })

                    # Writing to the database
                    write_data_with_retries(client, jsonToPutInDB)
                    nowDate = Generate_DateTime_By_User_For_Logs()
                    with open( PATH_TO_RECIEVE_LOG_FILE , 'a' ) as logsToRecieve:
                        logsToRecieve . write( f'{nowDate} - In recieving data from MESYTEC V Module: Data written successfully\n' ) 
                else:
                    break

        except (socket.error, ConnectionRefusedError) as e:
            print(f"Connection failed: {e}")

            time_now = Generate_DateTime_By_User_For_Logs()
            with open( PATH_TO_RECIEVE_LOG_FILE , 'a' ) as logsToRecieve:
                logsToRecieve . write( f"{time_now} - In recieving data from MESYTEC V Module: Connection Failed - Retrying in {RETRY_TIME} seconds...\n" )

            print(f"Retrying in {RETRY_TIME} seconds...")
            time.sleep(10)  # Wait for 10 seconds before retrying
        except KeyboardInterrupt:
            print("Stopping the client")
            break
        finally:
            client_socket.close()

def Generate_DateTime_By_User_For_Logs():
    right_now = datetime . now()
    user_friendly_now = right_now . strftime( '%Y-%m-%d %H:%M:%S' )
    return user_friendly_now


RETRY_TIME = 10
PATH_TO_RECIEVE_LOG_FILE = '/home/vtoma/WebDevProjects/ReactDevApps/Delila-Monitor/mesytec/receiver_logs.txt'

def run_socket_connection_thread():
    """Run the socket connection in a separate thread every 5 minutes."""
    ClientMSYTECWantsToWrite = initialize_a_client_connection()
    if not ClientMSYTECWantsToWrite:
        print("Failed to initialize the InfluxDB client. Exiting.")
        return

    # Start the thread for continuous socket connection and data receiving
    connection_thread = threading.Thread(target=connect_and_receive_data, args=(ClientMSYTECWantsToWrite,))
    connection_thread.daemon = True
    connection_thread.start()

    # Keep the main thread alive to handle keyboard interruptions
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Main thread interrupted. Exiting.")
        connection_thread.join()


if __name__ == "__main__":
    run_socket_connection_thread()
