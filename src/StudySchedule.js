import React, { useState } from 'react';
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';

const StudySchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <>
      <Navbar /> {/* StudyBuddy Navbar */}

      <div className="schedule-page">
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
                <div key={i} className="schedule-row"></div>
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
    </>
  );
};

export default StudySchedule;
