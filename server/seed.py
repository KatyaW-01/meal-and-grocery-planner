#!/usr/bin/env python3

from app import app, db
from models import User, Recipe, Ingredient, RecipeNote
from datetime import date 

with app.app_context():
  RecipeNote.query.delete()
  Ingredient.query.delete()
  Recipe.query.delete()
  User.query.delete()

  #create a user for testing purposes
  u1 = User(name='Katya', username='katyaMaria98')
  u1.password = 'Papaya01*'

  db.session.add(u1)
  db.session.commit()

  #create recipes for the user
  r1 = Recipe(
    user=u1, 
    title='Classic Pancakes',
    instructions='Mix flour, milk, eggs, sugar, butter and baking powder. Pour batter onto a hot pan, cook until golden on both sides, and serve with syrup.',
    date=date(2025,8,26)
    )
  
  r2 = Recipe(
    user=u1,
    title='Caprese Salad',
    instructions = 'Slice tomatoes and mozzarella. Layer with basil leaves, drizzle with olive oil and balsamic vinegar, and season with salt and pepper.',
    date = date(2025,8,27)
  )

  r3 = Recipe(
    user=u1,
    title='Chicken Stir Fry',
    instructions='Cook chicken pieces until browned. Stir fry vegetables, add chicken, season with soy sauce and sesame oil, and serve over rice.',
    date=date(2025,9,1)
  )

  r4 = Recipe(
    user=u1,
    title='Spaghetti',
    instructions='Cook spaghetti. Sauté garlic in olive oil, add chili flakes, toss spaghetti with the mixture, and serve with parsley.',
    date=date(2025,8,29)
  )

  db.session.add_all([r1,r2,r3,r4])
  db.session.commit()

  #create ingredients for recipes
  #pancakes
  i1 = Ingredient(recipe=r1, name='flour', quantity=1.5, quantity_description='cups')
  i2 = Ingredient(recipe=r1, name='milk', quantity=1.25, quantity_description="cups")
  i3 = Ingredient(recipe=r1, name='eggs', quantity=1, quantity_description="egg")
  i4 = Ingredient(recipe=r1, name='baking powder', quantity=1, quantity_description="tablespoon")
  i5 = Ingredient(recipe=r1, name='sugar', quantity=1, quantity_description="tablespoon")
  i6 = Ingredient(recipe=r1, name='butter', quantity=5, quantity_description="tablespoons")
  #caprese salad
  i7 = Ingredient(recipe=r2, name='tomato', quantity=3, quantity_description='tomatoes')
  i8 = Ingredient(recipe=r2, name='mozzarella', quantity=3 , quantity_description='balls')
  i9 = Ingredient(recipe=r2, name='basil', quantity=10, quantity_description='leaves')
  i10 = Ingredient(recipe=r2, name='olive oil', quantity=2, quantity_description='tablespoons')
  i11 = Ingredient(recipe=r2, name='balsamic vinegar', quantity=3 , quantity_description='tablespoons')
  #chicken stir fry
  i12 = Ingredient(recipe=r3, name='chicken', quantity=2, quantity_description='breasts')
  i13 = Ingredient(recipe=r3, name='broccoli', quantity=1, quantity_description='cup')
  i14 = Ingredient(recipe=r3, name='bell pepper', quantity=1, quantity_description='cup')
  i15 = Ingredient(recipe=r3, name='zucchini', quantity=1, quantity_description='cup')
  i16 = Ingredient(recipe=r3, name='soy sauce', quantity=2, quantity_description='tablespoons')
  i17 = Ingredient(recipe=r3, name='sesame oil', quantity=3, quantity_description='tablespoons')
  i18 = Ingredient(recipe=r3, name='rice', quantity=2, quantity_description='cups')
  #spaghetti
  i19 = Ingredient(recipe=r4, name='spaghetti', quantity=16, quantity_description='oz')
  i20 = Ingredient(recipe=r4, name='olive oil', quantity=4, quantity_description='tablespoons')
  i21 = Ingredient(recipe=r4, name='chili flakes', quantity=2, quantity_description='tablespoons')
  i22 = Ingredient(recipe=r4, name='garlic', quantity=6, quantity_description='cloves')
  i23 = Ingredient(recipe=r4, name='parsley', quantity=3, quantity_description='tablespoons')

  db.session.add_all([i1,i2,i3,i4,i5,i6,i7,i8,i9,i10,i11,i12,i13,i14,i15,i16,i17,i18,i19,i20,i21,i22,i23])
  db.session.commit()

  #create notes for a recipe
  n1 = RecipeNote(recipe=r1, note='butter pan well before cooking', date=date(2025,8,26))
  n2 = RecipeNote(recipe=r2, note='eat right after making, doesnt keep well', date=date(2025,8,27))
  n3 = RecipeNote(recipe=r3, note='next time try with teriyaki sauce', date=date(2025,9,1))
  n4 = RecipeNote(recipe=r3, note='delicious with teriyaki sauce instead of soy sauce', date=date(2025,9,1))
  n5 = RecipeNote(recipe=r4, note='simple but tasty, maybe add shrimp?', date=date(2025,8,29))

  db.session.add_all([n1,n2,n3,n4,n5])
  db.session.commit()