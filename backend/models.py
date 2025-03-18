from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class VehicleEntry(db.Model):
    __tablename__ = 'vehicle_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)
    plate_number = db.Column(db.String(20), nullable=False)
    vehicle_type = db.Column(db.String(20), nullable=False)
    entry_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    exit_time = db.Column(db.DateTime, nullable=True)
    parking_slot = db.Column(db.Integer, nullable=False)
    driver_name = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='Active')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) 