import React, { useState, useEffect, useMemo } from 'react';
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';


const StudySchedule = () => {

    const convertTo24Hour = (time) => {
        if (!time || typeof time !== "string") return 0;

        const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i);
        if (!match) return 0; // Return 0 if time is invalid

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

        let period = "AM";
        if (hour >= 12) {
            period = "PM";
            if (hour > 12) hour -= 12;
        } else if (hour === 0) {
            hour = 12; // Midnight case
        }

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
        if (!studyPlan || studyPlan.length === 0) {
            console.warn("Study plan is empty, skipping computation.");
            return {};
        }
        console.log("Processing groupTimedSlots from studyPlan:", studyPlan);

        //check if the study plan contains valid date values
        const validSlots = studyPlan.filter(session => session.startTime && session.endTime);

        if (validSlots.length === 0) {
            console.error("No valid sessions found in study plan.");
            return {};
        }

        // Sort by start time before setting timeSlots
        const sortedSlots = [...validSlots].sort((a, b) =>
            convertTo24Hour(a.startTime) - convertTo24Hour(b.startTime)
        );

        //group by day
        const groupedSlots = sortedSlots.reduce((acc, session) => {

            const sessionDate = new Date(session.date);

            if (isNaN(sessionDate.getTime())) {
                console.error("Invalid date format:", session.date);
                return acc;
            }

            const formattedDate = sessionDate.toLocaleDateString(undefined, {
                weekday: 'long',  // example "Monday"
                month: 'short',   // example "Mar"
                day: 'numeric',    // example "18"
                year: 'numeric' //example "2025"
            });

            if (!acc[formattedDate]) acc[formattedDate] = [];
            acc[formattedDate].push(session);
            return acc;
        }, {});

        console.log("Updated groupedTimeSlots:", groupedSlots);
        return groupedSlots;
    }, [studyPlan]);


    useEffect(() => {
        if (!studyPlan || studyPlan.length === 0) {
            console.log("Fetching study plan from local storage...");

            //retrieve the study plan from the local storage
            const storedPlan = localStorage.getItem("StudyPlan");
            if (!storedPlan || storedPlan.trim() === "") {
                console.warn("No stored study plan found.");
                return;
            }
            try {
                //parse the stored JSON string 
                const parsedPlan = JSON.parse(storedPlan);
                console.log("Loaded study plan from storage:", parsedPlan); //debug
                if (Array.isArray(parsedPlan) && parsedPlan.every(entry => entry.day && entry.startTime && entry.endTime)) {
                    setStudyPlan(parsedPlan);
                    console.log("Updated studyPlan state:", parsedPlan);
                } else {
                    console.error("Invalid study plan format:", parsedPlan);
                }
            } catch (error) {
                console.error("Error parsing stored study plan:", error);
            }
        }
    }, [studyPlan]);


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
                      <div className="week-header">
                          <span> Sun</span>
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                      </div>

                      <div className="schedule-grid">
                          {Object.keys(groupedTimeSlots)
                              .sort((a, b) => new Date(a) - new Date(b))
                              .map((day) => {
                                  return (
                                      <div key={day} className="schedule-day">
                                          <h3>{day}</h3>
                                          <div className="schedule-content">
                                              {Array.from({ length: 48 }, (_, i) => {
                                                  let hour = Math.floor(i / 2);
                                                  let minute = i % 2 === 0 ? "00" : "30";

                                                  let period = hour < 12 ? "AM" : "PM";
                                                  if (hour === 0) hour = 12; // Midnight case
                                                  if (hour > 12) hour -= 12; // Convert 24-hour to 12-hour format

                                                  let currentTimeSlot = hour * 60 + parseInt(minute);

                                                  return (
                                                      <div key={i} className="schedule-row">
                                                          <span className="time-label">{`${hour}:${minute} ${period}`}</span>
                                                          {groupedTimeSlots[day]?.map((slot, index) => {

                                                              const formattedStartTime = Math.floor(convertTo24Hour(slot.startTime) / 60);
                                                              const formattedEndTime = Math.floor(convertTo24Hour(slot.endTime) / 60);

                                                              return formattedStartTime <= currentTimeSlot && formattedEndTime > currentTimeSlot ? (
                                                                  <div key={index} className="study-session">
                                                                      <strong>{slot.subject}</strong>
                                                                      <span>{convertToAMPM(slot.startTime)} - {convertToAMPM(slot.endTime)}</span>
                                                                  </div>
                                                              ) : null;
                                                          })}
                                                      </div>
                                                  );
                                              })}
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
