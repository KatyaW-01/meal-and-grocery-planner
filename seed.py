#!/usr/bin/env python3

from server import create_app
from server.extensions import db
from server.models import User, Recipe, Ingredient, RecipeNote
from datetime import date

app = create_app()

with app.app_context():
  RecipeNote.query.delete()
  Ingredient.query.delete()
  Recipe.query.delete()
  User.query.delete()

  #create a user for testing purposes
  u1 = User(name='Katya', username='katya98')
  u1.password = 'flatiron'

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
    instructions='Slice tomatoes and mozzarella. Layer with basil leaves, drizzle with olive oil and balsamic vinegar, and season with salt and pepper.',
    date=date(2025,8,27)
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

  db.session.add_all([r1, r2, r3, r4])
  db.session.commit()

  #create ingredients for recipes
  i1 = Ingredient(name='flour', quantity=1.5, quantity_description='cups', recipe=r1)
  i2 = Ingredient(name='milk', quantity=1.25, quantity_description='cups', recipe=r1)
  i3 = Ingredient(name='eggs', quantity=1, quantity_description='egg', recipe=r1)
  i4 = Ingredient(name='baking powder', quantity=1, quantity_description='tablespoon', recipe=r1)
  i5 = Ingredient(name='sugar', quantity=1, quantity_description='tablespoon', recipe=r1)
  i6 = Ingredient(name='butter', quantity=5, quantity_description='tablespoons', recipe=r1)

  i7 = Ingredient(name='tomato', quantity=3, quantity_description='tomatoes', recipe=r2)
  i8 = Ingredient(name='mozzarella', quantity=3, quantity_description='balls', recipe=r2)
  i9 = Ingredient(name='basil', quantity=10, quantity_description='leaves', recipe=r2)
  i10 = Ingredient(name='olive oil', quantity=2, quantity_description='tablespoons', recipe=r2)
  i11 = Ingredient(name='balsamic vinegar', quantity=3, quantity_description='tablespoons', recipe=r2)

  i12 = Ingredient(name='chicken', quantity=2, quantity_description='breasts', recipe=r3)
  i13 = Ingredient(name='broccoli', quantity=1, quantity_description='cup', recipe=r3)
  i14 = Ingredient(name='bell pepper', quantity=1, quantity_description='cup', recipe=r3)
  i15 = Ingredient(name='zucchini', quantity=1, quantity_description='cup', recipe=r3)
  i16 = Ingredient(name='soy sauce', quantity=2, quantity_description='tablespoons', recipe=r3)
  i17 = Ingredient(name='sesame oil', quantity=3, quantity_description='tablespoons', recipe=r3)
  i18 = Ingredient(name='rice', quantity=2, quantity_description='cups', recipe=r3)

  i19 = Ingredient(name='spaghetti', quantity=16, quantity_description='oz', recipe=r4)
  i20 = Ingredient(name='olive oil', quantity=4, quantity_description='tablespoons', recipe=r4)
  i21 = Ingredient(name='chili flakes', quantity=2, quantity_description='tablespoons', recipe=r4)
  i22 = Ingredient(name='garlic', quantity=6, quantity_description='cloves', recipe=r4)
  i23 = Ingredient(name='parsley', quantity=3, quantity_description='tablespoons', recipe=r4)

  db.session.add_all([i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11, i12, i13, i14, i15, i16, i17, i18, i19, i20, i21, i22, i23])
  db.session.commit()

  #create recipe notes
  n1 = RecipeNote(note='butter pan well before cooking', date=date(2025,8,26), recipe=r1)
  n2 = RecipeNote(note='eat right after making, doesnt keep well', date=date(2025,8,27), recipe=r2)
  n3 = RecipeNote(note='next time try with teriyaki sauce', date=date(2025,9,1), recipe=r3)
  n4 = RecipeNote(note='delicious with teriyaki sauce instead of soy sauce', date=date(2025,9,1), recipe=r3)
  n5 = RecipeNote(note='simple but tasty, maybe add shrimp?', date=date(2025,8,29), recipe=r4)

  db.session.add_all([n1, n2, n3, n4, n5])
  db.session.commit()

  print("Database seeded successfully!")