import React, { useState } from 'react';
import Homepage from './Homepage';
import SignUp from './SignUp';
import StudentProfile from './StudentProfile';
import Login from './Login';
import FAQ from './FAQ';
import { Route, Routes, useNavigate } from "react-router-dom";
import NotFound from "./NotFound";

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
      <Routes>
        <Route path="/" element={<Homepage onSignUpClick={handleShowSignUp} />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/signin" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {isAuthenticated && <StudentProfile />}
    </>
  );
}

export default App;
