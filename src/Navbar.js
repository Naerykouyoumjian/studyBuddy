//importing css styling for navbar
import './Navbar.css';
//importing fonts
import '@fontsource/new-rocker';
import '@fontsource/palanquin';
import { Link } from "react-router-dom"

//adding Navbar elements
const Navbar = ({isSignedIn}) =>{
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
            {isSignedIn ? ( 
              <>
                <li><Link to ="/">Home</Link></li>
                <li><Link to ="/dashboard">Dashboard</Link></li>
                <li><Link to ="/faq">FAQ</Link></li>
                <li className = "signOut"><Link to ="/">Sign-Out</Link></li>
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