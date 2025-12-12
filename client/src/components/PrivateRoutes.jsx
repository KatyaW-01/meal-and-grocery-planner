import React from "react"
import { Navigate, Outlet } from 'react-router-dom'

function PrivateRoutes({user}) {
  return (
    user ? <Outlet/> : <Navigate to="/login" replace = {true}/>
  )
}

export default PrivateRoutes