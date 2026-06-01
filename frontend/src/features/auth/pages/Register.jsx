import React from 'react'
import { useNavigate, Link } from 'react-router'

const Resgister = () => {

   const navigate=useNavigate()

   const handleSubmit = (e)=>{
    e.preventDefault()
  }

  return (
    <div>
      <main>
        <div className="form-container">
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
               <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" placeholder="Enter username" />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="Email" placeholder="Enter email address" />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="Password" placeholder="Enter password" />
                </div>
                
                <button className='button primary-button'>Register</button>

            </form>

           <p style={{color:"white"}}>Already have an account? <Link to={"/login"}>Login</Link></p>
        </div>
      </main>
    </div>
  )
}

export default Resgister
