import React, { useState } from 'react';  // Add useState here
import StudentProfile from './StudentProfile';
import Login from './Login';  // Import your Login component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Now useState is defined

  const handleLogin = () => {
    setIsAuthenticated(true);  // Set the user as authenticated
  };

  return (
    <div>
      {isAuthenticated ? (
        <StudentProfile />  // Show StudentProfile if the user is logged in
      ) : (
        <Login onLogin={handleLogin} />  // Show Login if the user is not logged in
      )}
    </div>
  );
}

export default App;
