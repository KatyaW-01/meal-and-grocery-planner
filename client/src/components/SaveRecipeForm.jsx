import { scrape } from "../api/firecrawl"
import { useState } from "react"
import { createRecipe } from "../api/recipes"
import { addIngredient } from "../api/ingredients"
import {UserContext} from '../UserContext'
import {useContext} from "react"
import '../styles/recipeIngredientForms.css'

function SaveRecipeForm() {
  const { user, setUser } = useContext(UserContext)
  const [url, setUrl] = useState("")
  const [date, setDate] = useState("")
  const [recipeData, setRecipeData] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if(!date) {
      alert("Please enter a date")
    }
    if(!url) {
      alert("Error url cannot be blank")
    }
    const result = await scrape(url)
    console.log("result:",result)
    const recipeObj = await createRecipeObject(result)
    console.log("recipe object:",recipeObj)
    if(recipeObj) {
      await createIngredients(recipeObj)
    }
  }
  
  async function createRecipeObject(data) {
    if(data && date) {
      //create recipe object
      const newRecipe = await createRecipe({title: data.title, instructions: (data.instructions).join(" "), date: date })
      //update state if recipe created successfully
      if(!newRecipe.error) {
        setUser(prev => ({
          ...prev, recipes:[...prev.recipes, newRecipe]
        }))

        return newRecipe
      }
    } 
  }

  async function createIngredients(recipe) {
    console.log("recipeId:", recipe.id)
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
    </div>
  )
}

export default SaveRecipeForm