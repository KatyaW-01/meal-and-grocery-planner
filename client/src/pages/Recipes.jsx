import React from "react"
import {useState, useEffect} from "react"
import NavBar from "../components/NavBar"
import '../styles/recipePage.css'
import {useNavigate} from "react-router-dom"
import {UserContext} from '../UserContext'
import {useContext} from "react"
import RecipeCard from "../components/RecipeCard"


function Recipes() {
  const { user} = useContext(UserContext)
  const navigate = useNavigate()
  const [userRecipes, setUserRecipes] = useState(user.recipes)
  const [uniqueUserRecipes, setUniqueUserRecipes] = useState([])

  useEffect(() => {
    //remove duplicate recipes
    const unique = userRecipes.reduce((acc,recipe) => {
      if(!acc.some(r => r.title === recipe.title)) {
        acc.push(recipe)
      }
      return acc
    }, [])
    setUniqueUserRecipes(unique)
  },[])

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
        <div className='recipe-card-div'>
          {uniqueUserRecipes.map((recipe) => (
            <div key={recipe.id} >
              <RecipeCard recipe={recipe}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Recipes