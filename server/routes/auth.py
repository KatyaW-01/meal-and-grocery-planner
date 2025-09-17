"""
Authentication routes blueprint.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError
from marshmallow import ValidationError
from ..extensions import db, bcrypt
from ..models import User, UserSchema

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    signup_data = request.get_json()
    username = signup_data.get('username')
    name = signup_data.get('name')
    password = signup_data.get('password')
    try:
        # Validate input
        UserSchema().load(signup_data)
        # Create user instance
        user = User(username=username, name=name)
        user.password = password
        db.session.add(user)
        db.session.commit()
        # Create access token
        access_token = create_access_token(identity=user.id)
        response_data = {
            'user': UserSchema(exclude=['password']).dump(user),
            'access_token': access_token
        }
        return response_data, 201
    except ValidationError as e:
        return {'error': e.messages}, 400
    except IntegrityError:
        db.session.rollback()
        return {'error': 'Username already exists'}, 400

@auth_bp.route('/login', methods=['POST'])
def login():
    login_data = request.get_json()
    username = login_data.get('username')
    password = login_data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and user.authenticate(password):
        access_token = create_access_token(identity=user.id)
        response_data = {
            'user': UserSchema(exclude=['password']).dump(user),
            'access_token': access_token
        }
        return response_data, 200
    else:
        return {'error': 'Invalid username or password'}, 401

@auth_bp.route('/check_session', methods=['GET'])
@jwt_required()
def check_session():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user:
        return UserSchema(exclude=['password']).dump(user), 200
    else:
        return {'error': 'User not found'}, 404

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWT tokens are stateless, so we just return success
    # Client should remove the token from storage
    return {'message': 'Logout successful'}, 200