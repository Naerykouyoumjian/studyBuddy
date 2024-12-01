//importing libraries
import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
//importing style sheet
import './ResetPassword.css';
//importing font
import '@fontsource/palanquin';
//importing navigation bar
import Navbar from './Navbar.js';

//Function to handel reset password feature
function ResetPassword(){
    //setters for new password, confirm password, and token
    const [newPass, setPass] = useState("");
    const [confirmPass, setConfirm] = useState("");
    const [token, setToken] = useState("");
    
    //used to navigate directly to one of our webpages using Routes system
    const navigate = useNavigate();

    //useEffect function for setting token from the URL
    useEffect(() =>{
        //getting URL of current webpage
        const params = new URLSearchParams(window.location.search);
        //parsing token from the URL
        const token = params.get("token");
        //setting token 
        setToken(token);
    }, []);
    
    //processes password once both new and confirmation has been input
    const handleReset = async (e) =>{
        e.preventDefault();
        //checks if new password matched the confrimed password
        if(newPass === confirmPass){
           try{
            //post request to save the new password for the associated user
            const response = await fetch("http://localhost:3001/save-new-password", {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({token, password: newPass})
            });

            //getting results from save password request
            const result = await response.json();
            if(result.success){
                //password was successfully saved user is notified and redirected to the sign in page
                alert(result.message);
                navigate("/signin");
            }else{
                //password was not saved and user is notified
                alert(result.message);
            }
           }catch(error){
            //an error connecting to the server occured and the user is notified
            alert("Error connecting to the server");
           }
        }else{
            //the two passwords don't match and the user is notified
            alert("The two passwords don't match, please try again");
        }
    }

    //returns elements for reset password page
    return(<>
        <Navbar/>
        <div>
            <form onSubmit = {handleReset} className = "password-change">
                <div className="new-password">
                    <label>New Password</label>
                    <input
                        className = "newPass-input"
                        type = "password"
                        value = {newPass}
                        /*handels user input for new password */
                        onChange = {(e) => setPass(e.target.value)}
                        required
                        placeholder = "Enter New Password"
                    />
                </div>

                <div className = "confirm-password">
                    <label>Confirm Password</label>
                    <input
                        className = "confirmPass-input"
                        type = "password"
                        value = {confirmPass}
                        /*handels user input for password confirmation */
                        onChange = {(e) => setConfirm(e.target.value)}
                        required
                        placeholder = "Confirm Password"
                    />
                </div>

                <button className="confirm" type = "submit">Confirm</button>
            </form>
        </div>

    </>
    );
}

export default ResetPassword

/*
add this create statement to database to create reset_tokens table:
create table reset_tokens(
	id INT AUTO_INCREMENT PRIMARY KEY,
	email VARCHAR(100) NOT NULL UNIQUE,
    token VARCHAR(50) NOT NULL UNIQUE,
    expiration DATETIME NOT NULL,
    FOREIGN KEY (email) REFERENCES users(email)
);
*/