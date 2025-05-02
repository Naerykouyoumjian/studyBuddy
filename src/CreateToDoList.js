// export default CreateToDoList;
import React, { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./CreateToDoList.css";

// For date formatting and date picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

// SVG icons (adjust paths if needed)
import { ReactComponent as ArrowDownIcon } from "./arrow-down-circle.svg";
import { ReactComponent as ArrowUpIcon } from "./arrow-up-circle.svg";
import { ReactComponent as EditIcon } from "./edit.svg";
import { ReactComponent as DeleteIcon } from "./delete.svg";
import { ReactComponent as CalendarIcon } from "./calendar.svg";
import { ReactComponent as Calendar2Icon } from "./calendar2.svg";

// A custom button for the date picker (for existing tasks)
const CalendarButton = forwardRef(({ onClick }, ref) => (
  <button className="icon-btn" onClick={onClick} ref={ref}>
    <CalendarIcon className="icon" />
  </button>
));

function CreateToDoList() {
  // -- State Variables --
  const [listName, setListName] = useState("");
  const [tasks, setTasks] = useState([]);       // array of task strings
  const [taskDates, setTaskDates] = useState([]); // array of Dates or null
  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(null);

 // Used to navigate directly to another webpage
 const navigate = useNavigate();

  // --- Add Task ---
  const handleAddTask = () => {
    if (!newTask.trim()) return;

    // Insert the new task + optional date
    setTasks([...tasks, newTask.trim()]);
    setTaskDates([...taskDates, newTaskDate]);

    // Reset
    setNewTask("");
    setNewTaskDate(null);
  };

  // --- Delete Task ---
  const handleDeleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    const updatedDates = taskDates.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    setTaskDates(updatedDates);
  };

  // --- Move Up ---
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedTasks = [...tasks];
    const updatedDates = [...taskDates];
    [updatedTasks[index - 1], updatedTasks[index]] = [
      updatedTasks[index],
      updatedTasks[index - 1],
    ];
    [updatedDates[index - 1], updatedDates[index]] = [
      updatedDates[index],
      updatedDates[index - 1],
    ];
    setTasks(updatedTasks);
    setTaskDates(updatedDates);
  };

  // --- Move Down ---
  const handleMoveDown = (index) => {
    if (index === tasks.length - 1) return;
    const updatedTasks = [...tasks];
    const updatedDates = [...taskDates];
    [updatedTasks[index + 1], updatedTasks[index]] = [
      updatedTasks[index],
      updatedTasks[index + 1],
    ];
    [updatedDates[index + 1], updatedDates[index]] = [
      updatedDates[index],
      updatedDates[index + 1],
    ];
    setTasks(updatedTasks);
    setTaskDates(updatedDates);
  };

  // --- Edit Task Name ---
  const handleEditTask = (index) => {
    const edited = prompt("Edit task:", tasks[index]);
    if (edited !== null && edited.trim()) {
      const updated = [...tasks];
      updated[index] = edited.trim();
      setTasks(updated);
    }
  };

  // --- Change a task's date after creation ---
  const handleDateChange = (index, date) => {
    const updated = [...taskDates];
    updated[index] = date;
    setTaskDates(updated);
  };

  // --- Save List ---
  const handleSaveList = async (e) => {
    e.preventDefault();

    if (!listName.trim()) {
      alert("Please enter a list name!");
      return;
    }
    if (tasks.length === 0) {
      alert("Please add at least one task!");
      return;
    }
    
    try{
      // gets user info from local storage
      const user = JSON.parse(localStorage.getItem('user'));
      // gets user information
      const userId = user ? user.userId : null;
      const firstName = user ? user.firstName : null;
      const email = user ? user.email : null;
      const deadlineOffset = user ? user.deadlineOffset : null;
      const notificationEnabled = user ? user.notificationEnabled : null;

      const backendURL = process.env.REACT_APP_BACKEND_URL;
      // post request to save the todo list
      const response = await fetch(`${backendURL}/save-todo`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
       body: JSON.stringify({ firstName, email, listName, tasks, taskDates, userId, deadlineOffset, notificationEnabled})
      });

      // getting results from test
      const result = await response.json();
      if(result.success){
        // Reset
        setListName("");
        setTasks([]);
        setTaskDates([]);
        setNewTask("");
        setNewTaskDate(null);
        
        // send user back to dashboard after list is saved
        navigate("/dashboard");  
      }
      // alerts user if the list saved successfully or not
      alert(result.message);
      
    }catch(error){
      //an error connecting to the server occurred and the user is notified
      alert("Error connecting to the server");
    }

  };

  // === CUSTOM HEADER for the DatePicker (with "None" option) ===
  // We'll re-use it for both the new task date and the existing tasks' date changes,
  // so user can set date to null inside the calendar pop-up.
  const renderDateHeader = (index, selectedDate, changeDateFunc) => ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0.5rem" }}>
      {/* Left arrow */}
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
        &lt;
      </button>

      {/* Current month/year */}
      <span>{format(date, "MMMM yyyy")}</span>

      {/* Right arrow */}
      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
        &gt;
      </button>

      {/* The "None" button clears date */}
      <button
        style={{ marginLeft: "1rem", color: "red", fontWeight: "bold" }}
        onClick={() => changeDateFunc(index, null)}
      >
        None
      </button>
    </div>
  );

  return (
    <>
      <Navbar />

      <div className="create-todo-container">
        <div className="create-todo-content">
          <h2 className="section-title">Create To-Do List</h2>

          <div className="todo-list-section">
            {/* -- Row: List Name -- */}
            <div className="list-name-row">
              <label className="list-name-label">List Name:</label>
              <input
                className="list-name-input"
                type="text"
                placeholder="Enter To-Do List Name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
            </div>

            {/* -- Purple bar: Add new task + date -- */}
            <div className="add-task-bar">
              {/* Task text */}
              <input
                className="task-input"
                type="text"
                placeholder="Add New Task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />

              {/* Date picker for new task's date */}
              <DatePicker
                selected={newTaskDate}
                onChange={(date) => setNewTaskDate(date)}
                placeholderText="Pick a date"
                minDate={new Date()} //no past date
                // "None" button in the pop-up
                renderCustomHeader={renderDateHeader(null, newTaskDate, (_, newVal) => setNewTaskDate(newVal))}
                customInput={
                  <button className="icon-btn" title="Select deadline">
                    <Calendar2Icon className="icon" />
                  </button>
                }
              />

              {/* Add Task Button */}
              <button className="add-task-btn" onClick={handleAddTask}>
                + Add Task
              </button>
            </div>

            {/* -- Display tasks -- */}
            <div className="tasks-container">
              {tasks.map((task, index) => {
                const dateVal = taskDates[index];
                return (
                  <div key={index} className="task-row">
                    {/* Show the text plus the date in red if chosen */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="task-text">{task}</span>
                      {dateVal && (
                        <span style={{ color: "red" }}>
                          deadline: {format(dateVal, "M/d/yy")}
                        </span>
                      )}
                    </div>

                    <div className="task-actions">
                      {/* Another date picker for changing date later */}
                      <DatePicker
                        selected={dateVal}
                        onChange={(d) => handleDateChange(index, d)}
                        placeholderText="Change date"
                        minDate={new Date()} //no past date
                        // "None" button in the pop-up
                        renderCustomHeader={renderDateHeader(index, dateVal, handleDateChange)}
                        customInput={<CalendarButton />}
                      />

                      {/* Edit */}
                      <button
                        className="icon-btn"
                        onClick={() => handleEditTask(index)}
                        title="Edit Task"
                      >
                        <EditIcon className="icon" />
                      </button>

                      {/* Delete */}
                      <button
                        className="icon-btn"
                        onClick={() => handleDeleteTask(index)}
                        title="Delete Task"
                      >
                        <DeleteIcon className="icon" />
                      </button>

                      {/* Move Up */}
                      <button
                        className="icon-btn"
                        onClick={() => handleMoveUp(index)}
                        title="Move Up"
                        disabled={index === 0}
                      >
                        <ArrowUpIcon
                          className="icon"
                          style={{ opacity: index === 0 ? 0.4 : 1 }}
                        />
                      </button>

                      {/* Move Down */}
                      <button
                        className="icon-btn"
                        onClick={() => handleMoveDown(index)}
                        title="Move Down"
                        disabled={index === tasks.length - 1}
                      >
                        <ArrowDownIcon
                          className="icon"
                          style={{
                            opacity: index === tasks.length - 1 ? 0.4 : 1,
                          }}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* -- Save List */}
          <button className="save-list-btn" onClick={handleSaveList}>
            Save List
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateToDoList;
