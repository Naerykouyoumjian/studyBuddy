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

  const handleSubmit = (e) => {
    e.preventDefault();


    // Check if the entered email and password match the test account
    if (email === 'test@example.com' && password === 'password123') {
      console.log("Login successful");
      setErrorMessage('');
      onLogin();  // Simulate successful login
      navigate('/dashboard');
    } else {
      setErrorMessage('Invalid email or password');  // Show an error message
    }
  };

  return (
    <>
      <Navbar isSignedIn={false} />
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