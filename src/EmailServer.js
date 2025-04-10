/* TO START THE SERVER YOU MUST TYPE INTO THE TERMINAL: node src\EmailServer.js */

//importing modules
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");

//Creating the express application
const emailServer = express()
//enables CORS for all routes
emailServer.use(cors());
//allows for parsing of JSON request into javascript request
emailServer.use(express.json());

const fetch = require('node-fetch');

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
        //const backendURL = process.env.REACT_APP_BACKEND_URL;
        const response = await fetch('http://3.15.237.83:3001/save-token',{
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
            transporter.sendMail(mailOptions, (error, info) => {
                if(error){
                    //error message when E-mail could not be sent
                    console.error("Error sending E-mail:", error);
                    return res.status(500).json({success: false, message: "Error sending E-mail. \nPlease try again"});
                }
                //message that E-mail could be sent
                res.status(200).json({success: true, message: "A password reset link has been sent to your E-mail. \nFollow the link in the email to reset your password"});
            });
        }else{
            //the token could not be saved and the user was notified
            alert(result.message)
        }

    }catch(error){
        console.log("an error occurred: " + error);
        res.status(500).json({success: false, message: "An error occurred while generating an email, please try again"});
    }

    
    
});

//GET route to check server status
emailServer.get("/", (req, res) =>{
    res.send("Server is running");
});

//Starts the server on port 3002
emailServer.listen(3002, () =>{
    console.log("E-mail Server running on port 3002")
})