import {useState} from 'react'

function AddIngredientForm({addIngredientData, index}) {
  const [newIngredient, setNewIngredient] = useState({name: "",quantity: "", quantity_description: "" })
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const {name,value} = event.target

    setNewIngredient(prev => ({
      ...prev, [name]: name == 'quantity' ? value === "" ? "" : Number(value) : value
    }))
  }

  function handleBlur() {
    const { name, quantity, quantity_description } = newIngredient

    if(name && quantity && quantity_description) {
      addIngredientData(index, newIngredient)
    } else {
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
    }
  }

  return (
    <div className='add-ingredient-form-div'>
      <form className='add-ingredient-form'>
        <div>
          <label htmlFor='name'>Name:</label>
          <input id='name' name='name' type='text' value={newIngredient.name} onChange={handleChange} autoComplete='off' onBlur={handleBlur}/>
        </div>
        <div>
          <label htmlFor='quantity'>Quantity:</label>
          <input id='quantity' name='quantity' type='number' min="1" value={newIngredient.quantity} onChange={handleChange} autoComplete='off' onBlur={handleBlur}/>
        </div>
        <div>
          <label htmlFor='quantity_description'>Quantity description (oz, cups, lbs, ect.):</label>
          <input id='quantity_description' name='quantity_description' type='text' value={newIngredient.quantity_description} onChange={handleChange} autoComplete='off' onBlur={handleBlur}/>
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