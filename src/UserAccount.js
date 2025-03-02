import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import "./UserAccount.css";
import { useNavigate } from 'react-router-dom';

function UserAccount() {
    //Declare state variables
    const [firstName, setFirstName]       = useState("");
    const [lastName, setLastName]         = useState("");
    const [email, setEmail]               = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword]         = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Notification toggle
    const [notificationEnabled, setNotificationEnabled] = useState(false);
    // Separate dropdowns for deadline / schedule
    const [deadlineOffset, setDeadlineOffset]   = useState("1day");
    const [scheduleOffset, setScheduleOffset]   = useState("1hour");

    const navigate = useNavigate();

    // Load user data from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
            try {
                const userData = JSON.parse(storedUser);
                setFirstName(userData.firstName || "");
                setLastName(userData.lastName || "");
                setEmail(userData.email || "");
                // Optionally set notifications from userData if stored:
                // setNotificationEnabled(userData.notificationEnabled === true);
                // setDeadlineOffset(userData.deadlineOffset || "1day");
                // setScheduleOffset(userData.scheduleOffset || "1hour");
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
            }
        } else {
            console.error("No valid user data found in localStorage.");
        }
    }, []);

    const handleSaveChanges = async () => {
        // If user wants to change password, check match
        if (newPassword && newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/update-user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    currentPassword,
                    newPassword,
                    // pass any new fields for notifications if you want to store them
                    notificationEnabled,
                    deadlineOffset,
                    scheduleOffset
                })
            });

            const result = await response.json();
            if (result.success) {
                console.log('User updated successfully');
                // Update localStorage with new user details
                localStorage.setItem('user', JSON.stringify({
                    firstName, lastName, email
                    // notificationEnabled, deadlineOffset, scheduleOffset
                }));
                alert('User information updated successfully!');
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('An error occurred while updating user information.');
        }
    };

    const handleDeleteUser = async () => {
        try {
            if(window.confirm("Press Ok if you are sure you want to delete your profile.\nThis action is permanent and cannot be reversed.")){
                const response = await fetch('http://localhost:3001/delete-user', {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const result = await response.json();
                if(result.success) {
                    console.log("User: " + email + " was deleted successfully");
                    alert(result.message);
                    localStorage.removeItem('user');
                    navigate('/');
                } else {
                    alert(result.message);
                }
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("An error occurred while attempting to delete your user profile, please try again later.");
        }
    };

    return (
        <>
            <Navbar />
            <div className='user-account-container'>
                <main className='user-account-content'>
                    <h2 className="section-title"> User Account</h2>

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

                    {/* Notification Settings */}
                    <h2 className='section-title'> Notification Settings</h2>
                    <div className='notification-section'>
                        <label>ON/OFF:</label>
                        <input
                            type='checkbox'
                            checked={notificationEnabled}
                            onChange={() => setNotificationEnabled(!notificationEnabled)}
                        />
                    </div>

                    {/* If ON, show two dropdowns for deadline + schedule */}
                    {notificationEnabled && (
                        <div className='notification-dropdowns'>
                            <div className='notification-dropdown'>
                                <label className='notif-label'>Deadline Notification:</label>
                                <select
                                    value={deadlineOffset}
                                    onChange={(e) => setDeadlineOffset(e.target.value)}
                                >
                                    <option value="1day">Never</option>
                                    <option value="1day">1 day before</option>
                                    <option value="2day">2 days before</option>
                                    <option value="3day">5 days before</option>
                                    <option value="1week">1 week before</option>
                                </select>
                            </div>

                            <div className='notification-dropdown'>
                                <label className='notif-label'>Schedule Notification:</label>
                                <select
                                    value={scheduleOffset}
                                    onChange={(e) => setScheduleOffset(e.target.value)}
                                >
                                    <option value="1day">Never</option>
                                    <option value="1hour">1 hour before</option>
                                    <option value="6hour">3 hours before</option>
                                    <option value="12hour">12 hours before</option>
                                    <option value="1day">1 day before</option>
                                    <option value="3day">3 days before</option>
                                    <option value="1week">1 week before</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className='buttons-container'>
                        <button
                            type='button'
                            className='save-button'
                            onClick={handleSaveChanges}
                        >
                            Save Changes
                        </button>
                        <button
                            type='button'
                            className='delete-button'
                            onClick={handleDeleteUser}
                        >
                            Delete Profile
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
}

export default UserAccount;
