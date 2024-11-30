//importing libraries
import React, {useState} from "react";

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

    //function to process the E-mail user input
    const handleEmail = async (e) => {
        e.preventDefault();
        try{
            //post request to find email in our database
            const backendURL = process.env.REACT_APP_BACKEND_URL;
            const emailServerURL = process.env.REACT_APP_EMAIL_SERVER_URL;

            const response = await fetch(`${backendURL}/find-email`,{
                method: "POST",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify({email: email})
            });

            //getting results from the find email post request
            const result = await response.json();
            //if the email exists in our database
            if(result.success){
                //post request to send the reset password email
                const emailResponse = await fetch(`${emailServerURL}/reset-password-email`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({email})
                });

                //getting results from the post request to send the email
                const emailResult = await emailResponse.json();
                //sending appropriate message based on if the email was sent or not
                if(emailResult.success){
                    alert(emailResult.message);
                }else{
                    alert(emailResult.message);
                }
                
            }else{
                //email was not found in our database and user is notified
                alert(result.message)
            }
        } catch(error){
            //In case an error occurs while trying to send the E-mail -> most likely cause is forgetting to start the E-mail server
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