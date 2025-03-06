import os
import shutil

def setup_project():
    # Current project root directory
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create directory structure
    directories = [
        'backend/api',
        'backend/detection',
        'frontend/public',
        'frontend/src/components',
        'data',
        'images',
        'videos'
    ]
    
    for directory in directories:
        os.makedirs(os.path.join(root_dir, directory), exist_ok=True)

    # Move existing files to their new locations
    file_moves = [
        ('../motion_detector.py', 'backend/detection/'),
        ('../coordinates_generator.py', 'backend/detection/'),
        ('../colors.py', 'backend/detection/'),
        ('../drawing_utils.py', 'backend/detection/'),
        ('../main.py', 'backend/detection/'),
        ('../data/coordinates_1.yml', 'data/'),
        ('../images/parking_lot_3.png', 'images/'),
        ('../videos/parking_lot_4.mp4', 'videos/')
    ]

    for src, dest in file_moves:
        src_path = os.path.join(root_dir, src)
        dest_path = os.path.join(root_dir, dest)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            print(f"Moved {src} to {dest}")

    # Create new files
    create_backend_files(root_dir)
    create_frontend_files(root_dir)
    create_requirements(root_dir)

def create_backend_files(root_dir):
    # Create __init__.py files
    open(os.path.join(root_dir, 'backend/api/__init__.py'), 'w').close()
    open(os.path.join(root_dir, 'backend/detection/__init__.py'), 'w').close()

    # Create app.py
    with open(os.path.join(root_dir, 'backend/app.py'), 'w') as f:
        f.write('''from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from api.routes import api_bp

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.register_blueprint(api_bp, url_prefix='/api')

if __name__ == '__main__':
    socketio.run(app, debug=True)
''')

    # Create routes.py
    with open(os.path.join(root_dir, 'backend/api/routes.py'), 'w') as f:
        f.write('''from flask import Blueprint, jsonify
from flask_socketio import emit
from ..detection.motion_detector import MotionDetector
import yaml

api_bp = Blueprint('api', __name__)

@api_bp.route('/parking-status')
def get_parking_status():
    with open("data/coordinates_1.yml", "r") as data:
        points = yaml.load(data, Loader=yaml.SafeLoader)
        detector = MotionDetector("videos/parking_lot_4.mp4", points, 400)
        return jsonify({
            "status": "success",
            "data": detector.get_all_spaces()
        })
''')

def create_frontend_files(root_dir):
    # Create public directory with index.html
    public_dir = os.path.join(root_dir, 'frontend/public')
    with open(os.path.join(public_dir, 'index.html'), 'w') as f:
        f.write('''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Smart Parking System" />
    <title>Smart Parking System</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
''')

    # Create src directory with index.js
    src_dir = os.path.join(root_dir, 'frontend/src')
    with open(os.path.join(src_dir, 'index.js'), 'w') as f:
        f.write('''import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
''')

    # Create index.css
    with open(os.path.join(src_dir, 'index.css'), 'w') as f:
        f.write('''body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  text-align: center;
  padding: 20px;
}

.parking-lot {
  margin: 20px auto;
  max-width: 800px;
}

.status-panel {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 600px;
}
''')

    # Update package.json to include all necessary dependencies
    with open(os.path.join(root_dir, 'frontend/package.json'), 'w') as f:
        f.write('''{
  "name": "parking-system-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "socket.io-client": "^4.5.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}''')

    # Create main React components
    components = {
        'ParkingLot.js': '''import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const ParkingLot = () => {
  const [spaces, setSpaces] = useState({});

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('status_update', (data) => {
      setSpaces(data);
    });
    return () => socket.close();
  }, []);

  return (
    <div className="parking-lot">
      <h2>Parking Lot View</h2>
      {/* Add parking space visualization here */}
    </div>
  );
};

export default ParkingLot;
''',
        'StatusPanel.js': '''import React from 'react';

const StatusPanel = ({ total, available, occupied }) => {
  return (
    <div className="status-panel">
      <div>Total Spaces: {total}</div>
      <div>Available: {available}</div>
      <div>Occupied: {occupied}</div>
    </div>
  );
};

export default StatusPanel;
'''
    }

    components_dir = os.path.join(root_dir, 'frontend/src/components')
    for filename, content in components.items():
        with open(os.path.join(components_dir, filename), 'w') as f:
            f.write(content)

def create_requirements(root_dir):
    with open(os.path.join(root_dir, 'requirements.txt'), 'w') as f:
        f.write('''flask==2.0.1
flask-cors==3.0.10
flask-socketio==5.1.1
opencv-python==4.5.3.56
numpy==1.21.2
pyyaml==5.4.1
python-engineio==4.2.1
python-socketio==5.4.0
''')

if __name__ == "__main__":
    setup_project()
    print("Project structure and files created successfully!") 