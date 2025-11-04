function RecipeModal({recipe, onClose}) {
  return (
    <div className='event-modal'>
      <button className='x-button' onClick={onClose}>X</button>
      <p>recipe information here</p>
    </div>
  )
}

export default RecipeModal