import {useState} from 'react'
import { addIngredient } from '../api/ingredients'
import {useContext} from "react"
import {UserContext} from '../UserContext'

function NewIngredient({recipe_id, success}) {
  const [ingredient, setIngredient] = useState({name: "",quantity: "", quantity_description: "" })
  const [errors, setErrors] = useState({})
  const { user, setUser } = useContext(UserContext)

  function handleChange(event) {
    const {name,value} = event.target
    setIngredient(prev => ({
      ...prev, [name]: name == 'quantity' ? value === "" ? "" : Number(value) : value
    }))

    setErrors(prev => ({
      ...prev,
      [name]: ""
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    //if a field is missing set error messages and return
    if(!ingredient.name || !ingredient.quantity || !ingredient.quantity_description) {
      if(!ingredient.name || ingredient.name.trim() === "") {
        setErrors(prev => ({
          ...prev,
          name: 'Name cannot be empty'
        }))
        return
      }
      if (ingredient.quantity === 0) {
        setErrors(prev => ({
          ...prev,
          quantity: 'quantity must be greater than 0'
        })) 
        return
      }
      if (ingredient.quantity === ' ' || ingredient.quantity === "") {
        setErrors(prev => ({
          ...prev,
          quantity: 'quantity cannot be empty'
        }))
        return
      }
      if (!ingredient.quantity_description || ingredient.quantity_description.trim() === "") {
        setErrors(prev => ({
          ...prev,
          quantity_description: 'quantity_description cannot be empty'
        }))
        return
      }
    }
    //submit ingredient here
    const ingredientObject = await addIngredient(ingredient,recipe_id)
    if(ingredientObject) {
      setUser(prev => ({
        ...prev,
        recipes: prev.recipes.map(r =>
          r.id === recipe_id ?
          {...r, ingredients: [...r.ingredients, ingredientObject]} :r)
      }))
      success(true)
    } else {
      alert("Error adding ingredient, please try again")
    }
  }

  return (
    <div className='add-ingredient-form-div'>
      <form className='add-ingredient-form' onSubmit={handleSubmit}>
        <div>
          <label htmlFor='name'>Name:</label>
          <input id='name' name='name' type='text' value={ingredient.name} onChange={handleChange} autoComplete='off' />
          {errors.name && <p className='ingredient-error'>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor='quantity'>Quantity:</label>
          <input id='quantity' name='quantity' type='number' min="1" value={ingredient.quantity} onChange={handleChange} autoComplete='off' />
          {errors.quantity && <p className='ingredient-error'>{errors.quantity}</p>}
        </div>
        <div>
          <label htmlFor='quantity_description'>Quantity description (oz, cups, lbs, ect.):</label>
          <input id='quantity_description' name='quantity_description' type='text' value={ingredient.quantity_description} onChange={handleChange} autoComplete='off'/>
          {errors.quantity_description && <p className='ingredient-error'>{errors.quantity_description}</p>}
        </div>
        <div>
          <button type='submit'>Submit</button>
        </div>
      </form>
    </div>
  )
}

export default NewIngredient