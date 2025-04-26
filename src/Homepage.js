/********************* 
use "npm install @fontsource/new-rocker" in terminal to install font family
use "npm install @fontsource/palanquin" in terminal to install font family 
**********************/
import React from 'react';
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
import useWindowWidth from './useWindowWidth.js';
import useWindowHeight from './useWindowHeight.js';

//adding homepage elements
function Homepage({onSignUpClick}){
    //getting window width for later use
    const {width} = useWindowWidth();
    const {height} = useWindowHeight();
    //returning homepage elements
    return (<>
        {/* takes boolean to varify sign in status.
            currently takes manual input, but will eventually
            recieve a variable to confirm users sign in status */}
        <Navbar/>

        <div className = "homepage-imgbox">
            <img className = "hp-image" 
                src = {require('./machinelearning.jpg')} 
                alt = "AI-Human Silhouette" 
                width = {width} 
                height = {height / 1.5}
                />
        </div>
        
        <h1 className = "headline">
            Let AI help you make your life easier
        </h1>

        <div className="feature-section-wrapper">
            <div className="feature-section">
                <h2 className="plans">Customized Study Plans</h2>
                <p className="plan-description">
                    Save time and effort with Study Buddy's AI-powered study schedules.
                </p>
                <img className="tools-icon"
                    src={tools}
                    alt="pencil crossed over ruler icon" />
            </div>

            <div className="feature-section">
                <h2 className="lists">Personalized To-Do Lists</h2>
                <p className="list-description">
                    Easily customize and organize your study tasks.
                </p>
                <img className="list-icon"
                    src={list}
                    alt="three lines with bullet points" />
            </div>

            <div className="feature-section">
                <h2 className="rem-serv">Reminder Service</h2>
                <p className="rem-description">
                    Never miss a study session or deadline with Study Buddy's built-in reminder service.
                </p>
                <img className="reminder-icon"
                    src={reminder}
                    alt="page with exclamation point being turned" />
            </div>
        </div>

        <div className="sign-up-container">
            <button onClick={onSignUpClick} className="sign-up-button">
                Sign Up Here
            </button>
        </div>
    </>
    );
}
  
export default Homepage;
