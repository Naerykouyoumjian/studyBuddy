import React, { useState } from 'react';
import Navbar from './Navbar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudyPlanPage.css';
import { useNavigate } from 'react-router-dom';

  const StudyPlanPage = () => {
      const [selectedDate, setSelectedDate] = useState(new Date());
      const [subject, setSubject] = useState('');
      const [priority, setPriority] = useState('');
      const [subjectList, setSubjectList] = useState([]); //store added subjects

      const navigate = useNavigate();

      //Handles calendar date change
      const handleDateChange = (date) => {
          if (date) {
              setSelectedDate(date);
          }
      };

      //Handles adding a subject to the list
      const handleAddSubject = () => {
          if (subject.trim() === '' || priority.trim() === '') {
              alert('Please enter both Subject and Priority level.');
              return;
          }

          //check if subject is already added
          const isDuplicate = subjectList.some(item => item.subject.toLowerCase() === subject.trim().toLowerCase()); 
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
      const handleGeneratePlan = async () => {
          if (subjectList.length === 0) {
              alert("Please add at least one subject before generating a plan.");
              return;
          }

          // Collect checked days and their selected time slots
          const selectedDays = [];
          document.querySelectorAll('.day-row').forEach((row) => {
              const checkbox = row.querySelector('input[type="checkbox"]');
              if (checkbox.checked) {
                  const fromTime = row.querySelector('.time-dropdown:first-of-type').value;
                  const toTime = row.querySelector('.time-dropdown:last-of-type').value;

                  const dayText = checkbox.parentNode.textContent.trim();

                  if (fromTime === toTime) {
                      alert(`Invalid time range for ${dayText}. Please select different start and end times.`);
                      return;
                  }

                  selectedDays.push({ day: dayText, fromTime, toTime });
              }
          });

          try {
              const response = await fetch("http://3.15.237.83:3001/generate-plan", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      subjects: subjectList.map(sub => sub.subject),  // Send only subjects
                      priorities: subjectList.map(sub => sub.priority),
                      timeSlots: selectedDays,
                      startDate: selectedDate.toISOString().split('T')[0], // Format Date
                      endDate: selectedDate.toISOString().split('T')[0] // Example: Same day for now
                  }),
              });

              // Check if response is valid JSON
              let data;
              try {
                  data = await response.json();
              } catch (jsonError) {
                  console.error("Error parsing API response:", jsonError);
                  alert("Error: Received an invalid response from AI. Please try again.");
                  return;
              }


              if (!response.ok) {
                  console.error("Error from AI:", data);
                  alert("Error: " + (data.message || "Failed to generate study plan."));
                  return;
              }

              //debug
              console.log("Full AI Response:", data);

              if (!data.studyPlan) {
                  console.log("Unexpected AI response format: ", data);
                  alert("Error: AI response is missing the study plan. Please try again later.");
                  return;
              }

              //store the study plan in local storage before navigating
              console.log("Storing Study Plan in local storage:", data.studyPlan);
              localStorage.setItem("StudyPlan", JSON.stringify(data.studyPlan));

              //navigate to the studySchedule page
              navigate("/study-schedule");

          } catch (error) {
              console.error("Request failed:", error);
              alert("Failed to connect to AI. Please check your internet connection and try again.");
          }
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
                        <button
                            className="add-subject-btn"
                            onClick={handleAddSubject}
                            disabled={!subject.trim() || !priority.trim()}
                        >
                            + Add Subject
                        </button>
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
                    <button className="generate-plan-btn"
                        onClick={handleGeneratePlan}
                        disabled={subjectList.length === 0}
                    >
                        Generate Plan
                    </button>
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
