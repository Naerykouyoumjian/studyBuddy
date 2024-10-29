//importing css styling for navbar
import './Navbar.css';
//importing fonts
import '@fontsource/new-rocker';
import '@fontsource/palanquin';

//adding Navbar elements
const Navbar = ({isSignedIn}) =>{
    return(<>
    <nav className = "navbar">
        <div className = "navbar-left">
          <a href ="/" className = "logo">
            StudyBuddy
          </a>
        </div>
        <div className = "navbar-right">
          <ul className = "navbar-links">
            {/*Check if user is signed in, when true show options 
              for the signed in navbar. When false show main navbar
            */}
            {isSignedIn ? ( 
              <>
                <li><a href ="/">Home</a></li>
                <li><a href ="/">Dashboard</a></li>
                <li><a href ="/">FAQ</a></li>
                <li className = "signOut"><a href ="/">Sign-Out</a></li>
              </>
            ) : (
              <>
                <li><a href ="/">Home</a></li>
                <li><a href ="/">FAQ</a></li>
                <li className = "signIn"><a href ="/">Sign In</a></li>
              </>
            )} 
          </ul>
        </div>
      </nav>
    
    </>)
}
export default Navbar;