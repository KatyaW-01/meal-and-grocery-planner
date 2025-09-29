import './App.css'
import React from "react"
import { useState, useEffect } from "react"
import {Routes, Route} from "react-router-dom"
import PrivateRoutes from './components/PrivateRoutes'
import Login from './pages/Login'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import Grocery from './pages/Grocery'
import AddRecipeForm from './components/AddRecipeForm'
import SaveRecipeForm from './components/SaveRecipeForm'
import Calendar from './components/Calendar'
import {checkSession} from './api/signupLogin'
import {UserContext} from "./UserContext"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const loggedInUser = await checkSession()
      setUser(loggedInUser || null)
      setLoading(false) 
    }
    getUser()
  },[])

  if (loading) return ""

  

  function onLogin(token,user) {
    localStorage.setItem("token",token)
    setUser(user)
  }

  return (
    <UserContext.Provider value={{user,setUser}}>
      <Routes>
        <Route element={<PrivateRoutes user={user} />}>
          <Route path='/' element={<Home />}/>
          <Route path='/recipes' element={<Recipes />}/>
          <Route path='/addRecipes' element={<AddRecipeForm />} />
          <Route path='/saveRecipes' element={<SaveRecipeForm />} />
          <Route path='/grocery' element={<Grocery />}/>
          <Route path='/calendar' element={<Calendar />} />
        </Route>
      

        <Route path='/login' element={<Login onLogin={onLogin}/>}/>
      </Routes>
    </UserContext.Provider>
  )
}

export default App
