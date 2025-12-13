const API_URL = process.env.REACT_APP_API_URL

export async function signup(name, username, password) {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({name, username, password})
    })
    const data = await response.json()
    if(!response.ok) {
      return {error: data.error || ['Signup failed']}
    }
    localStorage.setItem("token", data.token)
    return data
  } catch (error) {
    console.error("Error completing signup:", error)
    return null
  }
}

export async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username, password})
    })
    const data = await response.json()
    if(!response.ok) {
      return { error: data.error || ["Login failed"] }
    }
    localStorage.setItem("token", data.token)
    return data
  } catch (error) {
    console.error("Error logging in:", error)
    return { error: ["Network error, please try again"] }
  }
}

export async function checkSession() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return null
    const response = await fetch(`${API_URL}/me`, {
      headers: {
      Authorization: `Bearer ${token}`
      }
    })
    if(!response.ok) {
      localStorage.removeItem("token")
      return null
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error, user is not logged in:", error)
    return null
  }
}