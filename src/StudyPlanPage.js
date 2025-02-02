import React, { useState } from 'react';
import Navbar from './Navbar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudyPlanPage.css';

  const StudyPlanPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (date) => {
      setSelectedDate(date);
    };

    return (
      <>
        <Navbar />
      <div className="study-plan-container">
        <div className="study-plan-header">
          <h1>Study Plan Creator</h1>
        </div>
        <div className="top-row">
          {}
          <div className="fields-column">
            <div className="field">
              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                placeholder="Add Subject..."
              />
            </div>
            <div className="field">
              <label htmlFor="priority">Priority Level:</label>
              <input
                type="text"
                id="priority"
                placeholder="Priority Level..."
              />
            </div>
            <button className="add-subject-btn">+ Add Subject</button>
          </div>
          {}
          <div className="calendar-section">
            <h3>Calendar</h3>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
            />
          </div>
        </div>
        {}
        <div className="available-days">
          <h3>Available Days</h3>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <div className="day-row" key={day}>
              <label>
                <input type="checkbox" />
                {day}
              </label>
              <span>From</span>
              <select className="time-dropdown">
                {Array.from({ length: 24 }, (_, i) => (
                  <>
                    <option key={`${day}-from-${i}:00 AM`}>{`${i === 0 ? 12 : i}:00 AM`}</option>
                    <option key={`${day}-from-${i}:30 AM`}>{`${i === 0 ? 12 : i}:30 AM`}</option>
                  </>
                ))}
                {Array.from({ length: 12 }, (_, i) => (
                  <>
                    <option key={`${day}-from-${i}:00 PM`}>{`${i === 0 ? 12 : i}:00 PM`}</option>
                    <option key={`${day}-from-${i}:30 PM`}>{`${i === 0 ? 12 : i}:30 PM`}</option>
                  </>
                ))}
              </select>
              <span>to</span>
              <select className="time-dropdown">
                {Array.from({ length: 24 }, (_, i) => (
                  <>
                    <option key={`${day}-to-${i}:00 AM`}>{`${i === 0 ? 12 : i}:00 AM`}</option>
                    <option key={`${day}-to-${i}:30 AM`}>{`${i === 0 ? 12 : i}:30 AM`}</option>
                  </>
                ))}
                {Array.from({ length: 12 }, (_, i) => (
                  <>
                    <option key={`${day}-to-${i}:00 PM`}>{`${i === 0 ? 12 : i}:00 PM`}</option>
                    <option key={`${day}-to-${i}:30 PM`}>{`${i === 0 ? 12 : i}:30 PM`}</option>
                  </>
                ))}
              </select>
            </div>
          ))}
          <button className="generate-plan-btn">Generate Plan</button>
        </div>
      </div>
    </>
  );
};

export default StudyPlanPage;
