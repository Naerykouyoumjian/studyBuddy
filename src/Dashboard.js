import React from "react";
import "./Dashboard.css"; 
import Navbar from "./Navbar"; 
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <>
      <Navbar/> 
      <div className="dashboard">
        <h1>User Dashboard</h1> 
        <div className="dashboard-content">
          <div className="card" onClick={() => navigate("/study-plan")}>
            <div className="icon">&#128197;</div>
            <div className="label">Create Schedule</div>
          </div>
          <div className="card" onClick={() => navigate("/create-todolist")}>
            <div className="icon">&#128221;</div>
            <div className="label">Create To-Do List</div>
          </div>
          <div className="card" onClick={() => alert("View Schedules has been pressed.\nThis feature has not been implemented yet.\nConsider checking out our User Account page instead")}>
            <div className="icon">&#128198;</div>
            <div className="label">View Schedules</div>
          </div>
          <div className="card" onClick={() => navigate("/preview-todolists")}>
            <div className="icon" style={{fontSize: '7.5rem'}}>&#128462;</div>
            <div className="label">View To-Do Lists</div>
          </div>
          <div className="card" onClick={() => navigate("/user-account")}>
            <div className="icon">&#128100;</div>
            <div className="label">User Account</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
