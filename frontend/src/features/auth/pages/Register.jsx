import React from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Register = () => {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")


  const { loading, handleRegister } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleRegister({ username, email, password })
    navigate("/")
  }
  
  if (loading) {
    return (<main><h1>Loading....</h1></main>)
  }

  return (
    <div>
      <main>
        <div className="form-container">
          <h1>Register</h1>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                onChange={(e) => { setUsername(e.target.value) }}
                type="text" id="username" placeholder="Enter username" />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                onChange={(e) => { setEmail(e.target.value) }}
                type="email" id="Email" placeholder="Enter email address" />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                onChange={(e) => { setPassword(e.target.value) }}
                type="password" id="Password" placeholder="Enter password" />
            </div>

            <button className='button primary-button'>Register</button>

          </form>

          <p style={{ color: "white" }}>Already have an account? <Link to={"/login"}>Login</Link></p>
        </div>
      </main>
    </div>
  )
}

export default Register
