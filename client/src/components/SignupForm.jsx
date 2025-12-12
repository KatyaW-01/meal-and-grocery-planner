import React from "react"
import { useState, useEffect } from "react"
import { signup } from "../api/signupLogin"
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'

function SignupForm({onLogin}) {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [errors, setErrors] = useState([])
  const [touchedConfirmation, setTouchedConfirmation] = useState(false)
   const navigate = useNavigate()

  useEffect(() => {
    if (touchedConfirmation && password !== passwordConfirmation) {
    setErrors(["Passwords do not match"])
    } else {
      setErrors([])
    }
  },[password,passwordConfirmation])
 

  async function handleSubmit(event) {
    event.preventDefault()
    const signupData = await signup(name, username, password)
    if (password === passwordConfirmation) {
      if (!signupData.error) {
        onLogin(signupData.token,signupData.user)
        navigate('/')
      } else {
        setErrors(signupData.error)
      }
    } else {
      alert('passwords must match, please try again.')
      return
    }
  }

  return (
    <div className="signup-form-div">
      <form className='signup-form' onSubmit={handleSubmit}>
        <h1>Create an Account</h1>
        <div>
          <label htmlFor='name'>Name:</label>
          <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} autoComplete='off'/>
        </div>
        <div>
          <label htmlFor='username'>Username:</label>
          <input type='text' id='username' value={username} onChange={(e) => setUsername(e.target.value)} autoComplete='off'/>
        </div>
        <div>
          <label htmlFor='password'>Password:</label>
          <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='off'/>
        </div>
        <div>
          <label htmlFor='confirmPassword'>Confirm password:</label>
          <input type='password' id='confirmPassword' value={passwordConfirmation} onChange={e => {
            setPasswordConfirmation(e.target.value)
            setTouchedConfirmation(true)
            }} autoComplete='off'/>
        </div>
        {errors &&
           Object.keys(errors).map(key => (
            <p key={key} className="error">
            {/* checks if the error is an array or not and renders error message accordingly */}
            {Array.isArray(errors[key]) ? errors[key][0] : errors[key]}
            </p>
        ))}
        <div className="signup-button-div">
        <button className="signup-button" type='submit'>Create Account</button>
        </div>
      </form>
    </div>
  )
}

export default SignupForm