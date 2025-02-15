// export default CreateToDoList;
import React, { useState, forwardRef } from "react";
import { useLocation } from 'react-router-dom';
import Navbar from "./Navbar";
import "./ViewToDoList.css";

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


function ViewToDoList() {
    
    const location = useLocation();
    const { listInfo } = location.state || {}; 

    if(!listInfo) {
        return(
            <>
                <Navbar />
                <div> No List Information Available</div>
            </>
        );
    }else{
        return (
            <>
                <Navbar />
                <div>
                    <p>
                        listInfo.list_id:       {listInfo.list_id} <br/><br/>
                        listInfo.list_name:     {listInfo.list_name} <br/><br/>
                        listInfo.created_at:    {listInfo.created_at} <br/><br/>
                        listInfo.completed_at:  {listInfo.completed_at} <br/><br/>
                        listInfo.tasks[]:
                    </p>
                    {listInfo.tasks.map((task, index) =>(
                        <div key={task.task_id}>
                            <p>
                                listInfo.task.task_id:          {task.task_id} <br/>
                                listInfo.task.task_description: {task.task_description} <br/>
                                listInfo.task.deadline:         {task.deadline} <br/>
                                listInfo.task.completed:        {task.completed} <br/>
                                listInfo.task.priority:         {task.priority} <br/>
                            </p>
                        </div>
                    ))}
                </div>
            </>
        );
    }
}

export default ViewToDoList;