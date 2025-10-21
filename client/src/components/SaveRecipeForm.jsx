import { scrape } from "../api/firecrawl"
import { useState } from "react"
import { createRecipe } from "../api/recipes"
import { addIngredient } from "../api/ingredients"
import '../styles/recipeIngredientForms.css'

function SaveRecipeForm() {
  const [url, setUrl] = useState("")
  const [date, setDate] = useState("")
  const [recipeData, setRecipeData] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await scrape(url)
    console.log("result:",result)
    setRecipeData(result)
    //add recipe data to the database
    //recipe has title, instructions, date, and userId
    //ingredients have name, quantity, quantity_description, recipe_id
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

  async function addRecipe() {
    await createRecipe({title: recipeData.title, instructions: recipeData.instructions.join(" "), date: date })
  }

  if(recipeData && date) {
    addRecipe()
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