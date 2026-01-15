import React from "react"
import { useState } from "react";
import LoginForm from '../components/LoginForm' 
import SignupForm from '../components/SignupForm' 
import '../styles/login.css'

function Login({onLogin}) {
  const [showLogin, setShowLogin] = useState(true);
  return(
    showLogin ? (
      <>
        <LoginForm onLogin={onLogin}/>
        <div className="signup-link-div">
          <p>Don't have an account?
            <button onClick={() => setShowLogin(false)}>Sign Up</button>
          </p>
        </div>
      </>
    ) : (
      <>
        <SignupForm onLogin={onLogin} />
        <div className="login-link-div">
          <p>Already have an account?
            <button onClick={() => setShowLogin(true)}>Log In</button>
          </p>
        </div>
      </>
    )
    ) 
}

export default Login