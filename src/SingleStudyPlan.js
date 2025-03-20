import React, { useEffect, useState } from 'react';
import './SingleStudyPlan.css';
import Navbar from './Navbar';
import { useParams } from 'react-router-dom';

const SingleStudyPlan = () => {
    const { planId } = useParams(); // Get plan ID from URL params
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!studyPlan) return <p>No study plan found.</p>;

    return (
        <>
            <Navbar />
            <div className="single-study-plan-container">
                <h2>{studyPlan.title || `Study Plan #${studyPlan.id}`}</h2>
                <h3>Study Schedule</h3>
                {Array.isArray(studyPlan.plan_text) && studyPlan.plan_text.length > 0 ? (
                    <ul>
                        {studyPlan.plan_text.map((session, index) => (
                            <li key={index}>
                                <strong>{session.day}:</strong> {session.subject} ({session.startTime} - {session.endTime})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No sessions found for this study plan.</p>
                )}
            </div>
        </>
    );
};

export default SingleStudyPlan;