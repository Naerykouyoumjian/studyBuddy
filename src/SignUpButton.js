import React from 'react';
//importing css styling for sign up button
import './SignUpButton.css';
//importing fonts
import '@fontsource/new-rocker';
import '@fontsource/palanquin';

//adding sing up button elemets
function SignUpButton({onSignUpClick}){
    return(<div className = "sign-up">
        <button type ="button" className='sign-up-button' onClick={onSignUpClick}>
          Sign Up Here
        </button>
      </div>);
}

export default SignUpButton;