import React, {useState} from 'react';
import './SignUp.css';
import Navbar from './Navbar';
//import googleIcon from './google-icon.png';


function SignUp(){
    //state variables for use input
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");


    //handle submission
    const handleSubmit = async (e) =>{
        e.preventDefault();

        //validate password confirmation
        if(password !== confirmPassword){
            setErrorMsg("Passwords do not match.");
            return;
        }

        //create new user object
        const newUser = {firstName, lastName, email, password};

        //sending user data to the backend
        try{
            const backendURL = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch('${backendURL/signup', {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify(newUser)
            });

            const result = await response.json();

            //check backend response
            if(result.success){
                alert(result.message);
            }else{
                setErrorMsg(result.message || 'An error occured.');
            }
        }catch(error){
                    console.error('Error: ', error);
                    setErrorMsg("Error connecting to the server.");
                }
            };
    return (
        <div>
        <Navbar/>
        <div className="sign-up-form">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
            <label>First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            
            <label>Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            
            <div className="checkbox-container">
                <input type="checkbox" id="termsCheckbox" required />
                <label htmlFor="termsCheckbox">
                    I agree to the <a href="/terms">Terms & Conditions</a>
                </label>
            </div>

            <button type="submit">Sign Up</button>
            {errorMsg && <p className="error-message">{errorMsg}</p>}
        </form>

        {/* this is for later :
         <div className="google-signup">
            <img src={googleIcon} alt="Google" width="20" />
            <span>Sign up with Google</span>
        </div> */}

        <div className="alternate-option">
            <span>Already have an account?<a href="/signin">Log in</a></span>
        </div>
    </div>
    </div>
    );
}
export default SignUp;
