import React, { useState, useEffect, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import "./ViewToDoList.css";  // <--- Import the CSS here

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import { ReactComponent as ArrowDownIcon } from "./arrow-down-circle.svg";
import { ReactComponent as ArrowUpIcon } from "./arrow-up-circle.svg";
import { ReactComponent as EditIcon } from "./edit.svg";
import { ReactComponent as DeleteIcon } from "./delete.svg";
import { ReactComponent as CalendarIcon } from "./calendar.svg";
import { ReactComponent as Calendar2Icon } from "./calendar2.svg";

// Small button for the DatePicker in existing tasks
const CalendarButton = forwardRef(({ onClick }, ref) => (
  <button className="icon-btn" onClick={onClick} ref={ref}>
    <CalendarIcon className="icon" />
  </button>
));

function ViewToDoList() {
  // Grab passed-in list info from PreviewToDoList
  const location = useLocation();
  const { listInfo } = location.state || {};

  const navigate = useNavigate();

  // State: list id, name, creation date, completion date, and tasks array
  const [listDetails, setListDetails] = useState(listInfo || {
    list_id: null,
    list_name: "",
    created_at: null,
    completed_at: null,
    tasks: [],
  });

  // For adding a new task
  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(null);

  // On first load, populate from listInfo
  useEffect(() => {
    if (listInfo) {
      setListDetails(listInfo);
    }
  }, [listInfo]);

  // --- Add a new task ---
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const newTaskObj = {
      task_id: null,
      task_description: newTask.trim(),
      completed: false,
      deadline: newTaskDate,
      priority: null,
    };
    setListDetails((prev) => ({
      ...prev,
      tasks:[...prev.tasks, newTaskObj],
    }));
    setNewTask("");
    setNewTaskDate(null);
  };

  // -- updating changed task information --
  const updateTask = (index, updatedTask) =>{
    setListDetails((prev) => {
      const updatedTasks = [...prev.tasks];
      if(updatedTasks[index]){
        updatedTasks[index] = {...updatedTasks[index], ...updatedTask};
      }
      return {...prev, tasks: updatedTasks};
    });
  }

  // --- Toggle checkbox / line-through ---
  const toggleCompleted = (index) => {
    if(listDetails.tasks[index]){
      updateTask(index, {completed: !listDetails.tasks[index].completed});
    }
  };

  // --- Delete a single task ---
  const handleDeleteTask = (index) => {
    setListDetails((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  // --- Move Up ---
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setListDetails((prev) => {
      const updatedTasks = [...prev.tasks];
      [updatedTasks[index - 1], updatedTasks[index]] = [updatedTasks[index], updatedTasks[index - 1]];
      return {... prev, tasks: updatedTasks};
    })
  };

  // --- Move Down ---
  const handleMoveDown = (index) => {
    if(index === listDetails.tasks.length - 1) return;
    setListDetails((prev) =>{
      const updatedTasks = [...prev.tasks];
      [updatedTasks[index + 1], updatedTasks[index]] = [updatedTasks[index], updatedTasks[index + 1]];
      return {... prev, tasks: updatedTasks};
    });
  };

  // --- Edit task text ---
  const handleEditTask = (index) => {
    const edited = prompt("Edit task:", listDetails.tasks[index].task_description);
    if (edited !== null && edited.trim()) {
      updateTask(index, {task_description: edited.trim() });
    }
  };

  // --- Change a task's due date ---
  const handleDateChange = (index, date) => {
    updateTask(index, {deadline: date})
  };

  const handleListNameChange = (e) =>{
    setListDetails((prev) => ({...prev, list_name: e.target.value}));
  }

  // --- Save the entire list ---
  const handleSaveList = async (e) => {
    e.preventDefault();
    if (!listDetails.list_name.trim()) {
      alert("Please enter a list name!");
      return;
    }
    if (listDetails.tasks.length === 0) {
      alert("Please add at least one task!");
      return;
    }

    // checking if list is completed and setting completion date when necessary
    let isComplete = true;
    listDetails.tasks.forEach((task) => {
      if(!task.completed){
        isComplete = false;
      }
    });
    listDetails.completed_at = isComplete ? new Date() : null;
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.userId : null;
      const firstName = user ? user.firstName : null;
      const email = user ? user.email : null;
      const deadlineOffset = user ? user.deadlineOffset : null;
      const notificationEnabled = user ? user.notificationEnabled : null;

      const backendURL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendURL}/update-todo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({listDetails, userId, firstName, email, deadlineOffset, notificationEnabled}),
      });

      const result = await response.json();
      alert(result.message);

      if (result.success) {
        // Reset
        setListDetails();

        // Navigate away (e.g. back to dashboard)
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Error connecting to the server");
    }
  };

  
  // --- Delete entire list ---
  const handleDeleteList = async () => {
    if (!window.confirm("Are you sure you want to delete this list?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.userId : null;

      const backendURL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendURL}/delete-todo-list`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, list_id: listDetails.list_id }),
      });

      const result = await response.json();
      alert(result.message);

      if (result.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Error connecting to the server");
    }
  };
  
  const handleBackBtn = () =>{
    navigate("/preview-todolists");
  };

  // --- Custom header for DatePicker popup (with "None" button) ---
  const renderDateHeader = (index, selectedDate, changeDateFunc) => ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0.5rem" }}>
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
        &lt;
      </button>
      <span>{format(date, "MMMM yyyy")}</span>
      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
        &gt;
      </button>
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
          <h2 className="section-title">View To-Do List</h2>

          <div className="todo-list-section">
            {/* List Name row */}
            <div className="list-name-row">
              <label className="list-name-label">List Name:</label>
              <input
                className="list-name-input"
                type="text"
                placeholder="Enter To-Do List Name"
                value={listDetails.list_name}
                onChange={handleListNameChange}
              />
            </div>

            {/* Purple bar for adding tasks */}
            <div className="add-task-bar">
              <input
                className="task-input"
                type="text"
                placeholder="Add New Task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <DatePicker
                selected={newTaskDate}
                onChange={(date) => setNewTaskDate(date)}
                placeholderText="Pick a date"
                renderCustomHeader={renderDateHeader(null, newTaskDate, (_, val) => setNewTaskDate(val))}
                customInput={
                  <button className="icon-btn" title="Select deadline">
                    <Calendar2Icon className="icon" />
                  </button>
                }
              />
              <button className="add-task-btn" onClick={handleAddTask}>
                + Add Task
              </button>
            </div>

            {/* Existing tasks list */}
            <div className="tasks-container">
              {listDetails.tasks.map((task, index) => {
                return (
                  <div key={index} className="task-row">
                    {/* LEFT: checkbox + text */}
                    <div className="task-left">
                      <input
                        className="task-checkbox"
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleCompleted(index)}
                      />
                      <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                        <span
                          className="task-text"
                          style={{ textDecoration: task.completed ? "line-through" : "none" }}
                        >
                          {task.task_description}
                        </span>
                        {/* printing deadline in red if applicable */}
                        {task.deadline && (
                          <span style = {{color: "red" }}>
                            deadline: {format(task.deadline, "M/d/yy")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: date icon, edit, delete, up/down */}
                    <div className="task-right">
                      <DatePicker
                        selected={task.deadline}
                        onChange={(d) => handleDateChange(index, d)}
                        placeholderText="Change date"
                        renderCustomHeader={renderDateHeader(index, task.deadline, handleDateChange)}
                        customInput={<CalendarButton />}
                      />
                      <button className="icon-btn" onClick={() => handleEditTask(index)}>
                        <EditIcon className="icon" style={{ color: "green" }} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteTask(index)}>
                        <DeleteIcon className="icon" style={{ color: "red" }} />
                      </button>
                      <button className="icon-btn" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                        <ArrowUpIcon
                          className="icon"
                          style={{ opacity: index === 0 ? 0.4 : 1 }}
                        />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === listDetails.tasks.length - 1}
                      >
                        <ArrowDownIcon
                          className="icon"
                          style={{ opacity: index === listDetails.tasks.length - 1 ? 0.4 : 1 }}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Creation Date at bottom */}
          {listDetails.created_at && (
            <p style={{ margin: "1rem 0" }}>
              Creation Date: {format(listDetails.created_at, "MM/dd/yy")}
            </p>
          )}

          {/* Completion Date at bottom */}
          {listDetails.completed_at && (
            <p style={{ margin: "1rem 0" }}>
              Completion Date: {format(listDetails.completed_at, "MM/dd/yy")}
            </p>
          )}

          {/* Save/Delete/ Back Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
            <button className="save-list-btn" onClick={handleSaveList}>
              Save List
            </button>
            <button
              className="save-list-btn"
              style={{ backgroundColor: "#8b0000" }} // or use a separate .delete-list-btn style
              onClick={handleDeleteList}
            >
              Delete List
            </button>
            <button className ="back-btn" onClick={handleBackBtn}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewToDoList;
