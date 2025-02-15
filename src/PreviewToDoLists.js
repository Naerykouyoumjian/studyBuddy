import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./PreviewToDoList.css";

function PreviewToDoList(){
    // gets user info from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    const user_id = user.userId;
    const [selectedOption, setSelectedOption] = useState("progress");
    const [inProgressLists, setProgressLists] = useState([]);
    const [completedLists, setCompletedLists] = useState([]);

    const colors = ["#FFF835", "#89CFF0", "#FF87CF", "#C86FFC", "#8AFF9C"]  // yellow, blue, pink, purple, green

    const getRandomColor = () => {
        return colors[Math.floor(Math.random() * colors.length)];
    };
  
    
    
    useEffect(() => {
      const fetchLists = async () => {
        try{
          const response = await fetch("http://localhost:3001/get-todo-lists", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({user_id})
          });

          const results = await response.json();
          if(results.success){
            setProgressLists(results.inProgressLists);
            setCompletedLists(results.completedLists);
          }
          
        }catch(error){
          // an error connecting to the server occured and the user is notified
          alert("Error connecting to the server");
        }
      };
      fetchLists();
    }, [user_id]);
    

    
    return (
        <>
            <Navbar />
            <div className="preview-todo-container">
                <div className="preview-todo-content">
                    <div className="header">
                        <h2 className="section-title">{user.firstName}'s To-Do Lists</h2>
                        <div className="radio-buttons">
                            <label className="radio">
                                <input 
                                type="radio" 
                                value="progress" 
                                checked={selectedOption === "progress"}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                />
                                In Progress
                            </label>

                            <label className="radio">
                                <input 
                                type="radio" 
                                value="completed"
                                checked={selectedOption === 'completed'} 
                                onChange={(e) => setSelectedOption(e.target.value)}
                                />
                                Completed
                            </label>
                        </div>
                    </div>

                    <div className="preview-list-section">
                        <div className="lists">
                          {selectedOption === "progress" && inProgressLists.length === 0 && (
                            <p className="no-lists">You currently have no in progress lists to preview, To-Do lists saved from the Create To-Do List page will show up here.</p>
                          )}
                            {selectedOption === "progress" && inProgressLists.map((list, index) => (
                              <Link to={`/view-todolist`} state={{ listInfo: list}} className="view-link">
                                <div key={index} className="single-list" style={{backgroundColor: getRandomColor()}}>
                                  <div className="list-name">{list.list_name}</div>
                                  <ul>
                                    {list.tasks.slice(0,2).map((task, i) => (
                                      <li key={i} className="task-item">
                                        <input
                                          type="checkbox"
                                          checked={task.completed}
                                          readOnly
                                        />
                                        <span className={task.completed ? "completed" : "in-progress"}>
                                          {task.task_description}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="date">Created on: {list.created_at.slice(0,10)}</div>
                                </div>
                              </Link>
                            ))}

                            {selectedOption === "completed" && completedLists.length === 0 && (
                              <p className="no-lists">You currently have no completed lists to preview,  lists where all tasks have been marked complete will show up here.</p>
                            )}

                            {selectedOption === "completed" && completedLists.map((list, index) => (
                              <Link to={`/view-todolist`} state={{ listInfo: list}} className="view-link">
                                <div key={index} className="single-list" style={{backgroundColor: getRandomColor()}}>
                                  <div className="list-name">{list.list_name}</div>
                                  <ul>
                                    {list.tasks.slice(0,2).map((task, i) => (
                                      <li key={i} className="task-item">
                                        <input
                                          type="checkbox"
                                          checked={task.completed}
                                          readOnly
                                        />
                                        <span className={task.completed ? "completed" : "in-progress"}>
                                          {task.task_description}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="date">Created on: {list.created_at.slice(0,10)}</div>
                                  <div className="date">Completed on: {list.completed_at.slice(0,10)}</div>
                                </div>
                              </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default PreviewToDoList;