//importing libraries
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
//importing style sheet
import './ForgotPassword.css';
//importing font
import '@fontsource/palanquin';
//importing navigation bar
import Navbar from './Navbar.js';

//Function to handle Forgot Password feature
function ForgotPassword(){
    //email setter function
    const [email, setEmail] = useState("");

    //used to navigate directly to one of our webpages using Routes system
    const navigate = useNavigate();

    //function to process the E-mail user input
    const handleEmail = async (e) => {
        e.preventDefault();
        try{
            //by pass email system to get to reset password page: will be removed later, currrently only in for debugging purposes
            if(email === "1@1"){
                //navigates directly to reset password page
                navigate("/reset-password");
            }else{
                //sending a POST request to our email server (currently set on localhost 3002 will change once we have aws up and running) and awaiting response
                await axios.post("http://localhost:3002/", {email});
                //once response has been recived user is notified that the E-mail has been sent
                alert("Password reset link has been sent to your E-mail.");
            }
        } catch(error){
            //In case an error occurs while trying to send the E-mail -> most likely cause is forgetting to start the E-mail server
            console.error("Error:", error.response || error.message || error);
            alert("Error occured while sending E-mail, please try again")
        }
        
    };

    //returning webpage elements
    return (<>
        <Navbar isSignedIn = {false} />   
        <div>
            <form onSubmit = {handleEmail} className = "user-email">
                <h1> Trouble Signing In?</h1>
                <h3>Enter your email address to reset your password</h3>

                <input 
                    className = "e-mail" 
                    type = "email" 
                    value = {email} 
                    /*handeling email input from users */
                    onChange = {(e) => setEmail(e.target.value)} 
                    required 
                    placeholder = "Enter your Email"    
                />
                <button className = "send" type = "submit">Send</button>
            </form>
        </div>
    </>
    );
}

export default ForgotPassword;