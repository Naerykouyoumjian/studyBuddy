//importing css styling for navbar
import './Navbar.css';
//importing fonts
import '@fontsource/new-rocker';
import '@fontsource/palanquin';
import React from "react";
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom"

//adding Navbar elements
const Navbar = () =>{
    const [signinStatus, setSigninStatus] = useState(false);
  
    const handleSignOut = () =>{
      localStorage.removeItem('user');
    }

    useEffect(() => {
      if(localStorage.getItem('user') === null){
        setSigninStatus(false);
      }else{
        setSigninStatus(true);
      }
    });

    return(<>
    <nav className = "navbar">
        <div className = "navbar-left">
          <Link to ="/" className = "logo">
            StudyBuddy
          </Link>
        </div>
        <div className = "navbar-right">
          <ul className = "navbar-links">
            {/*Check if user is signed in, when true show options 
              for the signed in navbar. When false show main navbar
            */}
            {signinStatus ? ( 
              <>
                <li><Link to ="/">Home</Link></li>
                <li><Link to ="/dashboard">Dashboard</Link></li>
                <li><Link to ="/faq">FAQ</Link></li>
                <li className = "signOut"><Link to ="/" onClick = {handleSignOut}>Sign-Out</Link></li>
              </>
            ) : (
              <>
                <li><Link to ="/">Home</Link></li>
                <li><Link to ="/faq">FAQ</Link></li>
                <li className = "signIn"><Link to ="/signin">Sign In</Link></li>
              </>
            )} 
          </ul>
        </div>
      </nav>
    
    </>)
}
export default Navbar;