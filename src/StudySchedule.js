import React, { useState, useEffect, useMemo } from 'react';
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';

const StudySchedule = () => {
    const convertToAMPM = (time) => {
        if (!time || typeof time !== "string" || !time.includes(":")) return "Invalid Time";

        let [hour, minute] = time.split(":");
        hour = parseInt(hour, 10);
        minute = parseInt(minute, 10);

        let period = hour >= 12 ? "PM" : "AM";
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12; // Midnight case

        return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
    };

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [studyPlan, setStudyPlan] = useState(() => {
        const storedPlan = localStorage.getItem("StudyPlan");
        return storedPlan ? JSON.parse(storedPlan) : null;
    });

    const groupedTimeSlots = useMemo(() => {
        if (!Array.isArray(studyPlan) || studyPlan.length === 0) {
            console.warn("Study plan is empty, skipping computation.");
            return {};
        }

        console.log("Processing studyPlan:", studyPlan);

        const groupedSlots = studyPlan.reduce((acc, session) => {
            if (!session.date) {
                console.error("Skipping session with missing date:", session);
                return acc;
            }

            const formattedDate = session.date;
            if (!acc[formattedDate]) acc[formattedDate] = [];
            acc[formattedDate].push(session);
            return acc;
        }, {});

        console.log("Grouped study sessions by date:", groupedSlots);
        return groupedSlots;
    }, [studyPlan]);

    useEffect(() => {
        console.log("Fetching study plan from local storage...");

        const storedPlan = localStorage.getItem("StudyPlan");
        if (!storedPlan || storedPlan.trim() === "") {
            console.warn("No stored study plan found.");
            return;
        }

        try {
            const parsedPlan = JSON.parse(storedPlan);
            console.log("Loaded study plan from storage:", parsedPlan);

            if (Array.isArray(parsedPlan) && parsedPlan.every(entry => entry.day && entry.startTime && entry.endTime)) {
                setStudyPlan(parsedPlan);
                console.log("Study plan successfully updated in state:", parsedPlan);
            } else {
                console.error("Invalid study plan format:", parsedPlan);
            }
        } catch (error) {
            console.error("Error parsing stored study plan:", error);
        }
    }, []);

    const handleSavePlan = async () => {
        console.log("Save button clicked!");

        if (!studyPlan || studyPlan.length === 0) {
            console.warn("No study plan to save.");
            return;
        }

        // Fetch user email from local storage
        const user = JSON.parse(localStorage.getItem("user"));
        const userEmail = user?.email; // Extract email

        if (!userEmail) {
            console.error("No user email found. User might not be logged in.");
            alert("Error: User email is missing. Please log in again.");
            return;
        }

        console.log("User email:", userEmail);
        console.log("Study plan found:", studyPlan);

        try {
            const response = await fetch("http://3.15.237.83:3001/save-study-plan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userEmail,  // Send dynamic email
                    studyPlan,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Study plan saved successfully:", result);
            alert("Study plan saved successfully!");
        } catch (error) {
            console.error("Error saving study plan:", error);
            alert("Failed to save study plan.");
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <>
            <Navbar /> {/* StudyBuddy Navbar */}

            <div className="schedule-page">
                <div className="schedule-content-wrapper">
                    {/* Schedule Section */}
                    <div className="schedule-container">
                        <div className="time-column">
                            {Array.from({ length: 24 }, (_, i) => {
                                const hour = i % 12 || 12;
                                const period = i < 12 ? "AM" : "PM";
                                return <div key={i} className="time-label">{`${hour}:00 ${period}`}</div>;
                            })}
                        </div>
                        <div className="schedule-grid">
                            {[...Array(7)].map((_, dayIndex) => {
                                const uniqueDates = Object.keys(groupedTimeSlots).sort();
                                const columnDate = uniqueDates[dayIndex] ? new Date(uniqueDates[dayIndex]) : new Date();

                                const formattedDate = columnDate.toISOString().split('T')[0];

                                console.log("Checking for sessions on:", formattedDate);
                                console.log("Available dates in groupedTimeSlots:", Object.keys(groupedTimeSlots));

                                const sessionsForDay = groupedTimeSlots[formattedDate] || [];
                                console.log(`Rendering sessions for ${formattedDate}:`, sessionsForDay);

                                return (
                                    <div key={dayIndex} className={`schedule-day day-${dayIndex}`}>
                                        <h3>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex]}</h3>
                                        <h4>{columnDate.toDateString()}</h4>

                                        {sessionsForDay.length > 0 ? (
                                            sessionsForDay.map((slot, i) => (
                                                <div key={i} className="schedule-row">
                                                    <span className="time-label">
                                                        {convertToAMPM(slot.startTime)} - {convertToAMPM(slot.endTime)}
                                                    </span>
                                                    <div className="study-session">
                                                        <strong>{slot.subject}</strong>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="empty-slot">No Sessions</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Calendar Section */}
                    <div className="calendar-section">
                        <h3>Calendar</h3>
                        <Calendar
                            onChange={handleDateChange}
                            value={selectedDate}
                            className="custom-calendar"
                        />
                        <button className="save-plan" onClick={handleSavePlan}>Save Plan</button>
                        <button className="delete-plan">Delete Plan</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudySchedule;
