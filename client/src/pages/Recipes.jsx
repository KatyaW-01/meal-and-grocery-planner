import React from "react"
import {useState} from "react"
import NavBar from "../components/NavBar"
import '../styles/recipePage.css'
import {useNavigate} from "react-router-dom"


function Recipes() {
  const navigate = useNavigate()

  function handleCreateRecipe() {
    navigate('/addRecipes')
  }

  function handleSaveRecipe() {
    navigate('/saveRecipes')
  }

  return(
    <div>
      <NavBar />
      <div className="recipes-content">
        <div className="header-and-button">
          <h1>Browse and Add Recipes</h1>
        </div>
        <div className='recipe-actions'>
          <button onClick={handleSaveRecipe}>Save Recipe From Wepage</button>
          <button onClick={handleCreateRecipe}>Create Your Own Recipe</button>
        </div>
      </div>
    </div>
  )
}

export default Recipes