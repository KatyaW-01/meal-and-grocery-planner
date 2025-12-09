import {useState} from 'react'
import {createRecipe} from '../api/recipes'
import AddIngredientForm from './AddIngredientForm'
import { addIngredient } from '../api/ingredients'
import {useContext} from "react"
import {UserContext} from '../UserContext'
import {useNavigate} from "react-router-dom"
import '../styles/recipeIngredientForms.css'

function AddRecipeForm() {
  const { user, setUser } = useContext(UserContext)
  const [newRecipe, setNewRecipe] = useState({title: "", instructions: "", date:""})
  const [errors, setErrors] = useState({})
  const [ingredientForms, setIngredientForms] = useState([{}])
  const [ingredientData, setIngredientData] = useState([])

  const navigate = useNavigate()

  function handleBackButton() {
    navigate('/recipes')
  }

  function handleChange(event) {
    const {name, value} = event.target

    setNewRecipe(prev => ({
      ...prev, [name]: value
    }))
  }

  async function handleBlur() {
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
  }

  function handleAddIngredient() {
    //renders more add ingredient forms
    setIngredientForms([...ingredientForms, {}])
  }

  function addIngredientData(index, newIngredient) {
    setIngredientData(prev => {
      const copy = [...prev]
      copy[index] = newIngredient
      return copy
    })
  }

  async function handleSubmitAll(event) {
    event.preventDefault()
    //Add recipe
    //if there are errors, dont try and make the POST request
    if(!newRecipe.title && newRecipe.instructions && newRecipe.date) {
      alert('Error: fields may not be blank')
      return
    }
    if (Object.keys(errors).length > 0) return
    const result = await createRecipe(newRecipe)
      if (!result.error) {
        //update state so the new recipe shows up on the calendar
        const addedRecipe = result
        setUser(prev => ({
          ...prev, recipes: [...prev.recipes, addedRecipe]
        }))
      } else {
        alert('Error adding recipe, please try again.')
        setErrors(result.error)
      }
    //Add Ingredients  
    for (const ingredient of ingredientData) {
      const ingredientResult = await addIngredient(ingredient, result.id)
      if(ingredientResult && result) {
        //update state
        setUser(prev => ({
          ...prev,
          recipes: prev.recipes.map(r => 
            r.id === result.id ?
            {...r, ingredients: [...r.ingredients, ingredientResult]} :r)
        }))  
      } else {
        alert('Error adding recipe and ingredients, please try again')
      }
    }
    if (result) {
      alert('recipe and ingredients successfully added')
      navigate('/recipes')
    }
  }

  return (
    <div>
      <div className='add-recipe-form-div'>
        <h1>Create Your Recipe</h1>
        <form className='add-recipe-form' >
          <div>
            <label htmlFor='title'>Title:</label>
            <input id='title' name='title' type='text' value={newRecipe.title} onChange={handleChange} autoComplete='off' onBlur={handleBlur}/>
            {errors?.title && <p className='errors'>{errors.title}</p>}
          </div>
          <div>
            <label htmlFor='instructions'>Instructions:</label>
            <textarea id='instructions' name='instructions' type='text' value={newRecipe.instructions} onChange={handleChange} autoComplete='off' onBlur={handleBlur}/>
            {errors?.instructions && <p className='errors'>{errors.instructions}</p>}
          </div>
          <div>
            <label htmlFor='date'>Date:</label>
            <input id='date' name='date' type='date' value={newRecipe.date} onChange={handleChange} autoComplete='off' onBlur={handleBlur}/>
            {errors?.date && <p className='errors'>{errors.date}</p>}
          </div>
        </form>    
        {ingredientForms.length > 0 && 
        <div> 
          {ingredientForms.map((_,index) => (
            <div key={index}> 
              <h3 className='ingredient-header'>Ingredient {index + 1}</h3>
              <AddIngredientForm addIngredientData={addIngredientData} index={index} />
            </div>
          ))} 
        </div>
        }
        <div className='add-ingredients-button-div'>
          <button onClick={handleAddIngredient} className='add-ingredients-button' >Add More Ingredients</button>
        </div>
        <div>
          <button type='submit' className='submit-all-button' onClick={handleSubmitAll}>Submit All </button>
        </div>
      </div>
      <div className='back-button-div'>
      <button onClick={handleBackButton}>Back to Browse Recipes</button>
      </div>
    </div>
  )
}

export default AddRecipeForm