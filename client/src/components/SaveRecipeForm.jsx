import { scrape } from "../api/firecrawl"
import { useState } from "react"
import { createRecipe } from "../api/recipes"
import { addIngredient } from "../api/ingredients"

function SaveRecipeForm() {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [ingredients, setIngredients] = useState([])
  const [instructions, setInstructions] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await scrape(url)
    console.log("result:",result)
    if (result.ingredients) {
      setIngredients(result.ingredients)
    } 
    if (result.instructions) {
      setInstructions(result.instructions)
    }
    if(result.title) {
      setTitle(result.title)
    }
    //add recipe data to the database
  }

  function handleChange(event) {
    const {value} = event.target
    setUrl(value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='url'>Url:</label>
      <input type='text' id='url' name='url' value={url} onChange={handleChange}/>
      <button type='submit'>Submit</button>
    </form>
  )
}

export default SaveRecipeForm