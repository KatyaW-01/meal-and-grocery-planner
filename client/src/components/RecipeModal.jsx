import { useState, useEffect } from "react"

function RecipeModal({recipe, onClose}) {
  const [ingredients, setIngredients] = useState([])
  console.log(recipe)
  useEffect(() => {
    let ingredientArray = []
    recipe.ingredients.map((ingredient) => {
      ingredientArray.push(`${ingredient.name} (${ingredient.quantity} ${ingredient.quantity_description})`)
    })
    setIngredients(ingredientArray)
  },[])
  return (
    <div className='event-modal'>
      <button className='x-button' onClick={onClose}>X</button>
      <p>{recipe.title}</p>
      <p>Ingredients: {ingredients.join(', ')}</p>
      <p>Instructions: {recipe.instructions}</p>
      <button>Add Recipe to Calendar</button>
    </div>
  )
}

export default RecipeModal