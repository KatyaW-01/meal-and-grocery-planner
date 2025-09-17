"""
Ingredient routes blueprint.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from ..extensions import db
from ..models import Ingredient, IngredientSchema, Recipe

ingredients_bp = Blueprint('ingredients', __name__)

@ingredients_bp.route('/ingredients', methods=['GET'])
@jwt_required()
def get_ingredients():
    current_user_id = get_jwt_identity()
    recipe_id = request.args.get('recipe_id')
    
    if recipe_id:
        # Check if user owns this recipe
        recipe = Recipe.query.filter_by(id=recipe_id, user_id=current_user_id).first()
        if not recipe:
            return {'error': 'Recipe not found'}, 404
        ingredients = Ingredient.query.filter_by(recipe_id=recipe_id).all()
    else:
        # Get all ingredients for user's recipes
        ingredients = Ingredient.query.join(Recipe).filter(Recipe.user_id == current_user_id).all()
    
    return jsonify(IngredientSchema(many=True).dump(ingredients)), 200

@ingredients_bp.route('/ingredients', methods=['POST'])
@jwt_required()
def create_ingredient():
    current_user_id = get_jwt_identity()
    ingredient_data = request.get_json()
    recipe_id = ingredient_data.get('recipe_id')
    
    # Verify user owns the recipe
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=current_user_id).first()
    if not recipe:
        return {'error': 'Recipe not found'}, 404
    
    try:
        ingredient = IngredientSchema().load(ingredient_data, session=db.session)
        db.session.add(ingredient)
        db.session.commit()
        return IngredientSchema().dump(ingredient), 201
    except ValidationError as e:
        return {'error': e.messages}, 400
    except IntegrityError:
        db.session.rollback()
        return {'error': 'Database error occurred'}, 400

@ingredients_bp.route('/ingredients/<int:ingredient_id>', methods=['GET'])
@jwt_required()
def get_ingredient(ingredient_id):
    current_user_id = get_jwt_identity()
    ingredient = Ingredient.query.join(Recipe).filter(
        Ingredient.id == ingredient_id,
        Recipe.user_id == current_user_id
    ).first()
    
    if ingredient:
        return IngredientSchema().dump(ingredient), 200
    else:
        return {'error': 'Ingredient not found'}, 404

@ingredients_bp.route('/ingredients/<int:ingredient_id>', methods=['PATCH'])
@jwt_required()
def update_ingredient(ingredient_id):
    current_user_id = get_jwt_identity()
    ingredient = Ingredient.query.join(Recipe).filter(
        Ingredient.id == ingredient_id,
        Recipe.user_id == current_user_id
    ).first()
    
    if not ingredient:
        return {'error': 'Ingredient not found'}, 404
    
    ingredient_data = request.get_json()
    try:
        for field, value in ingredient_data.items():
            if hasattr(ingredient, field) and field not in ['id', 'recipe_id']:
                setattr(ingredient, field, value)
        
        db.session.commit()
        return IngredientSchema().dump(ingredient), 200
    except ValidationError as e:
        return {'error': e.messages}, 400

@ingredients_bp.route('/ingredients/<int:ingredient_id>', methods=['DELETE'])
@jwt_required()
def delete_ingredient(ingredient_id):
    current_user_id = get_jwt_identity()
    ingredient = Ingredient.query.join(Recipe).filter(
        Ingredient.id == ingredient_id,
        Recipe.user_id == current_user_id
    ).first()
    
    if not ingredient:
        return {'error': 'Ingredient not found'}, 404
    
    db.session.delete(ingredient)
    db.session.commit()
    return '', 204