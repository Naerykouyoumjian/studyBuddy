import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import "./UserAccount.css";
import { useNavigate } from 'react-router-dom';

function UserAccount() {
    //Declare state variables
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notificationEnabled, setNotificationEnabled] = useState(false);
    const navigate = useNavigate();
    const [isEditingFirstName, setIsEditingFirstName] = useState(false);
    const [isEditingLastName, setIsEditingLastName] = useState(false);



    // Load user data from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
            try {
                const userData = JSON.parse(storedUser);
                setFirstName(userData.firstName || "");
                setLastName(userData.lastName || "");
                setEmail(userData.email || "");
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
            }
        } else {
            console.error("No valid user data found in localStorage.");
        }
    }, []);

    const handleSaveChanges = async () => {
        try {
            const backendURL = process.env.REACT_APP_BACKEND_URL;
            console.log("Backend URL: ", backendURL);
            const response = await fetch(`${backendURL}/update-user`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    currentPassword,
                    newPassword
                })
            });
    
            const result = await response.json();
            if (result.success) {
                console.log('User updated successfully');
                // Update localStorage with new user details
                localStorage.setItem('user', JSON.stringify({ firstName, lastName, email }));
                alert('User information updated successfully!');
                setIsEditingFirstName(false);
                setIsEditingLastName(false);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('An error occurred while updating user information.');
        }
    };


    const handleDeleteUser = async () => {
        try{
            
            if(window.confirm("Press Ok if you are sure you want to delete your profile.\nThis action is permanent and cannot be reversed.")){
                const backendURL = process.env.REACT_APP_BACKEND_URL;
                console.log("Backend URL: ", backendURL);
                const response = await fetch(`${backendURL}/delete-user`,{
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email
                    })
                });

                const result = await response.json();
                if(result.success){
                    console.log("User: " + email + " was deleted successfully");
                    alert(result.message);
                    localStorage.removeItem('user');
                    navigate('/');
                }else{
                    alert(result.message);
                }
            }
        }catch (error){
            console.error("Error deleting user:", error);
            alert("An error occurred while attempting to delete your user profile, please try again later.");
        }
        
    };
    
    

    return (
        <>
        <Navbar/>
        <div className='user-account-container'>
            <main className='user-account-content'>
            <h2 className= "section-title"> User Account</h2>

            <div className='side-by-side-sections'>
            <div className='user-account-section'>
                <h3 className='section-title'>User Details</h3>
                <div className='form-group'>
                    <label>First Name: </label>
                    <div className='editable-field'>
                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        readOnly={!isEditingFirstName}
                    />
                                    <span
                                        className='edit-icon'
                                        onClick={() => setIsEditingFirstName(true)}
                                    >&#9998;
                                    </span> {/*Edit icon*/}
                    </div>
                </div>
                <div className='form-group'>
                    <label>Last Name: </label>
                    <div className='editable-field'>
                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        readOnly={!isEditingLastName}
                    />
                                    <span className='edit-icon'
                                        onClick={() => setIsEditingLastName(ture)}
                                            >
                                            &#9998;
                                    </span> {/*Edit icon*/}

                </div>
                </div>
                <div className = 'form-group'>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className='readonly-input' 
                    />
                </div>
            </div>

            <div className='change-password-section'>
                <h3 className='section-title'>Change Password</h3>
                    <div className='form-group'>
                    <label>Current Password: </label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                    />
                    </div>
                    <div className='form-group'>
                    <label>New Password: </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)} 
                    />
                    </div>
                    <div className='form-group'>
                    <label>Confirm New Password: </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                    </div>
                </div>
                </div>

                <h2 className= 'section-title'> Notification Settings</h2>
                    <div className='notification-section'>
                    <label>ON/OFF:</label>
                    <input
                    type='checkbox'
                    checked={notificationEnabled}
                    onChange={() => setNotificationEnabled(!notificationEnabled)}
                    />
                    </div>

                    {/*button style*/}
                    <div className='buttons-container'>
                        <button type='button' className='save-button' onClick={handleSaveChanges}>Save Changes</button>
                        <button type='button' className='delete-button' onClick={handleDeleteUser}>Delete Profile</button>
                    </div>
            </main>
        </div>
        </>
    );
}

export default UserAccount;