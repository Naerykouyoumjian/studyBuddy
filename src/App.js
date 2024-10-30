import React, { useState } from 'react'; 
import Homepage from './Homepage';
import SignUp from './SignUp';
import StudentProfile from './StudentProfile';
import Login from './Login';  // Import your Login component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleShowSignUp = () => {
    setShowSignUp(true);
    setShowLogin(false);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
  };

  return (
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
  );
}

export default App;