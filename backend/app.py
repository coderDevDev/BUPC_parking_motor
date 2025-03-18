from flask import Flask
from flask_cors import CORS
import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.config import Config
from backend.models import db
from backend.api.routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
    
    app.register_blueprint(api, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    print("Starting server on http://localhost:5000")
    app = create_app()
    app.run(debug=True, port=5000, host='0.0.0.0', threaded=True)
