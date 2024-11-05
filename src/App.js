import React, { useState } from 'react'; 
import Homepage from './Homepage';
import SignUp from './SignUp';
import StudentProfile from './StudentProfile';
import Login from './Login';  // Import your Login component
import {Route, Routes, useNavigate} from "react-router-dom";
import NotFound from "./NotFound"
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

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
        <Route path = "/" element = {<Homepage onSignUpClick={handleShowSignUp} />} />
        {/*<Route path = "/faq" element = {} />*/}
        <Route path = "/signin" element = {<Login onLogin={handleLogin} />} />
        {/*<Route path = "/dashboard" element = {} />*/}
        <Route path = "/signup" element = {<SignUp />} />
        <Route path = "/forgot-password" element = {<ForgotPassword />} />
        <Route path = "/reset-password" element = {<ResetPassword />} />
        <Route path = "*" element = {<NotFound />} />
      </Routes>

      {isAuthenticated && <StudentProfile />}
    </>
    /* //Just leaving this here for now in case we have to revert to the old navigation system
    <div>
      {isAuthenticated ? (
        <StudentProfile />
      ) : showSignUp ? (
        <div>
          <SignUp />
          <button onClick={handleShowLogin}>Go to Login</button>
        </div>
      ) : showLogin ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Homepage onSignUpClick={handleShowSignUp} />
      )}
    </div>
    */
  );
}

export default App;