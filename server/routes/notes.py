"""
Recipe notes routes blueprint.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from ..extensions import db
from ..models import RecipeNote, RecipeNoteSchema, Recipe

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/recipe_notes', methods=['GET'])
@jwt_required()
def get_recipe_notes():
    current_user_id = get_jwt_identity()
    recipe_id = request.args.get('recipe_id')
    
    if recipe_id:
        # Check if user owns this recipe
        recipe = Recipe.query.filter_by(id=recipe_id, user_id=current_user_id).first()
        if not recipe:
            return {'error': 'Recipe not found'}, 404
        notes = RecipeNote.query.filter_by(recipe_id=recipe_id).all()
    else:
        # Get all notes for user's recipes
        notes = RecipeNote.query.join(Recipe).filter(Recipe.user_id == current_user_id).all()
    
    return jsonify(RecipeNoteSchema(many=True).dump(notes)), 200

@notes_bp.route('/recipe_notes', methods=['POST'])
@jwt_required()
def create_recipe_note():
    current_user_id = get_jwt_identity()
    note_data = request.get_json()
    recipe_id = note_data.get('recipe_id')
    
    # Verify user owns the recipe
    recipe = Recipe.query.filter_by(id=recipe_id, user_id=current_user_id).first()
    if not recipe:
        return {'error': 'Recipe not found'}, 404
    
    try:
        note = RecipeNoteSchema().load(note_data, session=db.session)
        db.session.add(note)
        db.session.commit()
        return RecipeNoteSchema().dump(note), 201
    except ValidationError as e:
        return {'error': e.messages}, 400
    except IntegrityError:
        db.session.rollback()
        return {'error': 'Database error occurred'}, 400

@notes_bp.route('/recipe_notes/<int:note_id>', methods=['GET'])
@jwt_required()
def get_recipe_note(note_id):
    current_user_id = get_jwt_identity()
    note = RecipeNote.query.join(Recipe).filter(
        RecipeNote.id == note_id,
        Recipe.user_id == current_user_id
    ).first()
    
    if note:
        return RecipeNoteSchema().dump(note), 200
    else:
        return {'error': 'Note not found'}, 404

@notes_bp.route('/recipe_notes/<int:note_id>', methods=['PATCH'])
@jwt_required()
def update_recipe_note(note_id):
    current_user_id = get_jwt_identity()
    note = RecipeNote.query.join(Recipe).filter(
        RecipeNote.id == note_id,
        Recipe.user_id == current_user_id
    ).first()
    
    if not note:
        return {'error': 'Note not found'}, 404
    
    note_data = request.get_json()
    try:
        for field, value in note_data.items():
            if hasattr(note, field) and field not in ['id', 'recipe_id']:
                setattr(note, field, value)
        
        db.session.commit()
        return RecipeNoteSchema().dump(note), 200
    except ValidationError as e:
        return {'error': e.messages}, 400

@notes_bp.route('/recipe_notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe_note(note_id):
    current_user_id = get_jwt_identity()
    note = RecipeNote.query.join(Recipe).filter(
        RecipeNote.id == note_id,
        Recipe.user_id == current_user_id
    ).first()
    
    if not note:
        return {'error': 'Note not found'}, 404
    
    db.session.delete(note)
    db.session.commit()
    return '', 204