import React from 'react'
import { useNavigate, Link } from 'react-router'
import '../auth.form.scss'


const Login = () => {

  const navigate=useNavigate()

  const handleSubmit = (e)=>{
    e.preventDefault()
  }

  return (
    <div>
      <main>
        <div className="form-container">
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="Email" placeholder="Enter email address" />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="Password" placeholder="Enter password" />
                </div>

                <button className='button primary-button'>Login</button>

            </form>

           <p style={{color:"white"}}>Don't have an account? <Link to={"/register"}>Register</Link></p>

        </div>
      </main>
    </div>
  )
}

export default Login
