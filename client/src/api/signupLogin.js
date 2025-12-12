export async function signup(name, username, password) {
  try {
    const response = await fetch('http://127.0.0.1:5555/signup', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({name, username, password})
    })
    const data = await response.json()
    localStorage.setItem("token", data.token)
    return data
  } catch (error) {
    console.error("Error completing signup:", error)
    return null
  }
}

export async function login(username, password) {
  try {
    const response = await fetch('http://127.0.0.1:5555/login', {
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
    const response = await fetch('http://127.0.0.1:5555/me', {
      headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    const data = await response.json()
    if(!response.ok) {
      localStorage.removeItem("token")
      return null
    }
    return data
  } catch (error) {
    console.error("Error, user is not logged in:", error)
    return null
  }
}