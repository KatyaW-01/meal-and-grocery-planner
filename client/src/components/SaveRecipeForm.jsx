import { scrape } from "../api/firecrawl"
import { useState } from "react"
import { createRecipe } from "../api/recipes"
import { addIngredient } from "../api/ingredients"
import {UserContext} from '../UserContext'
import {useContext} from "react"
import {useNavigate} from "react-router-dom"
import '../styles/recipeIngredientForms.css'

function SaveRecipeForm() {
  const { user, setUser } = useContext(UserContext)
  const [url, setUrl] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setCompleted(false)
    setLoading(true)
    if(!date) {
      alert("Please enter a date")
    }
    if(!url) {
      alert("Error: url cannot be blank")
    }
    const result = await scrape(url)
    if(!result || result.error) {
      alert("Error, please ensure url is correct and is for a recipe")
      return
    }
    if(result) {
      setLoading(false)
      setCompleted(true)
      setUrl("")
      setDate("")
    }
    console.log("result:",result)
    const recipeObj = await createRecipeObject(result)
    if(recipeObj) {
      await createIngredients(recipeObj, result)
    }
  }
  
  async function createRecipeObject(data) {
    if(data && date) {
      //create recipe object
      const newRecipe = await createRecipe({title: data.title, instructions: (data.instructions).join(" "), date: date })
      //update state if recipe created successfully
      if(newRecipe) {
        setUser(prev => ({
          ...prev, recipes:[...prev.recipes, newRecipe]
        }))
        return newRecipe
      }
    } 
  }

  async function createIngredients(recipe, data) {
    const recipeId = recipe.id
    if(data.ingredients) {
      for (const ingredient of data.ingredients) {
        const result = await addIngredient({name: ingredient.ingredient, quantity: ingredient.amount, quantity_description: ingredient.unit || 'item'}, recipeId)
        console.log(result)
        if(result) {
          const addedIngredient = result
          setUser(prev => ({
            ...prev, recipes: prev.recipes.map(recipe => recipe.id === recipeId ?
              {...recipe, ingredients: [...(recipe.ingredients || []), addedIngredient]} : recipe)
          }))
        }
      }
    }
  }

  function handleChange(event) {
    const {name,value} = event.target
    if(name === "url") {
      setUrl(value)
    }
    if(name==='date') {
      setDate(value)
    } 
  }

  function handleBack() {
    navigate('/recipes')
  }

  return (
    <div>
      <div className='api-form-div'>
        <form className='api-form' onSubmit={handleSubmit}>
          <label htmlFor='url'>Url:</label>
          <input type='text' id='url' name='url' value={url} onChange={handleChange}/>
          <label htmlFor='date'>date:</label>
          <input type='date' id='date' name='date' value={date} onChange={handleChange}/>
          <button type='submit'>Submit</button>
        </form>
      </div>
      {loading && <p className='loading-message'>Creating your recipe...</p>}
      {completed && <p className='completed-message'>Recipe Created!</p>}
      <div className='back-button-div'>
      <button type="button" onClick={handleBack}>Back to Recipes</button>
      </div>
    </div>
  )
}

export default SaveRecipeForm