import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';


function convert24hTo12h(time24h) {
    // time24h is like "00:00", "13:30", etc.
    let [hour, minute] = time24h.split(':').map(n => parseInt(n, 10));
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert 0 -> 12, 13 -> 1, etc.
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function convert24hToMinutes(time24h) {
    // e.g. "00:30" -> 30, "13:00" -> 780
    const [hour, minute] = time24h.split(':').map(n => parseInt(n, 10));
    return hour * 60 + minute;
}


//Generate an array of 48 half-hour time slots for 24 hours
function generateTimeSlots24H() {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let half = 0; half < 2; half++) {
            const displayHour = hour.toString().padStart(2, '0');
            const displayMinute = half === 0 ? '00' : '30';
            slots.push(`${displayHour}:${displayMinute}`);
        }
    }
    return slots;
}

// Convert a "HH:MM AM/PM" string into total minutes from midnight
function parseTimeToMinutes(timeStr) {
    // e.g. "8:30 AM" -> 510
    if (!timeStr || !timeStr.includes(' ')) return 0;
    const [timePart, ampm] = timeStr.split(' ');
    let [hour, minute] = timePart.split(':').map(n => parseInt(n, 10));

    if (ampm.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
    }

    return hour * 60 + minute;
}




const StudySchedule = () => {

    const navigate = useNavigate();

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
            navigate("/view-schedules");
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
                    {/*    <div className="schedule-grid">*/}
                    {/*        {[...Array(7)].map((_, dayIndex) => {*/}
                    {/*            const weekStartStr = localStorage.getItem("WeekStartDate");*/}
                    {/*            let startOfWeek;*/}
                    {/*            if (weekStartStr) {*/}
                    {/*                // Split the "YYYY-MM-DD" string into components.*/}
                    {/*                const [year, month, day] = weekStartStr.split('-');*/}
                    {/*                // Create a new Date using local time (month is zero-indexed)*/}
                    {/*                startOfWeek = new Date(year, month - 1, day);*/}
                    {/*            } else {*/}
                    {/*                startOfWeek = new Date();*/}
                    {/*            }*/}
                    {/*            const columnDate = new Date(startOfWeek);*/}
                    {/*            columnDate.setDate(startOfWeek.getDate() + dayIndex);*/}

                    {/*            const formattedDate = columnDate.toLocaleDateString('en-CA');*/}
                    {/*            const sessionsForDay = groupedTimeSlots[formattedDate] || [];*/}

                    {/*            console.log("Checking for sessions on:", formattedDate);*/}
                    {/*            console.log("Available dates in groupedTimeSlots:", Object.keys(groupedTimeSlots));*/}
                    {/*            console.log(`Rendering sessions for ${formattedDate}:`, sessionsForDay);*/}

                    {/*            return (*/}
                    {/*                <div key={dayIndex} className={`schedule-day day-${dayIndex}`}>*/}
                    {/*                    <h3>*/}
                    {/*                        {columnDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}*/}
                    {/*                    </h3>*/}

                    {/*                    {sessionsForDay.length > 0 ? (*/}
                    {/*                        sessionsForDay.map((slot, i) => (*/}
                    {/*                            <div key={i} className="schedule-row">*/}
                    {/*                                <span className="time-label">*/}
                    {/*                                    {convertToAMPM(slot.startTime)} - {convertToAMPM(slot.endTime)}*/}
                    {/*                                </span>*/}
                    {/*                                <div className="study-session">*/}
                    {/*                                    <strong>{slot.subject}</strong>*/}
                    {/*                                </div>*/}
                    {/*                            </div>*/}
                    {/*                        ))*/}
                    {/*                    ) : (*/}
                    {/*                        <p className="empty-slot">No Sessions</p>*/}
                    {/*                    )}*/}
                    {/*                </div>*/}
                    {/*            );*/}
                    {/*        })}*/}
                    {/*    </div>*/}
                        </div>


                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    {/* First column: "Time" */}
                                    <th>Time</th>
                                    {/* Next 7 columns: each day from your stored weekStartDate */}
                                    {[...Array(7)].map((_, dayIndex) => {
                                        // Retrieve weekStart from localStorage
                                        const weekStartStr = localStorage.getItem("WeekStartDate");
                                        let startOfWeek;
                                        if (weekStartStr) {
                                            const [year, month, day] = weekStartStr.split('-');
                                            startOfWeek = new Date(year, month - 1, day);
                                        } else {
                                            startOfWeek = new Date();
                                        }

                                        // Calculate this column's date
                                        const columnDate = new Date(startOfWeek);
                                        columnDate.setDate(startOfWeek.getDate() + dayIndex);

                                        // Example: "Wed, Mar 26"
                                        const dayLabel = columnDate.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        });

                                        return <th key={dayIndex}>{dayLabel}</th>;
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {generateTimeSlots24H().map((slot24h, slotIndex) => {
                                    // slot24h is like "00:00", "00:30", ... "23:30"
                                    // Convert it to e.g. "12:00 AM" for display if you like, or keep 24h format
                                    // For checking sessions, we'll need to compare with parseTimeToMinutes(session.startTime).
                                    // But let's first display the 24h label in the left column.

                                    // Optionally, convert "00:00" to "12:00 AM" for display:
                                    const displayTime = convert24hTo12h(slot24h); // We'll define this below

                                    return (
                                        <tr key={slotIndex}>
                                            {/* Left column: the time label */}
                                            <td>{displayTime}</td>

                                            {/* Next 7 columns: each day */}
                                            {[...Array(7)].map((_, dayIndex) => {
                                                // Recompute the date for this column
                                                const weekStartStr = localStorage.getItem("WeekStartDate");
                                                let startOfWeek;
                                                if (weekStartStr) {
                                                    const [year, month, day] = weekStartStr.split('-');
                                                    startOfWeek = new Date(year, month - 1, day);
                                                } else {
                                                    startOfWeek = new Date();
                                                }
                                                const columnDate = new Date(startOfWeek);
                                                columnDate.setDate(startOfWeek.getDate() + dayIndex);
                                                const formattedDate = columnDate.toLocaleDateString('en-CA'); // "YYYY-MM-DD"

                                                // sessionsForDay from groupedTimeSlots
                                                const sessionsForDay = groupedTimeSlots[formattedDate] || [];

                                                // Check if any session covers this time slot
                                                // We treat each row as a half-hour block. We'll see if
                                                // parseTimeToMinutes(slot.startTime) <= currentSlot < parseTimeToMinutes(slot.endTime).

                                                const slotMinutes = convert24hToMinutes(slot24h); // We'll define this below
                                                // We'll see if there's exactly one session that covers it
                                                const sessionHere = sessionsForDay.find((sess) => {
                                                    const startMins = parseTimeToMinutes(sess.startTime);
                                                    const endMins = parseTimeToMinutes(sess.endTime);
                                                    return slotMinutes >= startMins && slotMinutes < endMins;
                                                });

                                                return (
                                                    <td key={dayIndex} className="schedule-cell">
                                                        {sessionHere ? (
                                                            <div className="study-session">
                                                                <strong>{sessionHere.subject}</strong>
                                                            </div>
                                                        ) : (
                                                            <div className="empty-slot"></div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>


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
