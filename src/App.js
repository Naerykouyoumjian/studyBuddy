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
import CreateToDoList from './CreateToDoList';
import PreviewToDoLists from './PreviewToDoLists';
import ViewToDoList from './ViewToDoList';
import ViewScheduleList from './ViewScheduleList';
import SingleStudyPlan from './SingleStudyPlan';


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
                <Route path="/create-todolist" element={<CreateToDoList />} />
                <Route path="/preview-todolists" element={<PreviewToDoLists />} />
                <Route path="/view-todolist" element={<ViewToDoList />} />
                <Route path="/view-schedules" element={<ViewScheduleList />} />
                <Route path="/study-plan/:planId" element={<SingleStudyPlan />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;