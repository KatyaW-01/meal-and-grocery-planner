import {useState} from 'react'
import {createRecipe} from '../api/recipes'
import AddIngredientForm from './AddIngredientForm'
import {useContext} from "react"
import {UserContext} from '../UserContext'
import {useNavigate} from "react-router-dom"
import '../styles/recipeIngredientForms.css'

function AddRecipeForm() {
  const { user, setUser } = useContext(UserContext)
  const [newRecipe, setNewRecipe] = useState({title: "", instructions: "", date:""})
  const [errors, setErrors] = useState({})
  const [recipeId, setRecipeId] = useState("")
  const [ingredientForms, setIngredientForms] = useState([{}])
  const [ingredientData, setIngredientData] = useState([])

  const navigate = useNavigate()

  function handleChange(event) {
    const {name, value} = event.target

    setNewRecipe(prev => ({
      ...prev, [name]: value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    // check if user is logged in
    if (!user) {
      alert ('Error connecting to user, cannot create recipe.')
      return
    }
    //check for any invalid data in the form
    let newErrors = {}
    if (!newRecipe.title || newRecipe.title.trim() === "") {
      newErrors.title = 'Title cannot be empty'
    }
    if (!newRecipe.instructions || newRecipe.instructions === "") {
      newErrors.instructions = 'Instructions cannot be empty'
    }
    if (!newRecipe.date || newRecipe.date === "") {
      newErrors.date = 'Not a valid date'
    }
    const today = new Date()
    const threeWeeksAgo = new Date()
    threeWeeksAgo.setDate(today.getDate() - 21)
    if(newRecipe.date && new Date(newRecipe.date) < threeWeeksAgo ) {
      newErrors.date = 'Date is too far in the past'
    }
    setErrors(newErrors)
    //if there are errors, dont try and make the POST request
    if (Object.keys(newErrors).length > 0) return
    //call POST request
    const result = await createRecipe(newRecipe)
    if (!result.error) {
      alert('Recipe successfully added!')
      //store the id in state so it can be passed to the add ingredient form
      setRecipeId(result.id)
      //update state so the new recipe shows up on the calendar
      const addedRecipe = result
      setUser(prev => ({
        ...prev, recipes: [...prev.recipes, addedRecipe]
      }))
    } else {
      alert('Error adding recipe, please try again.')
      setErrors(result.error)
    }
  }

  function handleAddIngredient() {
    //renders add ingredient forms
    setIngredientForms([...ingredientForms, {}])
  }

  function handleBackButton() {
    navigate('/recipes')
  }

  function addIngredientData(index, newIngredient) {
    setIngredientData(prev => {
      const copy = [...prev]
      copy[index] = newIngredient
      return copy
    })
  }

  function handleSubmitAll() {
    //create ingredients for the recipe here
    console.log("All Ingredients:", ingredientData)
    //reset the form
    setNewRecipe({title: "", instructions: "", date:""})
    //add a way to remove ingredient forms
  }

  return (
    <div>
      <div className='add-recipe-form-div'>
        <h1>Create Your Recipe</h1>
        <form className='add-recipe-form' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='title'>Title:</label>
            <input id='title' name='title' type='text' value={newRecipe.title} onChange={handleChange} autoComplete='off'/>
            {errors?.title && <p className='errors'>{errors.title}</p>}
          </div>
          <div>
            <label htmlFor='instructions'>Instructions:</label>
            <textarea id='instructions' name='instructions' type='text' value={newRecipe.instructions} onChange={handleChange} autoComplete='off'/>
            {errors?.instructions && <p className='errors'>{errors.instructions}</p>}
          </div>
          <div>
            <label htmlFor='date'>Date:</label>
            <input id='date' name='date' type='date' value={newRecipe.date} onChange={handleChange} autoComplete='off'/>
            {errors?.date && <p className='errors'>{errors.date}</p>}
          </div>
          <div>
            <button type='submit'>Submit</button>
          </div>
        </form>    
        <p className='submit-message'>Please submit your recipe before submitting ingredients</p>
        {ingredientForms.length > 0 && 
        <div> 
          {ingredientForms.map((_,index) => (
            <div key={index}> 
              <h3 className='ingredient-header'>Ingredient {index + 1}</h3>
              <AddIngredientForm recipe_id={recipeId} addIngredientData={addIngredientData} index={index}/>
            </div>
          ))} 
        </div>
        }
        <div className='add-ingredients-button-div'>
          <button onClick={handleAddIngredient} className='add-ingredients-button' >Add More Ingredients</button>
        </div>
        <div>
          <button type='submit' className='submit-all-button' onClick={handleSubmitAll}>Submit All Ingredients</button>
        </div>
      </div>
      <div className='back-button-div'>
      <button onClick={handleBackButton}>Back to Browse Recipes</button>
      </div>
    </div>
  )
}

export default AddRecipeForm