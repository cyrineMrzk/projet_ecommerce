import React from 'react';
import './Login.css'
import Backgrou from '../signup/Backgrou';
import Cote from './Coteconnexion';

export default function Login() {
  return (

    <div className="photo">
      <Backgrou/>
    <div className="cotte">
      <Cote>
      <h1 className="welcomeback">Welcome Back !</h1>
      <h2 className="otherlogin">Log in to Your Account</h2>
      <p className="udonthave">You don't have an account? <a href="signup" onclick="redirectToSignup()" style={{color:'#3643ba',fontWeight:'400'}}>Sign up</a></p>
      
      <form>
        <div style={{position: "relative", top: "5px"}}>
          <label htmlFor="mail" style={{ color: "white", position: "relative", right: "140px"}} >Email Adress :</label><br></br>
          <input type="email"  className="box" required placeholder=" Email@gmail.com" />
        </div>
        <p></p>
        <div style={{position: "relative", top: "5px"}}>
          <label htmlFor="motdepasse"  style={{ color: "white", position: "relative", right: "150px"}} >Password :</label><br></br>
          <input type="password"  className="box" required placeholder=" Your Password (6-15 Digits)" />
        </div>
        <p></p>
        <div style={{position: "relative", top: "10px"}}>
          <input type="checkbox" id="mail" style={{ color: "white", position: "relative", right: "140px",top:"10px"}} required />   
          <label htmlFor="mail"  style={{ color: "white", position: "relative", right: "140px",top:"10px"}}>Remember me</label>
        </div>
        <p></p>
          <button className='login' style={{position: "relative", top: "20px"}}>Login</button>
        

      </form>
      </Cote>
    </div>
    </div>

  );
}

