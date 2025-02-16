import React, { useState } from 'react';
import Navbar from './Navbar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudyPlanPage.css';

  const StudyPlanPage = () => {
      const [selectedDate, setSelectedDate] = useState(new Date());
      const [subject, setSubject] = useState('');
      const [priority, setPriority] = useState('');
      const [subjectList, setSubjectList] = useState([]); //store added subjects

      //Handles calendar date change
    const handleDateChange = (date) => {
      setSelectedDate(date);
      };

      //Handles adding a subject to the list
      const handleAddSubject = () => {
          if (subject.trim() === '' || priority.trim() === '') {
              alert('Please enter both Subject and Priority level.');
              return;
          }

          //check if subject is already added
          const isDuplicate = subjectList.some(item => item.subject.toLowerCase() === subject.toLocaleLowerCase()); \
          if (isDuplicate) {
              alert('Subject already added');
              return;
          }

          setSubjectList([...subjectList, { subject, priority }]);
          setSubject(''); // clear input fields
          setPriority('');
      };

      //Handles deleting a subject from the list
      const handleRemoveSubject = (index) => {
          const updatedList = subjectList.filter((_, i) => i !== index);
          setSubjectList(updatedList);
      }

      //Handles generating the study plan 
      const handleGeneratePlan = () => {
          console.log("Generated Plan:");
          console.log("Selected Date: ", selectedDate);
          console.log("Added Subjects:", subjectList);
          
          alert("Study Plan generated! (Check the console temporary)");
      };

    return (
      <>
        <Navbar />
      <div className="study-plan-container">
        <div className="study-plan-header">
          <h1>Study Plan Creator</h1>
        </div>
        <div className="top-row">
          <div className="fields-column">
            <div className="field">
              <label htmlFor="subject">Subject:</label>
              <input
                                type="text"
                                id="subject"
                                placeholder="Add Subject..."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
              />
                        </div>
              <div className="field">
              <label htmlFor="priority">Priority Level:</label>
              <input
                                type="text"
                                id="priority"
                                placeholder="Priority Level..."
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
              />
                        </div>
                        <button className="add-subject-btn" onClick={handleAddSubject}>+ Add Subject </button>
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
             <button className="generate-plan-btn" onClick={handleGeneratePlan}>Generate Plan</button>
                </div>

                <div className="subjects-list">
                    <h3>Added Subjects</h3>
                    {subjectList.length > 0 ? (
                        <ul>
                            {subjectList.map((item, index) => (
                                <li key={index}>
                                    {item.subject} - Priority: {item.priority}
                                    <button className="remove-subject-btn" onClick={() => handleRemoveSubject(index)}>Remove</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No subjects added yet.</p>
                    )}
                </div>
      </div>
    </>
  );
};

export default StudyPlanPage;
