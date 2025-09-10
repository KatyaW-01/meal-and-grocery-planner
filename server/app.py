from flask_migrate import Migrate
from flask import Flask, request, jsonify, make_response
import requests
from flask_restful import Resource, Api
from sqlalchemy.exc import IntegrityError
from server.extensions import db, bcrypt
from flask_jwt_extended import  JWTManager, create_access_token, get_jwt_identity, jwt_required
import os
from dotenv import load_dotenv
from marshmallow import ValidationError

load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] =  os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = os.getenv('SECRET_KEY')
app.json.compact = False

db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
jwt = JWTManager(app)

api_key = os.getenv('SPOONACULAR_API_KEY')

@app.route('/signup', methods=['POST'])
def signup():
  from server.models import User, UserSchema
  signup_data = request.get_json()
  username = signup_data.get('username')
  name = signup_data.get('name')
  password = signup_data.get('password')
  try:
    #validate input, this will trigger any validation errors 
    UserSchema().load(signup_data)
    #create user instance
    user = User(username = username, name = name)
    user.password = password
    db.session.add(user)
    db.session.commit()
    #create a JSON Web Token
    access_token = create_access_token(identity=str(user.id))
    return make_response(jsonify(token = access_token, user = UserSchema().dump(user)), 200)
  except ValidationError as err:
    return{'error': err.messages},400
  except IntegrityError:
    return {'error': ['Oops! That username is already taken']}, 422

@app.route('/login', methods=['POST'])
def login():
  from server.models import User, UserSchema
  
  login_data = request.get_json()
  username = login_data.get('username')
  password = login_data.get('password')

  user = User.query.filter(User.username == username).first()

  if user and user.authenticate(password):
    access_token = create_access_token(identity=str(user.id))
    response = make_response(jsonify(token = access_token, user = UserSchema().dump(user)),200)
    return response
  return {'error': ['Incorrect username or password']}, 401

@app.route('/me', methods=['GET'])
@jwt_required()
def check_session():
  from server.models import User, UserSchema
  user_id = get_jwt_identity()
  user = User.query.filter(User.id == user_id).first()
  response = make_response(UserSchema().dump(user))
  return response
  
#get all recipes for a user
@app.route('/api/recipes', methods=['GET'])
@jwt_required()
def get_recipes():
  from server.models import Recipe, RecipeSchema
  user_id = get_jwt_identity()
  recipes = Recipe.query.filter(Recipe.user_id == user_id).all()
  return RecipeSchema(many=True).dump(recipes), 200

#create a recipe
@app.route('/api/recipes', methods=['POST'])
@jwt_required()
def create_recipes():
  from server.models import Recipe, RecipeSchema
  data = request.get_json()
  try:
    recipe_data = RecipeSchema().load(data)
    recipe = Recipe(
    title = recipe_data.get('title'), 
    instructions = recipe_data.get('instructions'),
    date = recipe_data.get('date'),
    user_id = get_jwt_identity()
    )
    db.session.add(recipe)
    db.session.commit()
    return RecipeSchema().dump(recipe), 201
  except ValidationError as err:
    return {'error': err.messages}, 400
  except IntegrityError:
    return {'error': ['error creating recipe']}, 422
  
#get a recipe by id
@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
@jwt_required()
def get_one_recipe(recipe_id):
  from server.models import Recipe, RecipeSchema
  user_id = get_jwt_identity()
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": ["Recipe not found"]}, 404
  return RecipeSchema().dump(recipe), 200
  
#update a recipe
@app.route('/api/recipes/<int:recipe_id>', methods=['PATCH'])
@jwt_required()
def update_a_recipe(recipe_id):
  from server.models import Recipe, RecipeSchema
  user_id = get_jwt_identity()
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": "Recipe not found"}, 404
  data = request.get_json()
  schema = RecipeSchema(partial=True)
  try:
    validated_data = schema.load(data)
  except ValidationError as err:
    return {'error': err.messages}, 400
  
  if 'title' in validated_data:
    recipe.title = validated_data['title']
  if 'instructions' in validated_data:
    recipe.instructions = validated_data['instructions']
  if 'date' in validated_data:
    recipe.date = validated_data['date']

  db.session.commit()
  return {'message': f'Recipe {recipe_id} updated successfully'}, 200

#delete a recipe
@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_a_recipe(recipe_id):
  from server.models import Recipe
  user_id = get_jwt_identity()
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": ["Recipe not found"]}, 404
  db.session.delete(recipe)
  db.session.commit()
  return {'message': f'Recipe {recipe_id} deleted successfully'}, 200

#create an ingredient
@app.route('/api/recipes/<int:recipe_id>/ingredients', methods=['POST'])
@jwt_required()
def create_an_ingredient(recipe_id):
  from server.models import Ingredient, IngredientSchema, Recipe
  data = request.get_json()
  user_id = get_jwt_identity()
  #make sure recipe belongs to the user
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": ["Recipe not found"]}, 404
  #if recipe does belong to the user, try to make the post request
  try:
    ingredient_data = IngredientSchema().load(data)
    ingredient = Ingredient(
      name = ingredient_data.get('name'),
      quantity = ingredient_data.get('quantity'),
      quantity_description = ingredient_data.get('quantity_description'),
      checked_off = False,
      recipe_id = recipe_id
    )
    db.session.add(ingredient)
    db.session.commit()
    return IngredientSchema().dump(ingredient), 201
  except ValidationError as err:
    return {'error': err.messages}, 400
  except IntegrityError:
    return {'error': ['error creating ingredient']}, 422
  
#edit an ingredient
@app.route('/api/recipes/<int:recipe_id>/ingredients/<int:id>', methods=['PATCH'])
@jwt_required()
def update_an_ingredient(recipe_id,id):
  from server.models import Ingredient, IngredientSchema, Recipe
  user_id = get_jwt_identity()
  #ensure recipe is connected to the user
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": f"Recipe {recipe_id} not found"}, 404
  ingredient = Ingredient.query.filter(Ingredient.id == id, Ingredient.recipe_id == recipe_id).first()
  if not ingredient:
    return {"error": f"Ingredient {id} not found"}, 404
  data = request.get_json()
  schema = IngredientSchema(partial=True)
  try: 
    validated_data = schema.load(data)
  except ValidationError as err:
    return {'error': err.messages}, 400
  
  if 'name' in validated_data:
    ingredient.name = validated_data['name']
  if 'quantity' in validated_data:
    ingredient.quantity = validated_data['quantity']
  if 'quantity_description' in validated_data:
    ingredient.quantity_description = validated_data['quantity_description']
  if 'checked_off' in validated_data:
    ingredient.checked_off = validated_data['checked_off']
  db.session.commit()
  return {'message': f'Ingredient {id} updated successfully'}, 200

#delete an ingredient
@app.route('/api/recipes/<int:recipe_id>/ingredients/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_an_ingredient(recipe_id,id):
  from server.models import Ingredient, Recipe
  user_id = get_jwt_identity()
  #make sure user can't delete someone else's ingredient
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": f"Recipe {recipe_id} not found"}, 404
  #check that ingredient exists
  ingredient = Ingredient.query.filter(Ingredient.id == id, Ingredient.recipe_id == recipe_id).first()
  if not ingredient:
    return {"error": f"Ingredient {id} not found"}, 404
  db.session.delete(ingredient)
  db.session.commit()
  return {'message': f'Ingredient {id} deleted successfully'}, 200

#create a note and add to a recipe
@app.route('/api/recipes/<int:recipe_id>/notes', methods=['POST'])
@jwt_required()
def create_a_note(recipe_id):
  from server.models import RecipeNote, RecipeNoteSchema, Recipe
  data = request.get_json()
  user_id = get_jwt_identity()
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": "Recipe not found"}, 404
  try:
    note_data = RecipeNoteSchema().load(data)
    note = RecipeNote(
      note = note_data.get('note'),
      date = note_data.get('date'),
      recipe_id = recipe_id
    )
    db.session.add(note)
    db.session.commit()
    return RecipeNoteSchema().dump(note), 201
  except ValidationError as err:
    return {'error': err.messages}, 400
  except IntegrityError:
    return {'error': 'error creating note'}, 422
  
#edit a note
@app.route('/api/recipes/<int:recipe_id>/notes/<int:id>', methods=['PATCH'])
@jwt_required()
def patch(recipe_id,id):
  from server.models import RecipeNote, RecipeNoteSchema, Recipe
  user_id = get_jwt_identity()
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": f"Recipe {recipe_id} not found"}, 404
  note = RecipeNote.query.filter(RecipeNote.id == id, RecipeNote.recipe_id ==recipe_id).first()
  if not note:
    return {"error": f"Note {id} not found"}, 404
  data = request.get_json()
  schema = RecipeNoteSchema(partial=True)
  try:
    validated_data = schema.load(data)
  except ValidationError as err:
    return {'error': err.messages}, 400
  
  if 'note' in validated_data:
    note.note = validated_data['note']
  if 'date' in validated_data:
    note.date = validated_data['date']
  db.session.commit()
  return {'message': f'Note {id} updated successfully'}, 200


#delete a note
@app.route('/api/recipes/<int:recipe_id>/notes/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_a_note(recipe_id,id):
  from server.models import RecipeNote, Recipe
  user_id = get_jwt_identity()
  recipe = Recipe.query.filter(Recipe.user_id == user_id, Recipe.id == recipe_id).first()
  if not recipe:
    return {"error": f"Recipe {recipe_id} not found"}, 404
  note = RecipeNote.query.filter(RecipeNote.id == id, RecipeNote.recipe_id ==recipe_id).first()
  if not note:
    return {"error": f"Note {id} not found"}, 404
  db.session.delete(note)
  db.session.commit()
  return {'message': f'Note {id} deleted successfully'}, 200

#api routes
@app.route('/recipes/cuisine/<string:cuisine>', methods=['GET'])
def get_recipes_by_cuisine(cuisine):
  url = 'https://api.spoonacular.com/recipes/complexSearch'
  params={
    "cuisine": cuisine,
    "number": 50,
    "apiKey": api_key
  }
  response = requests.get(url, params=params)
  return response.json(), response.status_code

@app.route('/recipes/information/<int:recipe_id>', methods=['GET'])
def get_recipe_information(recipe_id):
  url = f'https://api.spoonacular.com/recipes/{recipe_id}/information'
  params = {"apiKey": api_key}
  response = requests.get(url, params=params)
  return response.json(), response.status_code
  
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS'
    return response

if __name__ == '__main__':
  app.run(port=5555, debug=True)