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

        // Filter out invalid entries
        const validSlots = studyPlan.filter(session =>
            session.startTime && session.endTime && session.date
        );

        if (validSlots.length === 0) {
            console.error("No valid sessions found in study plan.");
            return {};
        }

        // Group by date
        const groupedSlots = validSlots.reduce((acc, session) => {
            const formattedDate = session.date;

            if (!acc[formattedDate]) acc[formattedDate] = [];
            acc[formattedDate].push(session);
            return acc;
        }, {});

        // Sort sessions within each date **after** reducing
        Object.keys(groupedSlots).forEach(date => {
            groupedSlots[date].sort((a, b) =>
                convertTo24Hour(a.startTime) - convertTo24Hour(b.startTime)
            );
        });

        console.log("Updated groupedTimeSlots:", groupedSlots);
        return groupedSlots;

    }, [studyPlan]);


    useEffect(() => {
        if (!studyPlan || studyPlan.length === 0) {
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
                    if (JSON.stringify(parsedPlan) !== JSON.stringify(studyPlan)) {
                        setStudyPlan(parsedPlan); // Only update state if different
                    }
                } else {
                    console.error("Invalid study plan format:", parsedPlan);
                }
            } catch (error) {
                console.error("Error parsing stored study plan:", error);
            }
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
                          {Object.keys(groupedTimeSlots)
                              .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                              .map((dateKey) => {
                                  const dayIndex = new Date(dateKey).getDay();
                                  console.log(`Rendering schedule for: ${dateKey}`, groupedTimeSlots[dateKey]);  
                                  return (
                                      <div key={dateKey} className={`schedule-day day-${dayIndex}`}>
                                          <h3>{new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>

                                          <div className="schedule-content">
                                              {groupedTimeSlots[dateKey]?.map((slot, index) => (
                                                  <div key={index} className="study-session" style={{ gridRow: Math.floor(convertTo24Hour(slot.startTime) / 60) + 1 }}>
                                                      <span className="time-label">
                                                          {convertToAMPM(slot.startTime)} - {convertToAMPM(slot.endTime)}
                                                      </span>
                                                      <div className="session-box">
                                                          <strong>{slot.subject}</strong>
                                                      </div>
                                                  </div>

                                              ))}
                                          </div>
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
