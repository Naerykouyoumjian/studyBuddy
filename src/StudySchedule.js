import React, { useState, useEffect } from 'react';
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';


const StudySchedule = () => {
    //state to manage selected date on the calendar
    const [selectedDate, setSelectedDate] = useState(new Date());

    //state to store the retrieved study plan
    const [studyPlan, setStudyPlan] = useState(null);

    //state to store the extracted time slots from study plan
    const [timeSlots, setTimeSlots] = useState([]); 

    //fetch the study plan from local storage when page loads
    useEffect(() => {
        const storedPlan = localStorage.getItem("StudyPlan");

        if (storedPlan) {
            const parsedPlan = JSON.parse(storedPlan);
            setStudyPlan(parsedPlan);  //store the full plan
            extractTimeSlots(parsedPlan); //Extract time slots when plan loads
        }
    }, []);

    //function to extract time slots from the study plan
    const extractTimeSlots = (plan) => {
        if (!plan) return;  //to prevent errors if study plan is empty

        let extractedSlots = [];
        const lines = plan.split("\n");  //split plan into lines

        lines.forEach((line) => {
            const match = line.match(/(\d{1,2}:\d{2} [APM]+) - (\d{1,2}:\d{2} [APM]+)/);
            if (match) {
                extractedSlots.push({
                    startTime: match[1],
                    endTime: match[2],
                    subject: line.split(":")[1]?.trim() || "Study Session",
                });
            }
        });
        setTimeSlots(extractedSlots);
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
                      {/* week header */}
                      <div className="week-header">
                          <span> Sun</span>
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                      </div>

                      {/* Main Time Grid */}
                      <div className="schedule-grid">
                          {/*Time Column*/}
                          <div className="time-column">
                              {Array.from({ length: 24 }, (_, i) => (
                                  <div key={i} className="time-slot">
                                      {`${i}:00`}
                                  </div>
                              ))}
                          </div>

                          {/* Schedule Contect - Shows study blocks */}
                          <div className="schedule-content">
                              {Array.from({ length: 24 }, (_, i) => (
                                  <div key={i} className="schedule-row">

                                      {/* Render study session blocks */}
                                      {timeSlots.map((slot, index) => {
                                          const startHour = parseInt(slot.startTime.split(":")[0]);

                                          return startHour === i ? (
                                              <div key={index} className="study-session">
                                                  <strong>{slot.subject}</strong>   {/* show subject */}
                                                  <span>{slot.startTime} - {slot.endTime}    {/* show time */}
                                                  </span>
                                              </div>
                                          ) : null;
                                      })}
                                  </div>
                              ))}
                          </div>
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
