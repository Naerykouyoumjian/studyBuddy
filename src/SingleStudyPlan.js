import React, { useEffect, useState } from 'react';
import './SingleStudyPlan.css';
import Navbar from './Navbar';
import { useParams, useNavigate } from 'react-router-dom';

const SingleStudyPlan = () => {
    const { planId } = useParams(); // Get plan ID from URL params
    const navigate = useNavigate();
    const [studyPlan, setStudyPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudyPlan = async () => {
            try {
                const backendURL = process.env.REACT_APP_BACKEND_URL;
                const response = await fetch(`${backendURL}/get-single-study-plan/${planId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch study plan');
                }
                const data = await response.json();
                setStudyPlan(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStudyPlan();
    }, [planId]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this study plan?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete-study-plan/${planId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Study plan deleted successfully.");
                navigate("/view-schedules"); // redirect to list
            } else {
                alert("Failed to delete the plan.");
            }
        } catch (error) {
            console.error("Error deleting the plan:", error);
            alert("An error occurred while deleting the plan.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!studyPlan) return <p>No study plan found.</p>;

    return (
        <>
            <Navbar />
            <div className="single-study-plan-container">
                <h2>{studyPlan.plan_text.title || `Study Plan #${studyPlan.id}`}</h2>
                <h3>Study Schedule</h3>
                {Array.isArray(studyPlan.plan_text) && studyPlan.plan_text.length > 0 ? (
  <div className="session-list">
    {studyPlan.plan_text.map((session, index) => (
      <div key={index} className="session-card">
        <p><strong>Date:</strong> {session.day} {session.date}</p>
        <p><strong>Subject:</strong> {session.subject}</p>
        <p><strong>Hours:</strong> {session.startTime} - {session.endTime}</p>
      </div>
    ))}
  </div>
) : (
  <p>No sessions found for this study plan.</p>
)}

                <button className="delete-plan-btn" onClick={handleDelete}>
                🗑️ Delete This Plan.
                </button>
            </div>
        </>
    );
};

export default SingleStudyPlan;