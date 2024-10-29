//importing css styling for sign up button
import './SignUpButton.css';
//importing fonts
import '@fontsource/new-rocker';
import '@fontsource/palanquin';

//adding sing up button elemets
function SignUpButton(){
    return(<div className = "sign-up">
        <button type ="button" className='sign-up-button'>
          Sign Up Here
        </button>
      </div>)
}

export default SignUpButton;