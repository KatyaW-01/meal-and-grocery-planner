"""
Recipe routes blueprint.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from ..extensions import db
from ..models import Recipe, RecipeSchema, User
import requests
import os

recipes_bp = Blueprint('recipes', __name__)
api_key = os.getenv('SPOONACULAR_API_KEY')

@recipes_bp.route('/recipes', methods=['GET'])
@jwt_required()
def get_recipes():
    current_user_id = get_jwt_identity()
    recipes = Recipe.query.filter_by(user_id=current_user_id).all()
    return jsonify(RecipeSchema(many=True).dump(recipes)), 200

@recipes_bp.route('/recipes', methods=['POST'])
@jwt_required()
def create_recipe():
    current_user_id = get_jwt_identity()
    recipe_data = request.get_json()
    
    try:
        # Set the user_id
        recipe_data['user_id'] = current_user_id
        # Validate and deserialize
        recipe = RecipeSchema().load(recipe_data, session=db.session)
        db.session.add(recipe)
        db.session.commit()
        return RecipeSchema().dump(recipe), 201
    except ValidationError as e:
        return {'error': e.messages}, 400
    except IntegrityError as e:
        db.session.rollback()
        return {'error': 'Database error occurred'}, 400

@recipes_bp.route('/recipes/<int:recipe_id>', methods=['GET'])
@jwt_required()
def get_recipe(recipe_id):
    current_user_id = get_jwt_identity()
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=current_user_id).first()
    if recipe:
        return RecipeSchema().dump(recipe), 200
    else:
        return {'error': 'Recipe not found'}, 404

@recipes_bp.route('/recipes/<int:recipe_id>', methods=['PATCH'])
@jwt_required()
def update_recipe(recipe_id):
    current_user_id = get_jwt_identity()
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=current_user_id).first()
    
    if not recipe:
        return {'error': 'Recipe not found'}, 404
    
    recipe_data = request.get_json()
    try:
        # Update recipe fields
        for field, value in recipe_data.items():
            if hasattr(recipe, field) and field not in ['id', 'user_id']:
                setattr(recipe, field, value)
        
        db.session.commit()
        return RecipeSchema().dump(recipe), 200
    except ValidationError as e:
        return {'error': e.messages}, 400

@recipes_bp.route('/recipes/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe(recipe_id):
    current_user_id = get_jwt_identity()
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=current_user_id).first()
    
    if not recipe:
        return {'error': 'Recipe not found'}, 404
    
    db.session.delete(recipe)
    db.session.commit()
    return '', 204

# Spoonacular API endpoints
@recipes_bp.route('/recipes/search', methods=['GET'])
def search_recipes():
    query = request.args.get('query', '')
    url = 'https://api.spoonacular.com/recipes/complexSearch'
    params = {
        "apiKey": api_key,
        "query": query,
        "number": 10,
        "addRecipeInformation": True
    }
    response = requests.get(url, params=params)
    return response.json(), response.status_code

@recipes_bp.route('/recipes/information/<int:recipe_id>', methods=['GET'])
def get_recipe_information(recipe_id):
    url = f'https://api.spoonacular.com/recipes/{recipe_id}/information'
    params = {"apiKey": api_key}
    response = requests.get(url, params=params)
    return response.json(), response.status_code