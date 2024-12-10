import socket
import json
import time
import serial

# Serial Port Configuration
SERIAL_PORT = '/dev/ttyUSB0'
BAUD_RATE = 9600
TIMEOUT = 1

def generate_commands(data):
    """
    Generate commands from the JSON data based on MHV-4 command specifications.
    """
    commands = []
    
    for key, value in data.items():
        if value:  # Only process non-empty values
            print("Processing instruction for:", value)
            command = ''
            if key.startswith('sra'):
                command = f'SRA {value}' if 'SRA' not in value else value  # Set HV ramp speed
            elif key.startswith('asc'):
                channel = key[3]  # Extract channel number
                command = f'AS {channel} {value}' if 'AS' not in value else value  # Auto shutdown
            elif key.startswith('spc'):
                channel = key[3]  # Extract channel number
                command = f'SP {channel} {value}' if 'SP' not in value else value  # Set polarity
            elif key.startswith('sto'):
                channel = key[3]  # Extract channel number
                temperature = value  # Temperature in 0.1 °C
                command = f'STO {channel} {temperature}' if 'STO' not in value else value  # Set reference temperature
            elif key.startswith('sts'):
                channel = key[3]  # Extract channel number
                slope = value  # Slope in mV/°C
                command = f'STS {channel} {slope}' if 'STS' not in value else value  # Set temperature compensation slope
            elif key.startswith('stc'):
                channel = key[3]  # Extract channel number
                ntc_channel = value  # NTC channel
                command = f'STC {channel} {ntc_channel}' if 'STC' not in value else value  # Set temperature compensation
            elif key.startswith('sul'):
                channel = key[3]  # Extract channel number
                voltage = value  # Voltage limit in 0.1 V
                command = f'SUL {channel} {voltage}' if 'SUL' not in value else value  # Set voltage limit
            elif key.startswith('sil'):
                channel = key[3]  # Extract channel number
                current = value  # Current limit in nA
                command = f'SIL {channel} {current}' if 'SIL' not in value else value  # Set current limit
            elif key.startswith('su'):
                channel = key[2]  # Extract channel number
                voltage = value  # Voltage in 0.1 V
                command = f'SU {channel} {voltage}' if 'SU' not in value else value  # Set voltage
            elif key.startswith('onc'):
                channel = key[2]  # Extract channel number
                command = f'ON {channel}' if 'ON' not in value else value  # Switch channel on
            elif key.startswith('offc'):
                channel = key[2]  # Extract channel number
                command = f'OFF {channel}' if 'OFF' not in value else value  # Switch channel off

            # Add the command if it's valid
            if command:
                commands.append(command)
    return commands

def send_commands(commands):
    """
    Send commands to the serial port.
    """
    try:
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=TIMEOUT) as ser:
            for command in commands:
                print(f'Sending command: {command}')
                ser.write((command + '\r').encode('ascii'))  # Write command to serial port
                time.sleep(1)  # Wait for the response

                # Read response from Smytec module
                response = ""
                while ser.in_waiting > 0:
                    response += ser.read(ser.in_waiting).decode('ascii')

                if response:
                    response = response.strip()
                    print(f"Raw response: {response}")

                    # Handle echoed command
                    if response.startswith(command):
                        response = response[len(command):].strip()

                    print(f'Received response: {response}')
                else:
                    print(f"No response received for command: {command}")
    except serial.SerialException as e:
        print(f'Error: {e}')

def start_server():
    host = '0.0.0.0'  # All network interfaces are listened to
    port = 5010
    
    server_socket = None
    client_socket = None

    try:
        # Socket object
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.bind((host, port))
        server_socket.listen(1)
        print(f"Server listening on: {host}:{port}")

        while True:
            client_socket, addr = server_socket.accept()
            print(f"Connection from {addr}")

            try:
                data = client_socket.recv(1024).decode('utf-8')
                print(f"Received data: {data}")
                dataAsJSON = json.loads(data)
                commands = generate_commands(dataAsJSON)
                send_commands(commands)
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
            except Exception as e:
                print(f"Unexpected error: {e}")
            finally:
                if client_socket:
                    client_socket.close()

    except KeyboardInterrupt:
        print("Server interrupted by user.")
    except Exception as e:
        print(f"Server error: {e}")
    finally:
        if server_socket:
            server_socket.close()

if __name__ == "__main__":
    start_server()