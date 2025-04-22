/* TO START THE SERVER YOU MUST TYPE INTO THE TERMINAL: node src\EmailServer.js */

//importing modules
require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");
const cron = require("node-cron");
const moment = require("moment");

// getting backend url
const backendURL = process.env.REACT_APP_BACKEND_URL;
console.log("Backend URL: ", backendURL);

//Creating the express application
const emailServer = express()
//enables CORS for all routes
emailServer.use(cors());
//allows for parsing of JSON request into javascript request
emailServer.use(express.json());

//Nodemailer transporter allows for contact with our Gmail account 
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: "studybuddy4902024@gmail.com",
        //uses an app password generated from google for security purposes
        pass: "fbkh xrcl reao onpb",
    },

    //Disables certificate validation -> should be changed when site goes live
    tls:{
        rejectUnauthorized: false
    }
});

// stores scheduled jobs by task ID
const scheduledDeadlineJobs = {};
const scheduledStudyJobs = {};

// Function to send email with provided data
async function sendEmail(mailOptions){
    try{
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${mailOptions.to}`);
    }catch(error){
        console.error("Error sending email:", error);
    }
}

// enumerates the offset choices
const deadlineOffSetMap = {
    "never" : null,
    "1day" : 1,
    "2day" : 2,
    "5day" : 5,
    "1week" : 7,
};

const scheduleOffsetMap = {
    "never" : null,
    "1hour" : 1 / 24,
    "3hour" : 3 / 24,
    "12hour" : 12/ 24,
    "1day" : 1,
    "3day" : 3,
    "1week": 7
};

// function to schedule deadline emails
async function deadlineEmail(firstName, taskId, listName, email, taskDescription, deadline, offset, newRequest){
    const deadlineOffset = deadlineOffSetMap[offset]
    if(deadlineOffset === null){
        console.log("Notifications are disabled for deadlines");
        return;
    }

    // setting notification time x days before deadline depending on user preferences, then sets notification time to 8am
    const notificationDate = moment(deadline).subtract(deadlineOffset, "days").startOf("day").add(8, "hours").toDate();
    const now = new Date();


    // formatting cron time
    let cronTime;
    if(notificationDate < now){
        cronTime = `0 * * * * *`;
    }else{
        cronTime = `${notificationDate.getSeconds()} ${notificationDate.getMinutes()} ${notificationDate.getHours()} ${notificationDate.getDate()} ${notificationDate.getMonth() + 1} *`;
    }
    
    // Scheduling deadline notification
    const job = cron.schedule(cronTime, async () =>{
        console.log(`Sending email to ${email} for task: ${taskDescription}`);

        const mailOptions = {
            from: "studybuddy4902024@gmail.com",
            to: email,
            subject: `Task Reminder: ${taskDescription}`,
            text: `Hello ${firstName},\n
            You have an upcoming deadline for the task: "${taskDescription}",
            on your to-do list: "${listName}". It has a deadline set for ${moment(deadline).format('MM-DD-YYYY')}\n
            -StudyBuddy`
        };

        await sendEmail(mailOptions);

        job.stop();
        delete scheduledDeadlineJobs[taskId];
        try{
            const response = await fetch(`${backendURL}/delete-deadline-job`, {
                method: "DELETE",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({taskId})
            });
            const result = await response.json();
            if(result.success){
                console.log(result.message);
            }else{
                console.error(result.message);
            }
        }catch(error){
            console.error("an error occurred deleting the job from the database: ", error);
        }
    });
    scheduledDeadlineJobs[taskId] = job;
    if(newRequest){
        try{
            const response = await fetch(`${backendURL}/save-deadline-job`, {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({
                    taskId,
                    firstName,
                    listName,
                    email,
                    taskDescription,
                    deadline,
                    offset,
                    notificationDate
                })
            });
            const result = await response.json();
            if(result.success){
                console.log(result.message);
            }else{
                console.error(result.message);
            }
        }catch(error){
            console.error("an error occurred saving the job to the database: ", error);
        }
    }
    console.log(`Email scheduled for task ${taskId} on ${moment(notificationDate).format('MM-DD-YYYY')}`);
}

async function studySessionEmail(firstName, scheduleId, email, subject, day, date, startTime, endTime, offset, newRequest, jobId){
    const scheduleOffset = scheduleOffsetMap[offset];
    if(scheduleOffset  === null){
        console.log("Notifications are disabled for schedules");
        return;
    }

    // setting notification time x days/hours before study session depending on user preferences, then sets notification time to start of session
    
    //const sessionDateTime = moment(date).startOf("day").add(moment.duration(startTime));
    //const notificationDate = sessionDateTime.subtract(scheduleOffset, "days").toDate();
    
    const parsedStartTime = moment(startTime, "h:mm A"); // Converts startTime to a valid time
    const sessionDateTime = moment(date).startOf("day").add({
        hours: parsedStartTime.hours(),
        minutes: parsedStartTime.minutes(),
        seconds: parsedStartTime.seconds()
    });
    const notificationDate = sessionDateTime.subtract(scheduleOffset, "days").toDate();
    const now = new Date();

    // saving new job to database and retrieving job id
    if(newRequest){
        try{
            const response = await fetch(`${backendURL}/save-study-job`,{
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({
                    scheduleId,
                    firstName,
                    email,
                    subject,
                    day,
                    date,
                    startTime,
                    endTime,
                    offset,
                })
            });
            const result = await response.json();
            if(result.success){
                jobId = result.job_id;
                console.log(result.message);
            }else{
                console.error(result.message);
                return;
            }
        }catch(error){
            console.error("an error occurred while saving the study session job to the database: ", error);
            return;
        }
    }

     // formatting cron time
    let cronTime;
    if(notificationDate < now){
        // if the notification time has passed, send immediately
        cronTime = `0 * * * * *`;
    }else{
        cronTime = `${notificationDate.getSeconds()} ${notificationDate.getMinutes()} ${notificationDate.getHours()} ${notificationDate.getDate()} ${notificationDate.getMonth() + 1} *`;
    }

    // Scheduling study session notification
    const job = cron.schedule(cronTime, async () =>{
        console.log(`Sending email to ${email} for subject: ${subject}`);

        const mailOptions = {
            from: "studybuddy4902024@gmail.com",
            to: email,
            subject: `Study Session Reminder: ${subject}`,
            text: `Hello ${firstName},\n
            You have an upcoming study session for ${subject} on ${day}, ${date},
            from ${startTime} to ${endTime}.\n

            Happy Studying!\n
            -StudyBuddy`
        };

        await sendEmail(mailOptions);

        // stop job and delete from memory
        job.stop();
        if(scheduledStudyJobs[jobId]){
            delete scheduledStudyJobs[jobId];
        }
        
        // delete job from database
        try{
            const response = await fetch(`${backendURL}/delete-study-jobs`, {
                method: "DELETE",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({jobIds: [jobId]})
            });
            const result = await response.json();
            if(result.success){
                console.log(result.message);
            }else{
                console.error(result.message);
                return;
            }
        }catch(error){
            console.error("an error occurred deleting the study session job from the database: ", error);
            return;
        }
    });

    // saving job 
    scheduledStudyJobs[jobId]= job;
    
    console.log(`Email scheduled for  ${subject} on ${moment(notificationDate).format('MM-DD-YYYY')} at ${moment(notificationDate).format('HH:mm')}`);

}

// POST route to handle sending password reset requests
emailServer.post("/reset-password-email", async (req, res) => {
    //getting email address from the request
    const { email } = req.body;

    //generating random token to associate with the user
    const token = crypto.randomBytes(20).toString('hex');
    //setting expiration date 1 hour after request is made
    const expiration = new Date(Date.now() + 3600000);
    
    //formatting expiration date to match DATETIME datatype in our database
    const formattedExp = expiration.toISOString().slice(0,19).replace('T', ' ');
    
    const userInfo = {email, token, formattedExp};
    try{
        //post request to save the created token to our reset_tokens table
        
        const response = await fetch(`${backendURL}/save-token`,{
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify(userInfo)
        }); 

        //getting results from saving token request
        const result = await response.json();
        if(result.success){
             //setting up E-mail details
             const mailOptions = {
                from: "studybuddy4902024@gmail.com",
                to: email,
                subject: "Password Reset",
                text: `You requested a password reset. Click this link to reset your password: http://3.15.237.83:3000/reset-password?token=${token}`
            }

            //Function to send E-mail
            await sendEmail(mailOptions);
            return res.status(200).json({success: true, message: "A password reset link has been sent to your E-mail. \nFollow the link in the email to reset your password"});
        }else{
            //the token could not be saved and the user was notified
            console.error("Failed to save token: ", result.message);
            return res.status(500).json({success: false, message: "Failed to save token. Please try again later."});
        }

    }catch(error){
        console.log("an error occurred: " + error);
        res.status(500).json({success: false, message: "An error occurred while generating an email, please try again"});
    }

    
    
});

// schedules a notification for a new deadline
emailServer.post("/create-task", async (req, res) =>{
    const {firstName, taskId, listName, email, taskDescription, deadline, offset } = req.body;

    if(offset === 'never'){
        return res.status(400).json({success: false, message: "Notifications are disabled for deadlines."});
    }

    deadlineEmail(firstName, taskId, listName, email, taskDescription, deadline, offset, true);

    return res.status(200).json({success: true, message: "Deadline email scheduled."});
});

emailServer.post("/add-session", async (req, res) => {
    const {firstName, scheduleId, email, subject, day, date, startTime, endTime, offset} = req.body;

    if(offset === 'never'){
        return res.status(400).json({success: false, message: "Notifications are disabled for schedules."});
    }

    studySessionEmail(firstName, scheduleId, email, subject, day, date, startTime, endTime, offset, true, null);

    return res.status(200).json({success: true, message: "study session email scheduled."});    
});

// reschedules notifications for edited deadlines
emailServer.post("/reschedule-email", async(req, res) =>{
    const {firstName, taskId, listName, email, taskDescription, deadline, offset } = req.body;
    const deadlineOffset = deadlineOffSetMap[offset];

    if(scheduledDeadlineJobs[taskId]){
        scheduledDeadlineJobs[taskId].stop();
        delete scheduledDeadlineJobs[taskId];
        try{
            const response = await fetch(`${backendURL}/delete-deadline-job`, {
                method: "DELETE",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({taskId})
            });
            const result = await response.json();
            if(result.success){
                console.log(result.message);
            }else{
                console.error(result.message);
            }
        }catch(error){
            console.error("an error occurred deleting the job from the database: ", error);
        }
        console.log(`Cancelled existing job for task ${taskId}`);
    }


    if(deadlineOffset === null){
        return res.status(400).json({success: false, message: "Notifications are disabled for deadlines."})
    }

    deadlineEmail(firstName, taskId, listName, email, taskDescription, deadline, offset, true);
    return res.status(200).json({success: true, message: `Deadline notification for task ${taskId} was rescheduled`});
});

// deletes a job thats already been scheduled
emailServer.post("/delete-task-notification", async (req, res) =>{
    const { taskId } = req.body;

    if(scheduledDeadlineJobs[taskId]){
        scheduledDeadlineJobs[taskId].stop();
        delete scheduledDeadlineJobs[taskId];
        try{
            const response = await fetch(`${backendURL}/delete-deadline-job`, {
                method: "DELETE",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({taskId})
            });
            const result = await response.json();
            if(result.success){
                console.log(result.message);
            }else{
                console.error(result.message);
            }
        }catch(error){
            console.error("an error occurred deleting the job from the database: ", error);
        }
        console.log(`Cancelled existing job for task ${taskId}`);
    }
    return res.status(200).json({success: true, message: `Email for task ${taskId} was unscheduled`});
});

emailServer.post("/delete-schedule-notifications", async(req, res) =>{
    const { jobIds, scheduleId } = req.body;
    for(const jobId of jobIds){
        if(scheduledStudyJobs[jobId]){
            scheduledStudyJobs[jobId].stop();
            delete scheduledStudyJobs[jobId];
            console.log(`Cancelled existing job for session ${jobId}`);
        }
    }
    
    try{
        const response = await fetch(`${backendURL}/delete-study-jobs`, {
            method: "DELETE",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({jobIds})
        });
        const result = await response.json();
        if(result.success){
            console.log(result.message);
        }else{
            console.error(result.message);
            return res.status(500).json({ success: false, message: result.message });
        }
    }catch(error){
        console.error("An error occurred deleting the session job from the database", error);
        return res.status(500).json({ success: false, message: "Server Error while attempting to delete schedule emails" });
    }
    console.log(`All Emails for schedule ${scheduleId} were unscheduled`);
    return res.status(200).json({success: true, message: `Emails for schedule ${scheduleId} were unscheduled`});
});

//GET route to check server status
emailServer.get("/", (req, res) =>{
    res.send("Server is running");
});

// function to initialize the scheduled job list on server start up
const init = async () =>{
    console.log("Initializing server...");
    try{
        const response = await fetch(`${backendURL}/get-scheduled-jobs`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"},
        });
        const result = await response.json();
        if(result.success){
            result.data.forEach((job) => {
                const {
                    task_id,
                    first_name,
                    list_name,
                    email,
                    task_description,
                    deadline,
                    deadline_offset
                } = job;
                deadlineEmail(first_name, task_id, list_name, email, task_description, deadline, deadline_offset, false)
            })
            
        }else{
            console.error(result.message);
        }

        const sessionResponse = await fetch(`${backendURL}/get-scheduled-session-jobs`, {
            method: "GET",
            headers: {"Content-Type" : "application/json"},
        });

        const sessionResult = await sessionResponse.json();
        if(sessionResult.success){
            sessionResult.data.forEach((job) => {
                const{
                    job_id,
                    schedule_id,
                    first_name,
                    email,
                    subject,
                    day,
                    date,
                    start_time,
                    end_time,
                    notification_offset
                } = job;
                studySessionEmail(first_name, schedule_id, email, subject, day, date, start_time, end_time, notification_offset, false, job_id);
            })
        }else{
            console.error(result.message);
        }
    }catch(error){
        console.error("There was an error retrieving the scheduled jobs: ", error);
    }
};


// Runs the initializing function and starts the server on port 3002
init().then(() => {
    emailServer.listen(3002, () =>{
        console.log("E-mail Server running on port 3002");
    });
});