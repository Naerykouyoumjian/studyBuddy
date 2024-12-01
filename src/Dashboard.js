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
          <div className="card" onClick={() => alert("Create Schedule")}>
            <div className="icon">&#128197;</div>
            <div className="label">Create Schedule</div>
          </div>
          <div className="card" onClick={() => alert("Create To-Do List")}>
            <div className="icon">&#128221;</div>
            <div className="label">Create To-Do List</div>
          </div>
          <div className="card" onClick={() => alert("View Schedules")}>
            <div className="icon">&#128198;</div>
            <div className="label">View Schedules</div>
          </div>
          <div className="card" onClick={() => alert("View To-Do Lists")}>
            <div className="icon">&#128462;</div>
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
