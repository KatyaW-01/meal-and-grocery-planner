const API_URL = import.meta.env.VITE_API_URL

export async function addIngredient(content, recipeId) {
  try {
    const response = await fetch(`${API_URL}/api/recipes/${recipeId}/ingredients`, {
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
    console.error('Error creating ingredient:', error)
    return null
  }
}

export async function editIngredient(recipe_id,ingredient_id, content) {
  try {
    const response = await fetch(`${API_URL}/api/recipes/${recipe_id}/ingredients/${ingredient_id}`, {
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
    console.error("Error updating ingredient:", error)
  }
}

export async function deleteIngredient(recipe_id, ingredient_id) {
  try {
    const response = await fetch(`${API_URL}/api/recipes/${recipe_id}/ingredients/${ingredient_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    const data = await response.json()
    return data
  } catch(error) {
    console.error("Error deleting ingredient:", error)
  }
}