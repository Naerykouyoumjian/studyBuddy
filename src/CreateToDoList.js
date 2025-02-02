import React, { useState, forwardRef } from "react";
import Navbar from "./Navbar";
import "./CreateToDoList.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// SVG icons (adjust paths if needed)
import { ReactComponent as ArrowDownIcon } from "./arrow-down-circle.svg";
import { ReactComponent as ArrowUpIcon } from "./arrow-up-circle.svg";
import { ReactComponent as EditIcon } from "./edit.svg";
import { ReactComponent as DeleteIcon } from "./delete.svg";
import { ReactComponent as CalendarIcon } from "./calendar.svg";
import { ReactComponent as Calendar2Icon } from "./calendar2.svg";
// 1) A custom button for the date picker
const CalendarButton = forwardRef(({ onClick }, ref) => (
  <button className="icon-btn" onClick={onClick} ref={ref}>
    <CalendarIcon className="icon" />
  </button>
));

function CreateToDoList() {
  // The list name
  const [listName, setListName] = useState("");

  // The array of tasks (strings)
  const [tasks, setTasks] = useState([]);

  // Parallel array of due dates for each task
  const [taskDates, setTaskDates] = useState([]);

  // For the new task’s text
  const [newTask, setNewTask] = useState("");

  // For the new task’s date (optional)
  const [newTaskDate, setNewTaskDate] = useState(null);

  // --- Add a new task ---
  const handleAddTask = () => {
    if (!newTask.trim()) return;

    // Add the new task
    setTasks([...tasks, newTask.trim()]);
    // Add its chosen date (or null) in parallel
    setTaskDates([...taskDates, newTaskDate]);

    // Clear out the new task fields
    setNewTask("");
    setNewTaskDate(null);
  };

  // --- Delete a task ---
  const handleDeleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    const updatedDates = taskDates.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    setTaskDates(updatedDates);
  };

  // --- Move up ---
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

  // --- Move down ---
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

  // --- Edit task name ---
  const handleEditTask = (index) => {
    const edited = prompt("Edit task:", tasks[index]);
    if (edited !== null && edited.trim()) {
      const updated = [...tasks];
      updated[index] = edited.trim();
      setTasks(updated);
    }
  };

  // --- Change a task's date (once it's created) ---
  const handleDateChange = (index, date) => {
    const updated = [...taskDates];
    updated[index] = date;
    setTaskDates(updated);
  };

  // --- Save list ---
  const handleSaveList = () => {
    if (!listName.trim()) {
      alert("Please enter a list name!");
      return;
    }
    if (tasks.length === 0) {
      alert("Please add at least one task!");
      return;
    }

    // Just show an alert for demo
    let msg = `Saved list: ${listName}\n`;
    tasks.forEach((task, i) => {
      let d = taskDates[i];
      msg += `- ${task}${d ? " (due: " + d.toLocaleDateString() + ")" : ""}\n`;
    });
    alert(msg);

    // Reset
    setListName("");
    setTasks([]);
    setTaskDates([]);
    setNewTask("");
    setNewTaskDate(null);
  };

  return (
    <>
      <Navbar />

      <div className="create-todo-container">
        <div className="create-todo-content">
          <h2 className="section-title">Create To-Do List</h2>

          {/* Card */}
          <div className="todo-list-section">
            {/* Row: List Name */}
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

            {/* Purple bar: Add new task + date */}
            <div className="add-task-bar">
              {/* Task text */}
              <input
                className="task-input"
                type="text"
                placeholder="Add New Task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              

              {/* Date picker for the new task's date (pop-up style) */}
              <DatePicker
                selected={newTaskDate}
                onChange={(date) => setNewTaskDate(date)}
                placeholderText="Pick a date"
                // Use the custom calendar icon button
                customInput={
                  <button className="icon-btn">
                    <Calendar2Icon className="icon" />
                  </button>
                }
                />

              {/* Add Task Button */}
              <button className="add-task-btn" onClick={handleAddTask}>
                + Add Task
              </button>
            </div>

            {/* Display tasks */}
            <div className="tasks-container">
              {tasks.map((task, index) => (
                <div key={index} className="task-row">
                  <span className="task-text">{task}</span>

                  <div className="task-actions">
                    {/* Another date picker so they can change the date later */}
                    <DatePicker
                      selected={taskDates[index]}
                      onChange={(date) => handleDateChange(index, date)}
                      placeholderText="Change date"
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
                        style={{ opacity: index === tasks.length - 1 ? 0.4 : 1 }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save List */}
          <button className="save-list-btn" onClick={handleSaveList}>
            Save List
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateToDoList;
