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
const scheduledJobs = {};

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
const offsetMap = {
    "never" : null,
    "1day" : 1,
    "2day" : 2,
    "5day" : 5,
    "1week" : 7,
}

// function to schedule deadline emails
async function deadlineEmail(firstName, taskId, listName, email, taskDescription, deadline, offset, newRequest){
    const deadlineOffset = offsetMap[offset]
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
        delete scheduledJobs[taskId];
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
    scheduledJobs[taskId] = job;
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

// reschedules notifications for edited deadlines
emailServer.post("/reschedule-email", async(req, res) =>{
    const {firstName, taskId, listName, email, taskDescription, deadline, offset } = req.body;
    const deadlineOffset = offsetMap[offset];

    if(scheduledJobs[taskId]){
        scheduledJobs[taskId].stop();
        delete scheduledJobs[taskId];
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

    if(scheduledJobs[taskId]){
        scheduledJobs[taskId].stop();
        delete scheduledJobs[taskId];
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