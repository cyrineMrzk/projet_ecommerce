import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Backgrou from '../signup/Backgrou';
import Cote from './Coteconnexion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('http://127.0.0.1:8000/api/login/', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await response.json();
    console.log("Login Response:", data); 
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user)); 
      localStorage.setItem("token", data.token); 
      navigate('/', { state: { user: data.user } }); // Redirect to home page
    } else {
      setError(data.error || 'Invalid credentials');
    }
  };

  return (
    <div className="photo">
      <Backgrou />
      <div className="cotte">
        <Cote>
          <h1 className="welcomeback">Welcome Back!</h1>
          <h2 className="otherlogin">Log in to Your Account</h2>
          <p className="udonthave">
            You don't have an account? <a href="/signup" style={{ color: '#3643ba', fontWeight: '400' }}>Sign up</a>
          </p>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="mail">Email Address:</label><br />
              <input
                type="email"
                className="box"
                required
                placeholder="Email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password">Password:</label><br />
              <input
                type="password"
                className="box"
                required
                placeholder="Your Password (6-15 Digits)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>

            <button className="login">Login</button>
          </form>
        </Cote>
      </div>
    </div>
  );
}

