//importing css styling for navbar
import './Navbar.css';
//importing fonts
import '@fontsource/new-rocker';
import '@fontsource/palanquin';

//adding Navbar elements
function Navbar(){
    return(<>
    <nav className = "navbar">
        <div className = "navbar-left">
          <a href ="/" className = "logo">
            StudyBuddy
          </a>
        </div>
        <div className = "navbar-right">
          <ul className = "navbar-links">
            <li>
              <a href ="/">Home</a>
            </li>
            <li>
              <a href ="/">Features</a>
            </li>
            <li>
              <a href ="/">FAQ</a>
            </li>
            <li>
              <a href ="/">Login</a>
            </li>
          </ul>
        </div>
      </nav>
    
    </>)
}
export default Navbar;