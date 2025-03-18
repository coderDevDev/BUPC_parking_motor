class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/parking_system'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'your-secret-key'
    VIDEO_PATH = '../videos/parking_lot_4.mp4'
    COORDINATES_PATH = '../data/coordinates_1.yml'
    START_FRAME = 400 