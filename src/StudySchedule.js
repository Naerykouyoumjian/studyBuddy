import React, { useState, useEffect } from 'react';
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';
import { Textract } from '../node_modules/aws-sdk/index';

const StudySchedule = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    //state to store the retrieved study plan
    const [studyPlan, setStudyPlan] = useState(null);

    const [timeSlots, setTimeSlots] = useState([]); //to store the extracted time slots

    //fetch the study plan from local storage when page loads
    useEffect(() => {
        const storedPlan = localStorage.getItem("StudyPlan");

        //Extract time slots when plan loads
        extractTimeSlots(JSON.parse(storedPlan));

        if (storedPlan) {
            setStudyPlan(JSON.parse(storedPlan));
        }
    }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    };

    //function to extract time slots from the study plan
    const extractTimeSlots = (plan) => {
        let extractedSlots = [];
        const lines = plan.split("\n");

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



  return (
    <>
      <Navbar /> {/* StudyBuddy Navbar */}

          <div className="schedule-page">

              {/*Study Plan Display Section */}
              <div className="study-plan-container">
                  <h2>Generated Study Plan</h2>
                  {studyPlan ? (
                      <div className="study-plan-box">
                          <pre>{studyPlan}</pre>
                      </div>
                  ) : (
                      <p>No study plan available.</p>
                  )}
              </div>

              
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
            <div className="time-column">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="time-slot">
                  {`${i}:00`}
                </div>
              ))}
            </div>

            <div className="schedule-content">
              {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="schedule-row">
                  { timeSlots.map((slot, index) => {
                                  const startHour = parseInt(slot.startTime.split(":")[0]);
                      return startHour === i ? (
                          <div key={index} className="study-session">
                              {slot.subject}
                              <span>{slot.startTime} - {slot.endTime}
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
