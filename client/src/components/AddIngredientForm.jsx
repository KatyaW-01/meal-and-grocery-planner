import {addIngredient} from '../api/ingredients'
import {useState} from 'react'
import {UserContext} from '../UserContext'
import {useContext} from "react"

function AddIngredientForm({recipe_id}) {
  const { user, setUser } = useContext(UserContext)
  const [newIngredient, setNewIngredient] = useState({name: "",quantity: "", quantity_description: "" })
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const {name,value} = event.target

    setNewIngredient(prev => ({
      ...prev, [name]: name == 'quantity' ? value === "" ? "" : Number(value) : value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    //give error messages if any inputs are blank
    let newErrors = {}
    if (!newIngredient.name || newIngredient.name.trim() === "") {
      newErrors.name = 'Name cannot be empty'
    }
    if (!newIngredient.quantity || newIngredient.quantity === "") {
      newErrors.quantity = 'quantity cannot be empty'
    }
    if (!newIngredient.quantity_description || newIngredient.quantity_description.trim() === "") {
      newErrors.quantity_description = 'quantity_description cannot be empty'
    }
    setErrors(newErrors)
    //dont even try the post request if there are errors
    if (Object.keys(newErrors).length > 0) return

    const result = await addIngredient(newIngredient, recipe_id)
    if (!result.error) {
      setErrors({})
      alert('Ingredient(s) successfully added!')
      const addedIngredient = result
      setUser(prev => ({
        ...prev, recipes: prev.recipes.map(recipe => recipe.id === recipe_id ?
          {...recipe, ingredients: [...(recipe.ingredients || []), addedIngredient]} : recipe)
      }))
    } else {
      alert('Error adding ingredient(s), please try again.')
      setErrors(result.error)
    }
  }


  return (
    <div className='add-ingredient-form-div'>
      <form className='add-ingredient-form' onSubmit={handleSubmit}>
        <div className='form-row'>
          <label htmlFor='name'>Name:</label>
          <input id='name' name='name' type='text' value={newIngredient.name} onChange={handleChange} autoComplete='off'/>
          <label htmlFor='quantity'>Quantity:</label>
          <input id='quantity' name='quantity' type='number' min="1" value={newIngredient.quantity} onChange={handleChange} autoComplete='off'/>
          <label htmlFor='quantity_description'>Quantity description (oz, cups, lbs, ect.):</label>
          <input id='quantity_description' name='quantity_description' type='text' value={newIngredient.quantity_description} onChange={handleChange} autoComplete='off'/>
          <button type='submit'>Submit</button>
        </div>
        {errors &&
          <div className='error-div'>
            {errors.name && <p>{errors.name}</p>}
            {errors.quantity && <p>{errors.quantity}</p>}
            {errors.quantity_description && <p>{errors.quantity_description}</p>}
          </div>
        }
      </form>
    </div>
  )
}

export default AddIngredientForm