import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./ViewScheduleList.css";
import SingleStudyPlan from './SingleStudyPlan';


const ViewScheduleList = () => {
    const [studyPlans, setStudyPlans] = useState([]);
    const user = JSON.parse(localStorage.getItem("user")); // Get logged-in user
    const userEmail = user?.email || ""; 

    useEffect(() => {
        const fetchStudyPlans = async () => {
            try {
                const backendURL = process.env.REACT_APP_BACKEND_URL;
                const response = await fetch(`${backendURL}/get-study-plans/${userEmail}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch study plans");
                }

                const data = await response.json();
                setStudyPlans(data);
            } catch (error) {
                console.error("Error fetching study plans:", error);
            }
        };

        if (userEmail) {
            fetchStudyPlans();
        }
    }, [userEmail]);

    const handleDelete = async (planId) => {
        const confirmed = window.confirm("Are you sure you want to delete this study plan?");
        if (!confirmed) return;
      
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete-study-plan/${planId}`, {
            method: "DELETE",
          });
      
          if (response.ok) {
            setStudyPlans(studyPlans.filter(plan => plan.id !== planId));
          } else {
            console.error("Failed to delete study plan");
          }
        } catch (err) {
          console.error("Error deleting study plan:", err);
        }
      };

      
    return (
        <>
            <Navbar />
            <div className="view-schedules-container">
                <h2>Your Saved Study Plans</h2>
                {studyPlans.length === 0 ? (
                    <p>No saved study plans found.</p>
                ) : (
                    <ul className="study-plans-list">
  {studyPlans.map((plan) => (
    <li key={plan.id} className="study-plan-entry">
      <Link to={`/view-schedule/${plan.id}`}>
        {plan.plan_text.title || `Study Plan #${plan.id}`} - {new Date(plan.created_at).toLocaleDateString()}
      </Link>
      <span
        className="delete-icon"
        title="Delete this plan"
        onClick={() => handleDelete(plan.id)}
        style={{ marginLeft: "10px", cursor: "pointer", color: "red" }}
      >
        🗑️
      </span>
    </li>
  ))}
</ul>
                )}
            </div>
        </>
    );
};

export default ViewScheduleList;
