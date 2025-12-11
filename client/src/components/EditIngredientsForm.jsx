import { useState, useEffect } from "react"
import "../styles/editIngredients.css"
import { deleteIngredient, editIngredient } from "../api/ingredients"
import {useContext} from "react"
import {UserContext} from '../UserContext'
import NewIngredient from "./NewIngredient"


function EditIngredientsForm({recipeObject}) {
  const { user, setUser } = useContext(UserContext)
  const [editedIngredients, setEditedIngredients] = useState([])
  const [addIngredientStatus, setAddIngredientStatus] = useState(false)
  const [addIngredientSuccess, setAddIngredientSuccess] = useState(false)
  useEffect(() => {
    if (recipeObject[0]) {
      setEditedIngredients(recipeObject[0].ingredients || [])
    }
  }, [recipeObject])

  function handleAddIngredients() {
    setAddIngredientStatus(true)
  }

  if (editedIngredients.length === 0) {
    return <div>
        {!addIngredientStatus &&
          <div className='no-ingredients-div'>
            <p>Recipe has no ingredients</p>
            <button onClick={handleAddIngredients}>Add Ingredients</button>
          </div>
        }
        {addIngredientStatus && 
            <div>
              <h3>Add Ingredient for {recipeObject[0].title}</h3>
              <NewIngredient recipe_id = {recipeObject[0].id} success={setAddIngredientSuccess}/>
            </div>
          }
      </div>
  }

  if(addIngredientSuccess) {
    return <div>
      <p className='success-message'>Ingredient successfully added</p>
    </div>
  }

  function handleIngredientChange(index, event) {
    const {name,value} = event.target
    setEditedIngredients(prev => {
      const updated = [...prev]
      let newValue = value
      if(name==='quantity') {
        if(value == "") {
          newValue = ""
        } else {
          newValue = parseInt(value,10)
        }
      } 
      updated[index] = {...updated[index], [name]: newValue}
      return updated
    })
  }

  async function handleSubmit(index, event) {
    event.preventDefault()
    setAddIngredientStatus(false)
    const recipeId = recipeObject[0].id
    const ingredientId = editedIngredients[index].id
    const content = editedIngredients[index]
    const {id, recipe, ...rest} = content
    const result = await editIngredient(recipeId, ingredientId, rest)
    if (!result.error) {
      alert('Ingredient successfully updated')
      //find the recipe then find the ingredient and update it 
      setUser(prev => ({
        ...prev,
        recipes: prev.recipes.map(r => 
          r.id === recipeId ? 
            {...r, ingredients: r.ingredients.map(ing => 
              ing.id === ingredientId ? {...ing, ...rest} : ing)} :r)
      }))
      //update local state as well
      setEditedIngredients(prev => {
        const updated = [...prev]
        //rest (the updated variables) will override what the variables used to be
        updated[index] = {...updated[index], ...rest}
        return updated
      })
    } else {
      alert('Error updating ingredient, please try again.')
    }
  }

  async function handleDelete(index, event) {
    const ingredientId = editedIngredients[index].id
    const recipeId = recipeObject[0].id
    const result = await deleteIngredient(recipeId,ingredientId)
    if (!result.error) {
      alert('Ingredient successfully deleted!')
      //remove the ingredient from user state
      setUser(prev => ({
        ...prev,
        recipes: prev.recipes.map(r => 
          r.id === recipeId ? 
            {...r, ingredients: r.ingredients.filter(ing => 
            ing.id !== ingredientId)} : r
        )
      }))

      //remove the ingredient from local state so the form updates
      setEditedIngredients(prev => prev.filter((_, i) => i !== index))
    } else {
      alert('Error deleting ingredient, please try again.')
    }
  }

  return (
    <div className='ingredients-div'>
      {!addIngredientStatus &&
      <div>
        <h2>Edit Ingredients for {recipeObject[0].title}</h2>
        {editedIngredients.map((ingredient, index) => (
          <div key={ingredient.id} className='ingredient-form-div'>
            <form className='ingredient-form' onSubmit={(event) => handleSubmit(index,event)}>
              <label htmlFor='name' >Name:</label>
              <input type='text' id='name' name='name' value={editedIngredients[index].name}  onChange={(event) => handleIngredientChange(index,event)} autoComplete='off'/>
              <label htmlFor='quantity'>Quantity:</label>
              <input type='number' id='quantity' name='quantity' min='1' value={editedIngredients[index].quantity}  onChange={(event) => handleIngredientChange(index,event)} autoComplete='off'/>
              <label htmlFor='quantity_description'>Qantity Description:</label>
              <input type='text' id='quantity_description' name='quantity_description' value={editedIngredients[index].quantity_description}  onChange={(event) => handleIngredientChange(index,event)} autoComplete='off'/>
              <button type='submit' className='ingredient-submit-button'>Submit</button>
              <button className='delete-ingredient-button' type="button" onClick={(event) => handleDelete(index,event)}>Delete Ingredient</button>
            </form>
          </div>
        ))}
        <button className='add-ingredient-button' onClick={handleAddIngredients}>Add an Ingredient</button>
      </div>
      }
      {addIngredientStatus && 
          <div >
            <h3>Add Ingredient for {recipeObject[0].title}</h3>
              <NewIngredient recipe_id = {recipeObject[0].id} success={setAddIngredientSuccess}/>
          </div>
        }
    </div>
  )
}

export default EditIngredientsForm

