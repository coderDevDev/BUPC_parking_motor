from flask import Blueprint, jsonify, Response, request
from backend.detection.motion_detector import MotionDetector
from backend.detection.colors import COLOR_GREEN, COLOR_WHITE, COLOR_BLUE
import yaml
import cv2
import threading
import base64
import time
import os
from datetime import datetime
from ..models import db, VehicleEntry

api = Blueprint('api', __name__)

# Initialize detector globally
detector = None
detection_thread = None
is_detecting = False
current_frame = None
current_status = None

def init_detector():
    global detector
    if detector is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        data_file = os.path.join(base_dir, "data", "coordinates_1.yml")
        video_file = os.path.join(base_dir, "videos", "parking_lot_4.mp4")
        
        with open(data_file, "r") as data:
            points = yaml.load(data, Loader=yaml.SafeLoader)
            detector = MotionDetector(video_file, points, 400)
    return detector

def detection_loop():
    global is_detecting, current_frame, current_status
    try:
        detector = init_detector()
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        video_file = os.path.join(base_dir, "videos", "parking_lot_4.mp4")
        
        print(f"Starting video capture from: {video_file}")
        cap = cv2.VideoCapture(video_file)
        if not cap.isOpened():
            print(f"Error: Could not open video file: {video_file}")
            return

        # Optimize video capture settings
        cap.set(cv2.CAP_PROP_POS_FRAMES, 400)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 3)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_delay = 1.0 / 30  # Lock to 30 FPS for smooth playback
        
        frame_count = 0
        last_time = time.time()
        detection_interval = 2  # Process every 2nd frame for detection
        encode_params = [
            int(cv2.IMWRITE_JPEG_QUALITY), 85,
            int(cv2.IMWRITE_JPEG_OPTIMIZE), 1
        ]

        while is_detecting:
            try:
                current_time = time.time()
                elapsed = current_time - last_time
                
                if elapsed < frame_delay:
                    time.sleep(max(0, frame_delay - elapsed))
                    continue

                success, frame = cap.read()
                if not success:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 400)
                    continue

                # Resize frame for better performance while maintaining quality
                height, width = frame.shape[:2]
                if width > 1280:  # Only resize if larger than 1280px
                    scale = 1280 / width
                    new_width = 1280
                    new_height = int(height * scale)
                    frame = cv2.resize(frame, (new_width, new_height), 
                                    interpolation=cv2.INTER_AREA)

                # Process detection every few frames
                if frame_count % detection_interval == 0:
                    spaces_status = detector.process_frame(frame.copy())
                    current_status = {
                        'spaces': spaces_status,
                        'total_spaces': detector.total_spaces,
                        'available_spaces': detector.free_spaces,
                        'occupied_spaces': detector.occupied_spaces
                    }

                # Draw parking space markers on the frame
                frame_with_markers = frame.copy()
                for idx, p in enumerate(detector.coordinates_data):
                    coordinates = detector._coordinates(p)
                    color = COLOR_GREEN if detector.statuses[idx] else COLOR_BLUE
                    cv2.drawContours(frame_with_markers, [coordinates], -1, color, 2)
                    moments = cv2.moments(coordinates)
                    center = (
                        int(moments["m10"] / moments["m00"]),
                        int(moments["m01"] / moments["m00"])
                    )
                    cv2.putText(
                        frame_with_markers,
                        str(p["id"] + 1),
                        center,
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        COLOR_WHITE,
                        2
                    )

                # Convert frame to base64 efficiently
                _, buffer = cv2.imencode('.jpg', frame_with_markers, encode_params)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Update current frame and merge with latest status
                if current_status:
                    current_status['frame'] = frame_base64
                else:
                    current_status = {'frame': frame_base64}
                
                frame_count += 1
                if frame_count % 100 == 0:
                    print(f"Processed {frame_count} frames, FPS: {1.0/elapsed:.2f}")
                
                last_time = current_time

            except Exception as e:
                print(f"Error processing frame: {e}")
                time.sleep(0.01)

    except Exception as e:
        print(f"Detection loop error: {e}")
    finally:
        if 'cap' in locals():
            cap.release()
        print("Detection stopped")

@api.route('/frame')
def get_frame():
    if current_status:
        return jsonify(current_status)
    return jsonify({'error': 'No frame available'}), 404

@api.route('/parking-status')
def get_parking_status():
    detector = init_detector()
    return jsonify({
        "status": "success",
        "data": {
            "total_spaces": detector.total_spaces,
            "available_spaces": detector.free_spaces,
            "occupied_spaces": detector.occupied_spaces,
            "spaces": detector.get_current_status()
        }
    })

@api.route('/start-detection')
def start_detection():
    global detection_thread, is_detecting
    if not is_detecting:
        is_detecting = True
        detection_thread = threading.Thread(target=detection_loop)
        detection_thread.start()
    return jsonify({"status": "success", "message": "Detection started"})

@api.route('/stop-detection')
def stop_detection():
    global is_detecting
    is_detecting = False
    if detection_thread:
        detection_thread.join()
    return jsonify({"status": "success", "message": "Detection stopped"})

@api.route('/vehicle-entries', methods=['GET'])
def get_entries():
    entries = VehicleEntry.query.order_by(VehicleEntry.created_at.desc()).all()
    return jsonify([{
        'id': entry.id,
        'ticketNumber': entry.ticket_number,
        'plateNumber': entry.plate_number,
        'vehicleType': entry.vehicle_type,
        'entryTime': entry.entry_time.strftime('%H:%M'),
        'date': entry.entry_time.strftime('%Y-%m-%d'),
        'parkingSlot': entry.parking_slot,
        'driverName': entry.driver_name,
        'contactNumber': entry.contact_number,
        'status': entry.status
    } for entry in entries])

@api.route('/vehicle-entries', methods=['POST'])
def create_entry():
    data = request.json
    
    new_entry = VehicleEntry(
        ticket_number=data['ticketNumber'],
        plate_number=data['plateNumber'],
        vehicle_type=data['vehicleType'],
        entry_time=datetime.now(),
        parking_slot=data['parkingSlot'],
        driver_name=data['driverName'],
        contact_number=data['contactNumber']
    )
    
    try:
        db.session.add(new_entry)
        db.session.commit()
        return jsonify({
            'message': 'Entry created successfully',
            'entry': {
                'id': new_entry.id,
                'ticketNumber': new_entry.ticket_number,
                'plateNumber': new_entry.plate_number,
                'vehicleType': new_entry.vehicle_type,
                'entryTime': new_entry.entry_time.strftime('%H:%M'),
                'date': new_entry.entry_time.strftime('%Y-%m-%d'),
                'parkingSlot': new_entry.parking_slot,
                'driverName': new_entry.driver_name,
                'contactNumber': new_entry.contact_number,
                'status': new_entry.status
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/vehicle-entries/<int:entry_id>', methods=['PUT'])
def update_entry(entry_id):
    entry = VehicleEntry.query.get_or_404(entry_id)
    data = request.json
    
    try:
        if 'status' in data:
            entry.status = data['status']
            if data['status'] == 'Completed':
                entry.exit_time = datetime.now()
        
        db.session.commit()
        return jsonify({'message': 'Entry updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api.route('/vehicle-entries/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    entry = VehicleEntry.query.get_or_404(entry_id)
    
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({'message': 'Entry deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
