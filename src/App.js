import React, { useState } from 'react';
import Homepage from './Homepage';
import SignUp from './SignUp';
import UserAccount from './UserAccount';
import Login from './Login';
import FAQ from './FAQ';
import { Route, Routes, useNavigate } from "react-router-dom";
import NotFound from "./NotFound";
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Dashboard from './Dashboard';
import CreateToDoList from './CreateToDoList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    navigate("/dashboard");
  };

  const handleShowSignUp = () => {
    setShowSignUp(true);
    setShowLogin(false);
    navigate("/signup");
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
    navigate("/signin");
  };

  return (
    <>
      {/*Routes for our webpages */}
      <Routes>
        <Route path="/" element={<Homepage onSignUpClick={handleShowSignUp} />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/signin" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path = "/forgot-password" element = {<ForgotPassword />} />
        <Route path = "/reset-password" element = {<ResetPassword />} />
        <Route path = "/user-account" element = {<UserAccount />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-todolist" element={<CreateToDoList />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

    </>
  );
}

export default App;
