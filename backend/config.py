class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/parking_system'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'your-secret-key'
    
    # Video Source Configuration
    # Properly format the RTSP URL
    CAMERA_USERNAME = "MirandaFam@123"
    CAMERA_PASSWORD = "MirandaFam@123"
    CAMERA_IP = "192.168.1.4"
    CAMERA_PORT = "554"
    CAMERA_STREAM = "stream1"

    # Construct the RTSP URL with proper URL encoding
    VIDEO_PATH = f"rtsp://{CAMERA_USERNAME}:{CAMERA_PASSWORD}@{CAMERA_IP}:{CAMERA_PORT}/{CAMERA_STREAM}"
    VIDEO_SOURCE = VIDEO_PATH
    
    # Parking space coordinates
    COORDINATES_PATH = '../data/coordinates_1.yml'
    START_FRAME = 0  # For RTSP, start from beginning
    
    # RTSP Stream Settings
    RTSP_BUFFER_SIZE = 1
    RTSP_LATENCY = 60  # milliseconds 