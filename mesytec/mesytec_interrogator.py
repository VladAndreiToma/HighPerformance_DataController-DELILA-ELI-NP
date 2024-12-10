'''
import serial
import socket
import time

# Serial Port Configuration
SERIAL_PORT = '/dev/ttyUSB0'  # Replace with your serial port
BAUD_RATE = 9600
TIMEOUT = 1

# Socket Configuration
SERVER_IP = '0.0.0.0'
SERVER_PORT = 5000

# Channels to read
channels = [0, 1, 2, 3]

# Commands to send
commands = [
    'RU {}',      # Read voltage channel c
    'RUP {}',     # Read voltage preset channel c
    'RUL {}',     # Read voltage limit channel c
    'RI {}',      # Read current channel c
    'RIL {}',     # Read current limit channel c
    'RP {}',      # Read polarity channel c
    'RTC {}',     # Read complete settings for temp compensation channel c
    'RT {}',      # Read temperature at input c
    'RRA'        # Read HV ramp speed (no channel needed)
]

# Set up serial communication
serCommInstance = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=TIMEOUT)

# Set up socket server
serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
serverSocket.bind((SERVER_IP, SERVER_PORT))
serverSocket.listen(1)

print(f"Listening on {SERVER_IP}:{SERVER_PORT}...")

conn, addr = serverSocket.accept()
print(f"Connection from {addr} established!")

try:
    while True:
        for command_template in commands:
            for channel in channels:
                command = command_template.format(channel)
                print(f"Sending command: {command}")  # Debugging output
                
                # Send command to Smytec module using ASCII encoding
                serCommInstance.write( ( command + '\r' ).encode('ascii') )
                time.sleep(1)  # Wait for the response
                
                # Read response from Smytec module
                response = ""
                while serCommInstance.in_waiting > 0:
                    response += serCommInstance.read(serCommInstance.in_waiting).decode('ascii')
                
                print(  f'The response is: {response}' )

                if response:
                    response = response.strip()
                    print(f"Raw response: {response}")
                    
                    # Handle echoed command
                    if response.startswith(command):
                        response = response[len(command):].strip()
                    
                    # Ensure you only send actual data
                    if response:
                        print(f"Processed data: {response}")
                        conn.sendall(response.encode('ascii'))
                    else:
                        print(f"No meaningful data received for command: {command}")
                else:
                    print(f"No response received for command: {command}")
except KeyboardInterrupt:
    print("Stopping server.")
finally:
    conn.close()
    serCommInstance.close()
    serverSocket.close()
'''

# v 2.0 i want to group for each channel all the instruction with their value returned in a json format so i handle it better inside the
# reciever script


import serial
import socket
import time
import json

# Serial Port Configuration
SERIAL_PORT = '/dev/ttyUSB0'
BAUD_RATE = 9600
TIMEOUT = 5

# Socket Configuration
SERVER_IP = '0.0.0.0'
SERVER_PORT = 5000

# Channels to read
channels = [0, 1, 2, 3]

# Commands to send
commands = [
    'RU {}',      # Read voltage channel c
    'RUP {}',     # Read voltage preset channel c
    'RUL {}',     # Read voltage limit channel c
    'RI {}',      # Read current channel c
    'RIL {}',     # Read current limit channel c
    'RP {}',      # Read polarity channel c
    'RTC {}',     # Read complete settings for temp compensation channel c
    'RT {}',      # Read temperature at input c
    'RRA'        # Read HV ramp speed (no channel needed)
]

# Set up serial communication
serCommInstance = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=TIMEOUT)

serCommInstance . reset_input_buffer()
serCommInstance . reset_output_buffer()

# Set up socket server
serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
serverSocket.bind((SERVER_IP, SERVER_PORT))
serverSocket.listen(1)

print(f"Listening on {SERVER_IP}:{SERVER_PORT}...")

conn, addr = serverSocket.accept()
print(f"Connection from {addr} established!")

try:
    while True:
        for channel in channels:
            # Initialize a dictionary to store all responses for a channel
            data = {'channel': channel}

            for command_template in commands:
                command = command_template.format(channel)
                print(f"Sending command: {command}")  # Debugging output

                # Send command to Smytec module using ASCII encoding
                serCommInstance.write((command + '\r').encode('ascii'))
                time.sleep(5)  # Wait for the response

                # Read response from Smytec module
                response = ""
                while serCommInstance.in_waiting > 0:
                    response += serCommInstance.read(serCommInstance.in_waiting).decode('ascii')

                if response:
                    response = response.strip()
                    print(f"Raw response: {response}")

                    # Handle echoed command
                    if response.startswith(command):
                        response = response[len(command):].strip()

                    print( f"The length of the response is: {len(response)}" )

                    if response:
                        print(f"Processed data: {response}")
                        # Add response to data dictionary
                        data[command_template] = response
                    else:
                        print(f"No meaningful data received for command: {command}")
                else:
                    print(f"No response received for command: {command}")

            # Convert data to JSON
            json_data = json.dumps(data)
            print(f"Sending JSON data: {json_data}")

            # Send JSON data over the socket
            conn.sendall(json_data.encode('ascii'))
except KeyboardInterrupt:
    print("Stopping server.")
finally:
    conn.close()
    serCommInstance.close()
    serverSocket.close()

