import React, {useState} from 'react';
import Navbar from './Navbar';
import "./UserAccount.css";

function UserAccount() {
    //Declare state variables
    const [firstName, setFirstName] = useState("Baba");
    const [lastName, setLastName] = useState("Tunde");
    const [email, setEmail] = useState("babatunde@thepycs.com");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notificationEnabled, setNotificationEnabled] = useState(false);

    return (
        <div className='user-account-container'>
            <Navbar isSignedIn={true} />
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
                    />
                    <span className='edit-icon'>&#9998;</span> {/*Edit icon*/}
                    </div>
                </div>
                <div className='form-group'>
                    <label>Last Name: </label>
                    <div className='editable-field'>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)} 
                    />
                    <span className='edit-icon'>&#9998;</span> {/*Edit icon*/}

                </div>
                </div>
                <div>
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
                        <button type='button' className='save-button'>Save Changes</button>
                        <button type='button' className='delete-button'>Delete Profile</button>
                    </div>
            </main>
        </div>
    );
}

export default UserAccount;