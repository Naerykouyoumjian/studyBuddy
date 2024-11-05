/* TO START THE SERVER YOU MUST TYPE INTO THE TERMINAL: node src\EmailServer.js */

//importing modules
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");

//Creating the express application
const emailServer = e
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

// POST route to handle sending password reset requests
emailServer.post("/", (req, res) => {
    //getting email address from the request
    const { email } = req.body;

    //generating random token to associate with the user
    const token = crypto.randomBytes(20).toString('hex');
    
    //setting up E-mail details
    const mailOptions = {
        from: "studybuddy4902024@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `You requested a password reset. Click this link to reset your password: http://Localhost:3000/reset-password?token=${token}`
    }

    //Function to send E-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            //error message when E-mail could not be sent
            console.error("Error sending E-mail:", error);
            return res.status(500).send("Error sending E-mail.");
        }
        //message that E-mail could be sent
        console.log("Email sent: " + info.response);
        res.status(200).send("E-mail sent.");
    });
});

//GET route to check server status
emailServer.get("/", (req, res) =>{
    res.send("Server is running");
});

//Starts the server on port 3002
emailServer.listen(3002, () =>{
    console.log("E-mail Server running on port 3002")
})