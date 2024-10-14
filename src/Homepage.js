/********************* 
use "npm install @fontsource/new-rocker" in terminal to install font family
use "npm install @fontsource/palanquin" in terminal to install font family 
**********************/

//importing css styling for homepage 
import './Homepage.css';
//importing fonts
import '@fontsource/new-rocker';
import '@fontsource/palanquin';
//importing icon files
import tools from './iconmonstr-tools-8.svg';
import list from './iconmonstr-list-lined.svg';
import reminder from './iconmonstr-note-26.svg';
//importing other components
import Navbar from './Navbar.js';
import SignUpButton from './SignUpButton.js';
import useWindowWidth from './useWindowWidth.js';

//adding homepage elements
function Homepage(){
    //getting window width for later use
    const {width} = useWindowWidth();
    //returning homepage elements
    return (<>
        <Navbar />

        <div className = "homepage-imgbox">
            <img className = "hp-image" 
                src = {require('./homepage-image.png')} 
                alt = "AI-Human Silhouette" 
                width={width} />
        </div>
        
        <h1 className = "headline">
            Let AI help you make your life easier
        </h1>

        <div className = "feature-list">
            <h3 className = "study-plans">
                Customized Study Plans
                <img className = "tools-icon"
                src = {tools}
                alt = "pencil crossed over ruler icon" />
            </h3>

            <h3 className = "to-do-lists">
                Personalized To-Do Lists
                <img className = "list-icon"
                src = {list}
                alt = "three lines with bullet points" />
            </h3>

            <h3 className = "reminders">
                Reminder Service
                <img className = "reminder-icon"
                src = {reminder}
                alt = "page with exclimation point being turned" />
            </h3>
        </div>

        <SignUpButton />
    </>)
}
  
export default Homepage;