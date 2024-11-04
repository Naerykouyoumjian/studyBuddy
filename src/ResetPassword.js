//importing libraries
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
//importing style sheet
import './ResetPassword.css';
//importing font
import '@fontsource/palanquin';
//importing navigation bar
import Navbar from './Navbar.js';

//Function to handel reset password feature
function ResetPassword(){
    //setters for new password, confirm password, and error message
    const [newPass, setPass] = useState("");
    const [confirmPass, setConfirm] = useState("");
    const [errMsg, setErrMsg] = useState("");
    
    //used to navigate directly to one of our webpages using Routes system
    const navigate = useNavigate();

    //processes password once both new and confirmation has been input
    const handleReset = (e) =>{
        e.preventDefault();
        //checks if new password matched the confrimed password
        if(newPass === confirmPass){
            //navigates directly to signin page -> will later hash and save to database
            navigate("/signin");
        }else{
            //sets error message in case the two passwords don't match
            setErrMsg(alert("The two passwords don't match, please try again"))
        }
    }

    //returns elements for reset password page
    return(<>
        <Navbar isSignedIn = {false} />
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
                {errMsg && {errMsg}}
            </form>
        </div>

    </>
    );
}

export default ResetPassword