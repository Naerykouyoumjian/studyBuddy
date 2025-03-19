import React, { useState, useEffect, useMemo } from 'react';
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';


const StudySchedule = () => {

    const convertTo24Hour = (time) => {
        if (!time || typeof time !== "string") return null;

        const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i);
        if (!match) return null; // Return 0 if time is invalid

        let [, hour, minute, period] = match;
        hour = parseInt(hour, 10);

        if (period?.toUpperCase() === "PM" && hour !== 12) {
            hour += 12;
        } else if (period?.toUpperCase() === "AM" && hour === 12) {
            hour = 0;
        }

        return hour * 60 + parseInt(minute);
    };


    //function to convert time to 24 hours
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

    //state to manage selected date on the calendar
    const [selectedDate, setSelectedDate] = useState(new Date());

    //state to store the retrieved study plan
    const [studyPlan, setStudyPlan] = useState(() => {
        const storedPlan = localStorage.getItem("StudyPlan");
        return storedPlan ? JSON.parse(storedPlan) : null;
    });

    //Memorized study Schedule
    const groupedTimeSlots = useMemo(() => {
        if (!Array.isArray(studyPlan) || studyPlan.length === 0) {
            console.warn("Study plan is empty, skipping computation.");
            return {};
        }

        console.log("Processing studyPlan:", studyPlan);

        const groupedSlots = studyPlan.reduce((acc, session) => {
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
                console.log("Study plan successfully updated in state:", parsedPlan); // Log the updated state
            } else {
                console.error("Invalid study plan format:", parsedPlan);
            }
        } catch (error) {
            console.error("Error parsing stored study plan:", error);
        }
    }, []);



     ////might need later
    //function to extract time slots from the study plan
    //const extractTimeSlots = (plan) => {
    //    if (!plan) return;  //to prevent errors if study plan is empty

    //    try {
    //                //parse the JSON string 
    //                const extractedSlots = JSON.parse(plan);

    //                //set the extracted slots into state
    //        setTimeSlots(extractedSlots);

    //            } catch (error) {
    //                console.error("Error parsing study plan JSON:", error);
    //            }
    //};

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
                              const hour = i % 12 || 12; // Convert 24-hour to 12-hour format
                              const period = i < 12 ? "AM" : "PM";
                              return <div key={i} className="time-label">{`${hour}:00 ${period}`}</div>;
                          })}
                      </div>
                      <div className="schedule-grid">
                          {[...Array(7)].map((_, dayIndex) => {
                              const uniqueDates = Object.keys(groupedTimeSlots).sort(); // Get all stored dates
                              const columnDate = new Date(uniqueDates[dayIndex]); // Use actual saved dates instead of current week

                              // Format date to match stored format
                              const formattedDate = columnDate.toISOString().split('T')[0];

                              // Get sessions for this date
                              console.log("Checking for sessions on:", formattedDate);
                              console.log("Available dates in groupedTimeSlots:", Object.keys(groupedTimeSlots));

                              const sessionsForDay = groupedTimeSlots[formattedDate] || [];
                              console.log(`Rendering sessions for ${formattedDate}:`, sessionsForDay);

                              return (
                                  <div key={dayIndex} className={`schedule-day day-${dayIndex}`}>
                                      {/* Show day name + formatted date */}
                                      <h3>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex]}</h3>
                                      <h4>{columnDate.toDateString()}</h4>

                                      {/* Render sessions if any exist for this day */}
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
          <button className="save-plan">Save Plan</button>
          <button className="delete-plan">Delete Plan</button>
                  </div>
                  </div>
      </div>
    </>
  );
};

export default StudySchedule;
