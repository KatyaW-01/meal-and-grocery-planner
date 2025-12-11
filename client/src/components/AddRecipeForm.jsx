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

    setErrors(prev => ({
      ...prev,
      [name]: ""
    }))
  }

  function handleTitleBlur() {
    if(!newRecipe.title || newRecipe.title === "") {
      setErrors(prev => ({
        ...prev,
        title: 'Title cannot be empty'
      }))
    }
  }

  function handleInstructionsBlur() {
    if(!newRecipe.instructions || newRecipe.instructions === "") {
      setErrors(prev => ({
        ...prev,
        instructions: 'Instructions cannot be empty'
      }))
    }
  }

  function handleDateBlur() {
    //Check for missing Date
    if(!newRecipe.date || newRecipe.data === "") {
      setErrors(prev => ({
        ...prev,
        date: 'Date cannot be blank'
      }))
    }
    //Check for invalid date
    const today = new Date()
    const threeWeeksAgo = new Date()
    threeWeeksAgo.setDate(today.getDate() - 21)
    if(newRecipe.date && new Date(newRecipe.date) < threeWeeksAgo ) {
      setErrors(prev => ({
        ...prev,
        date: 'Date is too far in the past'
      }))
    }
  }

  function handleAddIngredient() {
    //renders more add ingredient forms
    setIngredientForms([...ingredientForms, {}])
  }

  function addIngredientData(index, newIngredient) {
    setIngredientData(prev => {
      const data = [...prev]

      while(data.length <= index) {
        data.push({ name: "", quantity: "", quantity_description: "" })
      }

      data[index] = newIngredient
      return data
    })
  }

  async function handleSubmitAll(event) {
    event.preventDefault()
    //if there are errors in recipe or ingredients, return
    if(!newRecipe.title || !newRecipe.instructions || !newRecipe.date) {
      alert('Error: One or more recipe fields have been left blank')
      return
    } 
    if(ingredientData.length === 0) {
      alert("Error: one or more ingredient fields have been left blank")
      return
    }
    for (const ingredient of ingredientData) {
      if(!ingredient.name || !ingredient.quantity || !ingredient.quantity_description) {
        alert('Error: one or more ingredient fields have been left blank')
        return
      }
      if(ingredient === undefined) {
        alert('Error: one or more ingredient fields have been left blank')
        return
      }
    }
    //Add recipe
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
    let success = false
    if(result) {
      for (const ingredient of ingredientData) {
        const ingredientResult = await addIngredient(ingredient, result.id)
        if(ingredientResult && result) {
          success = true
          //update state
          setUser(prev => ({
            ...prev,
            recipes: prev.recipes.map(r => 
              r.id === result.id ?
              {...r, ingredients: [...r.ingredients, ingredientResult]} :r)
          }))  
        } else {
          success = false
          alert('Error adding recipe and ingredients, please try again')
        } 
      }
    }
    //Give success message if recipe and ingredients have been added and return to previous page
    if (result && success) {
      alert('Recipe and ingredients successfully added!')
      navigate('/recipes')
    } 
  }

  function handleDelete() {
    if (ingredientForms.length > 1) {
      setIngredientForms(prev => prev.slice(0, prev.length -1))
    } else {
      return
    }
  }

  return (
    <div>
      <div className='add-recipe-form-div'>
        <h1>Create Your Recipe</h1>
        <form className='add-recipe-form' >
          <div>
            <label htmlFor='title'>Title:</label>
            <input id='title' name='title' type='text' value={newRecipe.title} onChange={handleChange} autoComplete='off' onBlur={handleTitleBlur}/>
            {errors?.title && <p className='errors'>{errors.title}</p>}
          </div>
          <div>
            <label htmlFor='instructions'>Instructions:</label>
            <textarea id='instructions' name='instructions' type='text' value={newRecipe.instructions} onChange={handleChange} autoComplete='off' onBlur={handleInstructionsBlur}/>
            {errors?.instructions && <p className='errors'>{errors.instructions}</p>}
          </div>
          <div>
            <label htmlFor='date'>Date:</label>
            <input id='date' name='date' type='date' value={newRecipe.date} onChange={handleChange} autoComplete='off' onBlur={handleDateBlur}/>
            {errors?.date && <p className='errors'>{errors.date}</p>}
          </div>
        </form>    
        {ingredientForms.length > 0 && 
        <div> 
          {ingredientForms.map((_,index) => (
            <div key={index}> 
              {index > 0 &&
                <div className='delete-ingredient-div'>
                  <button onClick={handleDelete} className='delete-ingredient-button'>X</button>
                </div>
              }
              <h3 className='ingredient-header'>Ingredient {index + 1}</h3>
              <AddIngredientForm addIngredientData={addIngredientData} index={index}/>
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