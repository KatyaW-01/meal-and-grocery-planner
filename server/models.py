from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
from marshmallow import Schema, fields, ValidationError, validate
from marshmallow.validate import Range, Length
try:
  from .extensions import bcrypt
except ImportError:
  from extensions import bcrypt
from app import db
import re
from datetime import date, timedelta

password_regex = re.compile(r'^(?=\S{8,20}$)(?=.*?\d)(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[^A-Za-z\s0-9])')

class User(db.Model):
  __tablename__ = 'users'

  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String, nullable=False)
  username = db.Column(db.String, unique=True, nullable=False)
  _password_hash = db.Column(db.String, nullable=False)

  recipes = db.relationship('Recipe', back_populates='user', cascade='all, delete-orphan')

  @property
  def password(self):
    raise AttributeError('Password hashes may not be viewed.')
  
  @password.setter
  def password(self,value, **kwargs):
    if not password_regex.match(value):
      raise ValidationError("Password must be 8-20 characters long, contain at least one digit, one uppercase letter, one lowercase letter, and one special symbol.")
    password_hash = bcrypt.generate_password_hash(value.encode('utf-8'))
    self._password_hash = password_hash.decode('utf-8')

  def authenticate(self,password):
    return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))
  
class UserSchema(Schema):
  id = fields.Integer(dump_only=True)
  name = fields.String(required = True, validate=validate.Length(min=1, max=50, error="name must be between 1 and 50 characters"))
  username = fields.String(required=True, validate=validate.Length(min=1, error="Username cannot be blank"))
  password = fields.String(required=True, load_only=True)

  recipes = fields.Nested(lambda:RecipeSchema(exclude=['user',]), many=True)

  @validates('username')
  def validate_username(self,value, **kwargs):
    if User.query.filter_by(username=value).first():
      raise ValidationError("Username already exists, Please choose a different one")
    
class Recipe(db.Model):
  __tablename__ = 'recipes'

  id = db.Column(db.Integer, primary_key=True)
  title = db.Column(db.String, nullable=True)
  instructions = db.Column(db.String, nullable=True)
  date = db.Column(db.Date, nullable=False)

  user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
  user = db.relationship('User', back_populates='recipes')
  ingredients = db.relationship('Ingredient', back_populates='recipe', cascade='all, delete-orphan')
  notes = db.relationship('RecipeNote', back_populates='recipe', cascade='all, delete-orphan')

class RecipeSchema(Schema):
  id = fields.Integer(dump_only=True)
  title = fields.String(required=False, allow_none=True)
  instructions = fields.String(required=False, allow_none=True)
  date = fields.Date(required = True)

  user = fields.Nested(lambda:UserSchema(exclude=['recipes']))
  ingredients = fields.Nested(lambda:IngredientSchema(exclude=['recipe']),many=True)
  notes = fields.Nested(lambda:RecipeNoteSchema(exclude=['recipe']), many=True)

  @validates('instructions')
  def validate_instructions(self,value, **kwargs):
    if len(value) == 0 or not value:
      raise ValidationError("instructions cannot be blank")
    
  @validates('date')
  def validate_date(self,value, **kwargs):
    three_weeks_ago = date.today() - timedelta(weeks=2)
    if value < three_weeks_ago:
      raise ValidationError("Date is too far in the past, please choose another date")
    
class Ingredient(db.Model):
  __tablename__ = 'ingredients'

  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String, nullable=False)
  quantity = db.Column(db.Float, nullable=False)
  quantity_description = db.Column(db.String, nullable=False) 

  recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'))
  recipe = db.relationship('Recipe', back_populates='ingredients')

class IngredientSchema(Schema):
  id = fields.Integer(dump_only=True)
  name = fields.String(required=True, validate=validate.Length(min=3, max=25, error="name must be between 3 and 25 characters"))
  quantity = fields.Float(required=True, validate=validate.Range(min=0.5, max=50.0, error='qantitiy must be between 0.5 and 50.0'))
  quantity_description = fields.String(required=True, validate=validate.Length(min=1, max=20, error='description must be between 1 and 20 characters'))

  recipe = fields.Nested(lambda:RecipeSchema(exclude=['ingredients']))

class RecipeNote(db.Model):
  __tablename__ = 'recipe_notes'

  id = db.Column(db.Integer, primary_key=True)
  note = db.Column(db.String, nullable=False)
  date = db.Column(db.Date, nullable=False)

  recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'))
  recipe = db.relationship('Recipe', back_populates='notes')

class RecipeNoteSchema(Schema):
  id = fields.Integer(dump_only=True)
  note = fields.String(required=True, validate=validate.Length(min=5, max=300, error="note must be between 5 and 300 characters"))
  date = fields.Date(required = True)

  recipe = fields.Nested(lambda:RecipeSchema(exclude=['notes']))
  
