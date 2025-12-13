const API_URL = process.env.REACT_APP_API_URL

export async function createRecipe(content) {
  try {
    const response = await fetch(`${API_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(content)
    })
    const data = await response.json()
    if (!response.ok) {
      return null
    }
    return data
  } catch(error) {
    console.error('Error creating recipe:', error)
    return null
  }
}

export async function updateRecipe(recipe_id, content) {
  try {
    const response = await fetch(`${API_URL}/api/recipes/${recipe_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(content)
    })
    const data = await response.json()
    return data
  } catch(error) {
    console.error("Error updating recipe:", error)
  }
}

export async function deleteRecipe(recipe_id) {
  try {
    const response = await fetch(`${API_URL}/api/recipes/${recipe_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    const data = await response.json()
    return data
  } catch(error) {
    console.error("Error deleting recipe:", error)
  }
}

