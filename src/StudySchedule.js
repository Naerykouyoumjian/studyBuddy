import React, { useState, useEffect } from 'react';
import './StudySchedule.css';
import Navbar from './Navbar';
import Calendar from 'react-calendar'; // Importing calendar package
import 'react-calendar/dist/Calendar.css';


const StudySchedule = () => {

    //function to convert time to 24 hours
    const convertTo24Hour = (time) => {
        let [hours, minutes] = time.split(" ")[0].split(":");
        const period = time.split(" ")[1];

        if (period === "PM" && hours !== "12") {
            hours = parseInt(hours) + 12;
        } else if (period === "AM" && hours === "12") {
            hours = "00";
        }

        return `${hours}:${minutes}`;
    };



    //state to manage selected date on the calendar
    const [selectedDate, setSelectedDate] = useState(new Date());

    //state to store the retrieved study plan
    const [studyPlan, setStudyPlan] = useState(null);

    //state to store the extracted time slots from study plan
    const [timeSlots, setTimeSlots] = useState([]); 

    useEffect(() => {
        //retrieve the study plan from the local storage
        const storedPlan = localStorage.getItem("StudyPlan");

        //check if the plan exists in the local storage
        if (storedPlan) {
            try {
                //parse the stored JSON string 
                const parsedPlan = JSON.parse(storedPlan);

                //store the full study plan in the state 
                setStudyPlan(parsedPlan);

                // Sort by start time before setting timeSlots
                const sortedSlots = parsedPlan.sort((a, b) => {
                    //convert time strings to date objects for accurate comparison
                    const timeA = new Date(`01/01/2000 ${convertTo24Hour(a.startTime)}`);
                    const timeB = new Date(`01/01/2000 ${convertTo24Hour(b.startTime)}`);
                    //return the difference, to make sure the earlier time appear first in the list
                    return timeA - timeB;
                });
                    
                // Group study sessions by day
                const groupedSlots = sortedSlots.reduce((acc, session) => {
                    if (!acc[session.day]) {
                        acc[session.day] = [];
                    }
                    acc[session.day].push(session);
                    return acc;
                }, {});

                // Store grouped sessions by day
                setTimeSlots(groupedSlots);

            } catch (error) {
                console.error("Error parsing stored study plan:", error);
            }
        }
    }, []);


    //function to extract time slots from the study plan
    const extractTimeSlots = (plan) => {
        if (!plan) return;  //to prevent errors if study plan is empty

        try {
                    //parse the JSON string 
                    const extractedSlots = JSON.parse(plan);

                    //set the extracted slots into state
            setTimeSlots(extractedSlots);

                } catch (error) {
                    console.error("Error parsing study plan JSON:", error);
                }
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
                          {Object.keys(timeSlots)
                              .filter((day) => timeSlots[day].length > 0)  // ensures only non-empty days are shown
                              .map((day) => (
                                  <div key={day} className="schedule-day">
                                      <h3>{day}</h3>
                                      <div className="schedule-content">
                                          {Array.from({ length: 24 }, (_, i) => (
                                              <div key={i} className="schedule-row">
                                                  {timeSlots[day].map((slot, index) => {
                                                      const startHour = parseInt(slot.startTime.match(/\d+/)[0]); 
                                                      return startHour === i ? (
                                                          <div key={index} className="study-session">
                                                              <strong>{slot.subject}</strong>
                                                              <span>{slot.startTime} - {slot.endTime}</span>
                                                          </div>
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
