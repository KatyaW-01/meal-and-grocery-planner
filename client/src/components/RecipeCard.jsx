import { useState } from "react"
import '../styles/recipePage.css'
import RecipeModal from "./RecipeModal"

function RecipeCard({recipe}) {
  const [recipeClick, setRecipeClick] = useState(false)
  function handleClick() {
    setRecipeClick(true)
  }
  function closeModal() {
    setRecipeClick(false)
  }
  return (
    <div className='recipe-card'>
      <h3>{recipe.title}</h3>
      <button className='more-info-button' onClick={handleClick}>More Info</button>
      {recipeClick && (
        <> 
          <div className='modal-overlay'> </div>
          <RecipeModal recipe={recipe} onClose={closeModal}/>
        </>
      )}
    </div>
  )
}

export default RecipeCard