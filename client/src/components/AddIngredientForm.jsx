import {useState} from 'react'

function AddIngredientForm({addIngredientData, index}) {
  const [newIngredient, setNewIngredient] = useState({name: "",quantity: "", quantity_description: "" })
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const {name,value} = event.target

    setNewIngredient(prev => ({
      ...prev, [name]: name == 'quantity' ? value === "" ? "" : Number(value) : value
    }))

    if(name === 'quantity' && quantity.value < 1) {
      setErrors(prev => ({
        ...prev,
        quantity: 'quantity must be greater than 0'
      }))
    }

    setErrors(prev => ({
      ...prev,
      [name]: ""
    }))

  }

  function handleNameBlur() {
    const { name, quantity, quantity_description } = newIngredient

    if(name && quantity && quantity_description) {
      addIngredientData(index, newIngredient)
    } 

    if (!newIngredient.name || newIngredient.name.trim() === "") {
      setErrors(prev => ({
        ...prev,
        name: 'Name cannot be empty'
      }))
    }
  }

  function handleQuantityBlur() {
    const { name, quantity, quantity_description } = newIngredient
    if(name && quantity && quantity_description) {
      addIngredientData(index, newIngredient)
    } 
    if (newIngredient.quantity === 0) {
      setErrors(prev => ({
        ...prev,
        quantity: 'quantity must be greater than 0'
      })) 
    }
    if (newIngredient.quantity === ' ' || newIngredient.quantity === "") {
      setErrors(prev => ({
        ...prev,
        quantity: 'quantity cannot be empty'
      }))
    }
  }

  function handleDescriptionBlur() {
    const { name, quantity, quantity_description } = newIngredient

    if(name && quantity && quantity_description) {
      addIngredientData(index, newIngredient)
    } 
    if (!newIngredient.quantity_description || newIngredient.quantity_description.trim() === "") {
      setErrors(prev => ({
        ...prev,
        quantity_description: 'quantity_description cannot be empty'
      }))
    }
  }

  return (
    <div className='add-ingredient-form-div'>
      <form className='add-ingredient-form'>
        <div>
          <label htmlFor='name'>Name:</label>
          <input id='name' name='name' type='text' value={newIngredient.name} onChange={handleChange} autoComplete='off' onBlur={handleNameBlur}/>
          {errors.name && <p className='ingredient-error'>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor='quantity'>Quantity:</label>
          <input id='quantity' name='quantity' type='number' min="1" value={newIngredient.quantity} onChange={handleChange} autoComplete='off' onBlur={handleQuantityBlur}/>
          {errors.quantity && <p className='ingredient-error'>{errors.quantity}</p>}
        </div>
        <div>
          <label htmlFor='quantity_description'>Quantity description (oz, cups, lbs, ect.):</label>
          <input id='quantity_description' name='quantity_description' type='text' value={newIngredient.quantity_description} onChange={handleChange} autoComplete='off' onBlur={handleDescriptionBlur}/>
          {errors.quantity_description && <p className='ingredient-error'>{errors.quantity_description}</p>}
        </div>
        {/* {errors &&
          <div className='error-div'>
            {errors.name && <p>{errors.name}</p>}
            {errors.quantity && <p>{errors.quantity}</p>}
            {errors.quantity_description && <p>{errors.quantity_description}</p>}
          </div>
        } */}
      </form>
    </div>
  )
}

export default AddIngredientForm