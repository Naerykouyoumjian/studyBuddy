import React, { useState, useEffect, useMemo } from 'react';
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';


const StudySchedule = () => {

    const convertTo24Hour = (time) => {
        let [hour, minute] = time.split(/[: ]/);
        hour = parseInt(hour, 10);

        if (time.includes("PM") && hour !== 12) {
            hour += 12;
        } else if (time.includes("AM") && hour === 12) {
            hour = 0; // Midnight case
        }

        return hour * 60 + parseInt(minute);
    };


    //function to convert time to 24 hours
    const convertToAMPM = (time) => {
        let [hour, minute] = time.split(":");
        hour = parseInt(hour, 10);

        let period = "AM";
        if (hour >= 12) {
            period = "PM";
            if (hour > 12) hour -= 12;
        } else if (hour === 0) {
            hour = 12; // Midnight case
        }

        return `${hour}:${minute} ${period}`;
    };

    //state to manage selected date on the calendar
    const [selectedDate, setSelectedDate] = useState(new Date());

    //state to store the retrieved study plan
    const [studyPlan, setStudyPlan] = useState(null);

    //Memorized study Schedule
    const groupedTimeSlots = useMemo(() => {
        if (!studyPlan) return {};

        // Sort by start time before setting timeSlots
        const sortedSlots = [...(studyPlan || [])].sort((a, b) =>
            convertTo24Hour(a.startTime) - convertTo24Hour(b.startTime)
        );


        //group by day
        return sortedSlots.reduce((acc, session) => {
            const sessionDate = new Date(session.date);  // Ensure each session has an actual date
            const formattedDate = sessionDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

            if (!acc[formattedDate]) acc[formattedDate] = [];
            acc[formattedDate].push(session);
            return acc;
        }, {});
    }, [studyPlan]);

    useEffect(() => {
        //retrieve the study plan from the local storage
        const storedPlan = localStorage.getItem("StudyPlan");

        //check if stored plan is empty or null
        if (!storedPlan || storedPlan.trim() === "") {
            console.warn("No stored study plan found.");
            return;
        }

            try {
                //parse the stored JSON string 
                const parsedPlan = JSON.parse(storedPlan);
                console.log("Loaded study plan from storage:", parsedPlan); //debug

                //store the full study plan in the state 
                setStudyPlan(parsedPlan);

                } catch (error) {
                console.error("Error parsing stored study plan:", error);
        }

        console.log("Loaded study plan:", studyPlan);
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
                              .filter((day) => groupedTimeSlots[day].length > 0)  // ensures only non-empty days are shown
                              .map((day) => (
                                  <div key={day} className="schedule-day">
                                      <h3>{new Date(day).toLocaleDateString()}</h3>
                                      <div className="schedule-content">
                                          {Array.from({ length: 24 }, (_, i) => (
                                              <div key={i} className="schedule-row">
                                                  {groupedTimeSlots[day]?.map((slot, index) => {
                                                      if (!slot.startTime) return null;
                                                      // Convert minutes to hour
                                                      const formattedStartTime = Math.floor(convertTo24Hour(slot.startTime) / 60); 

                                                      return formattedStartTime === i ? (
                                                          <div key={index} className="study-session">
                                                              <strong>{slot.subject}</strong>
                                                              <span>{convertToAMPM(slot.startTime)} - {convertToAMPM(slot.endTime)}</span>                                                          </div>
                                                      ) : null;
                                                  })}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              ))}
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
