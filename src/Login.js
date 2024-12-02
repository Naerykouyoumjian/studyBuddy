import React, { useState } from 'react';
import './Login.css';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import googleIcon from './google-icon.png';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Add navigation hook

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const backendURL = process.env.REACT_APP_BACKEND_URL;
      console.log("Backend URL: ", backendURL);
        const response = await fetch(`${backendURL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        console.log("Login Response:", result); // Check what data is received

        if (result.success) {
            console.log('Login successful');
            setErrorMessage('');

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            console.log("User Data Stored:", localStorage.getItem('user')); // Verify stored value

            onLogin();  // Simulate successful login
            console.log("Navigating to dashboard...");
            navigate('/dashboard');  // Redirect to dashboard
        } else {
          console.log("Login failed:", result.message);
            setErrorMessage(result.message);
        }
    } catch (error) {
      console.error("Login Error: :", error);
        setErrorMessage('An error occurred. Please try again.');
    }
};

  return (
    <>
      <Navbar/>
      <div className="login-page">
        <div className="login-container">
          <h2>Welcome back</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Please enter your email address"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="login-button">Login</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Show error message */}
          </form>
          <div className="additional-options">
            <Link to="/signup">Don't have an account? Register here</Link>
            <Link to="/forgot-password">Forgot your password?</Link>
            <button className="google-login-button">
              <img src={googleIcon} alt="Google icon" />
              Sign in with Google
            </button>          
            </div>
        </div>
      </div>
    </>
  );
};

export default Login;