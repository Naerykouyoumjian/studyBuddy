import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ViewScheduleList.css';

const ViewScheduleList = () => {
    const [studyPlans, setStudyPlans] = useState([]);
    const navigate = useNavigate();

    //retrieve the logged-in user's email from local storage
    const storedUser = localStorage.getItem("user");
    const userEmail = storedUser ? JSON.parse(storedUser).email : "test@example.com"; //for testing

    useEffect(() => {
        if (!userEmail) {
            console.error("No user email found. Please log in.");
            return;
        }

        // Fetch study plans for the logged-in user
        fetch(`http://3.15.237.83:3001/get-study-plans/${userEmail}`)
            .then(response => response.json())
            .then(data => {
                setStudyPlans(data);
            })
            .catch(error => console.error("Error fetching study plans:", error));
    }, [userEmail]);

    const handleViewPlan = (plan) => {
        localStorage.setItem("StudyPlan", JSON.stringify(plan.plan_text));
        navigate("/study-schedule"); // Redirect to the detailed schedule page
    };

    return (
        <div className="schedule-list-container">
            <h2>Saved Study Plans</h2>
            {studyPlans.length === 0 ? (
                <p>No study plans found.</p>
            ) : (
                <ul>
                    {studyPlans.map((plan) => (
                        <li key={plan.id} onClick={() => handleViewPlan(plan)}>
                            {plan.plan_text.title} - Created on {new Date(plan.created_at).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewScheduleList;
