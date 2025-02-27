import React, { useState } from 'react';
import Homepage from './Homepage';
import SignUp from './SignUp';
import UserAccount from './UserAccount';
import Login from './Login';
import FAQ from './FAQ';
import StudyPlanPage from './StudyPlanPage';
import { Route, Routes } from "react-router-dom";
import NotFound from "./NotFound";
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Dashboard from './Dashboard';
import StudySchedule from './StudySchedule';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
        setShowLogin(false);
        window.location.href = "/dashboard";
    };

    const handleShowSignUp = () => {
        setShowSignUp(true);
        setShowLogin(false);
        window.location.href = "/signup";
    };

    const handleShowLogin = () => {
        setShowLogin(true);
        setShowSignUp(false);
        window.location.href = "/signin";
    };

    return (
        <>
            {/*Routes for our webpages */}
            <Routes>
                <Route path="/" element={<Homepage onSignUpClick={handleShowSignUp} />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/signin" element={<Login onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/user-account" element={<UserAccount />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/study-plan" element={<StudyPlanPage />} />
                <Route path="/study-schedule" element={<StudySchedule />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;