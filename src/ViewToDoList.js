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

  // State: list name, creation date, tasks array
  const [listName, setListName] = useState("");
  const [listCreationDate, setListCreationDate] = useState(null);

  // tasks: [{ description, completed, dueDate }, ...]
  const [tasks, setTasks] = useState([]);
  // For adding a new task
  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(null);

  // On first load, populate from listInfo
  useEffect(() => {
    if (listInfo) {
      setListName(listInfo.list_name || "");
      if (listInfo.created_at) {
        setListCreationDate(new Date(listInfo.created_at));
      }

      if (Array.isArray(listInfo.tasks)) {
        const converted = listInfo.tasks.map((t) => ({
          description: t.task_description,
          completed: !!t.completed,
          dueDate: t.due_date ? new Date(t.due_date) : null,
        }));
        setTasks(converted);
      }
    }
  }, [listInfo]);

  // --- Add a new task ---
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { description: newTask.trim(), completed: false, dueDate: newTaskDate },
    ]);
    setNewTask("");
    setNewTaskDate(null);
  };

  // --- Toggle checkbox / line-through ---
  const toggleCompleted = (index) => {
    setTasks((prev) => {
      const updated = [...prev];
      updated[index].completed = !updated[index].completed;
      return updated;
    });
  };

  // --- Delete a single task ---
  const handleDeleteTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Move Up ---
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setTasks((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  // --- Move Down ---
  const handleMoveDown = (index) => {
    setTasks((prev) => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
      return updated;
    });
  };

  // --- Edit task text ---
  const handleEditTask = (index) => {
    const edited = prompt("Edit task:", tasks[index].description);
    if (edited !== null && edited.trim()) {
      setTasks((prev) => {
        const updated = [...prev];
        updated[index].description = edited.trim();
        return updated;
      });
    }
  };

  // --- Change a task's due date ---
  const handleDateChange = (index, date) => {
    setTasks((prev) => {
      const updated = [...prev];
      updated[index].dueDate = date;
      return updated;
    });
  };

  // --- Save the entire list ---
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
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.userId : null;

      const formatted = tasks.map((t) => ({
        task_description: t.description,
        completed: t.completed,
        due_date: t.dueDate ? t.dueDate.toISOString() : null,
      }));

      const response = await fetch("http://localhost:3001/save-todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listName, tasks: formatted, userId }),
      });
      const result = await response.json();
      alert(result.message);

      if (result.success) {
        // Reset
        setListName("");
        setTasks([]);
        setNewTask("");
        setNewTaskDate(null);

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

      const response = await fetch("http://localhost:3001/delete-todo-list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, listName }),
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
                value={listName}
                onChange={(e) => setListName(e.target.value)}
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
              {tasks.map((task, index) => {
                const { description, completed, dueDate } = task;

                return (
                  <div key={index} className="task-row">
                    {/* LEFT: checkbox + text */}
                    <div className="task-left">
                      <input
                        className="task-checkbox"
                        type="checkbox"
                        checked={completed}
                        onChange={() => toggleCompleted(index)}
                      />
                      <span
                        className="task-text"
                        style={{ textDecoration: completed ? "line-through" : "none" }}
                      >
                        {description}
                      </span>
                    </div>

                    {/* RIGHT: date icon, edit, delete, up/down */}
                    <div className="task-right">
                      <DatePicker
                        selected={dueDate}
                        onChange={(d) => handleDateChange(index, d)}
                        placeholderText="Change date"
                        renderCustomHeader={renderDateHeader(index, dueDate, handleDateChange)}
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
                        disabled={index === tasks.length - 1}
                      >
                        <ArrowDownIcon
                          className="icon"
                          style={{ opacity: index === tasks.length - 1 ? 0.4 : 1 }}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Creation Date at bottom */}
          {listCreationDate && (
            <p style={{ margin: "1rem 0" }}>
              Creation Date: {format(listCreationDate, "MM/dd/yy")}
            </p>
          )}

          {/* Save/Delete Buttons */}
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
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewToDoList;
