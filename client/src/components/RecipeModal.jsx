import { useState, useEffect } from "react"
import { createRecipe } from "../api/recipes"
import { addIngredient } from "../api/ingredients"
import {UserContext} from '../UserContext'
import {useContext} from "react"

function RecipeModal({recipe, onClose}) {
  const { user, setUser } = useContext(UserContext)
  const [ingredients, setIngredients] = useState([])
  const [calendarStatus, setCalendarStatus] = useState(false)
  const [date, setDate] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    let ingredientArray = []
    recipe.ingredients.map((ingredient) => {
      ingredientArray.push(`${ingredient.name} (${ingredient.quantity} ${ingredient.quantity_description})`)
    })
    setIngredients(ingredientArray)
  },[])

  function showCalendar() {
    setCalendarStatus(true)
  }

  function handleChange(event) {
    const {value} = event.target
    setDate(value)
  }

  async function handleAdd(event) {
    event.preventDefault()
    if(!date) {
      setError(true)
      return
    }
    const newRecipe = await createRecipe({title: recipe.title, instructions: recipe.instructions, date: date})
    if(newRecipe) {
      setUser(prev => ({
        ...prev, recipes:[...prev.recipes, newRecipe]
      }))
    }

    if(newRecipe.id && recipe.ingredients) {
      for (const ingredient of recipe.ingredients) {
        const result = await addIngredient({name: ingredient.name, quantity: ingredient.quantity, quantity_description: ingredient.quantity_description || 'item'}, newRecipe.id)
        if(result) {
          const addedIngredient = result
          setUser(prev => ({
            ...prev, recipes: prev.recipes.map(recipe => recipe.id === newRecipe.id ?
              {...recipe, ingredients: [...(recipe.ingredients || []), addedIngredient]} : recipe)
          }))
        }
      }
      alert("Recipe added to calendar!")
      onClose()
    }
  }

  return (
    <div className='event-modal'>
      <button className='x-button' onClick={onClose}>X</button>
      {!calendarStatus ?
      <div className='recipe-div'>
        <h3>{recipe.title}</h3>
        <p>Ingredients: {ingredients.join(', ')}</p>
        <p>Instructions: {recipe.instructions}</p>
        <button type='button' onClick={showCalendar}>Add Recipe to Calendar</button>
      </div>
      :
      <div className='date-form'>
        <h3>{recipe.title}</h3>
        <form onSubmit={handleAdd}>
          <input type='date' value={date} onChange={handleChange}/>
          <button type='submit'>Add Recipe</button>
        </form>
        {error && <p className='error-message'>Error: please input a date</p>}
      </div>
      }
      
    </div>
  )
}

export default RecipeModal