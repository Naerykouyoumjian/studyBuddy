import React, {useState} from 'react';

function StudentProfile() {
    //Declare state variables
    const [firstName, setFirstName] = useState("Baba");
    const [lastName, setLastName] = useState("Tunde");
    const [email, setEmail] = useState("babatunde@thepycs.com");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    //Function to save the changes
    const handleSaveChanges = () => {
        //check if new password matched confirmation
        if (newPassword !== confirmPassword){
            alert("New password and confirmation doesn't match!");
            return;
        }

        //create object with the updated user info
    const updatedUser = {
        firstName,
        lastName,
        email,
        currentPassword,
        newPassword,
    };

    //send "updatedUser to the backEnd API"
    //need to do it later, but for now just write on screen
    console.log("Updated User Info: ", updatedUser);

    //clear password fields for security
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    //show alert that the profile was updated successfully
    alert("Profile updated!");
};

//function to handle submission form
const handleSubmit = (e) => {
    e.preventDefault(); //Prevent the default submission form
    handleSaveChanges(); //call the save function when the form is submitted
};

    return (
        <div>
            <h1>StudentProfile</h1>
            <form>
                <div>
                    <label>First Name: </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Last Name: </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Current Password: </label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                    />
                </div>
                <div>
                    <label>New Password: </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Confirm New Password: </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                </div>
                <button type="submit" disabled={newPassword !== confirmPassword}>Save Changes</button>
            </form>
        </div>
    );
}

export default StudentProfile;