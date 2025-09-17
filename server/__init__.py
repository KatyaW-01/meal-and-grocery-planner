"""
Flask application factory pattern implementation.
"""
from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_restful import Api
import os
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env.local')
load_dotenv(env_path)

# Initialize extensions  
from .extensions import db, bcrypt
migrate = Migrate()

def create_app(config_name='development'):
    """Application factory pattern - Flask best practice"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv('SECRET_KEY')
    app.json.compact = False
    
    # Initialize extensions with app
    db.init_app(app)
    bcrypt.init_app(app)
    
    # Initialize other extensions - configure migrations directory
    migrate.init_app(app, db, directory=os.path.join(os.path.dirname(__file__), 'migrations'))
    JWTManager(app)
    Api(app)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.recipes import recipes_bp
    from .routes.ingredients import ingredients_bp
    from .routes.notes import notes_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(recipes_bp)
    app.register_blueprint(ingredients_bp)
    app.register_blueprint(notes_bp)
    
    # Add CORS headers
    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS'
        return response
    
    return app