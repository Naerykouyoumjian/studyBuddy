require('dotenv').config();
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm'); //AWS SDK v3, newer version
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const bcrypt = require('bcrypt');
const { OpenAI } = require('openai');

const emailServerURL = process.env.REACT_APP_EMAIL_SERVER_URL;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());


//Configuration for OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAIApi instance is created:", openai); //debug



//route to generate study plan
app.post('/generate-plan', async (req, res) => {
    const { subjects, priorities, timeSlots, startDate, endDate } = req.body;

    try {
        //prompt for ChatGPT
        const prompt = `
You are a study plan assistant. Generate a study schedule in **valid JSON format** based on the following inputs:
- Subjects and priorities: ${JSON.stringify(subjects.map((sub, idx) => ({ subject: sub, priority: priorities[idx] })))}.
- Available study hours for each day: ${JSON.stringify(timeSlots)}.
- Start date: ${startDate}, End date: ${endDate}.

### Instructions:
- Allocate subjects based on priority, giving higher-priority subjects more time.
- Ensure study sessions are scheduled **only on available days**.
- Distribute subjects fairly across available time slots.
- The output must be in JSON format structured as an array, where each entry contains:
  - "day": The weekday name (e.g., "Monday", "Tuesday").
  - "subject": The subject name.
  - "startTime": Start time in "HH:MM AM/PM" format.
  - "endTime": End time in "HH:MM AM/PM" format.

### Example Output:
[
  { "day": "Monday", "subject": "Math", "startTime": "8:00 AM", "endTime": "9:00 AM" },
  { "day": "Monday", "subject": "English", "startTime": "9:00 AM", "endTime": "9:30 AM" },
  { "day": "Tuesday", "subject": "Math", "startTime": "9:00 AM", "endTime": "9:30 AM" }
]
`;

        //send the prompt to the OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages:
                [
                    { role: 'system', content: "You are a helpful assistant that creates study plans." },
                    { role: 'user', content: prompt }
                ],
            max_tokens: 1000,
        });

        //debug to log the entire response from AI
        console.log("OpenAI Full Response:", JSON.stringify(completion, null, 2));

        //check and validate the response
        if (completion &&
            completion.choices &&
            completion.choices[0] &&
            completion.choices[0].message &&
            completion.choices[0].message.content) {
            try {
                // Extract the response content from OpenAI
                let aiResponse = completion.choices[0].message.content.trim();

                // Remove Markdown code block format (```json ... ```)
                if (aiResponse.startsWith("```json")) {
                    aiResponse = aiResponse.substring(7); // Remove first 7 characters (```json\n)
                }
                if (aiResponse.startsWith("```")) {
                    aiResponse = aiResponse.substring(3); // Remove ``` if still present
                }
                if (aiResponse.endsWith("```")) {
                    aiResponse = aiResponse.substring(0, aiResponse.length - 3); // Remove ending ```
                }

                try {
                    // Parse the cleaned JSON
                    const studyPlan = JSON.parse(aiResponse);
                    console.log("Generated Study Plan:", studyPlan);
                    return res.status(200).json({ success: true, studyPlan });
                } catch (error) {
                    console.error("Error parsing OpenAI response:", error, "Raw response:", aiResponse);
                    return res.status(500).json({ success: false, message: "Failed to parse study plan." });
                }
            } catch (error) {
                console.error("Error parsing OpenAI response:", error);
                return res.status(500).json({ success: false, message: "Failed to parse study plan." });
            }
        } else {
            console.error("Invalid AI response structure:", JSON.stringify(completion, null, 2));
            return res.status(500).json({ success: false, message: 'Failed to generate a valid study plan.' });
        }

    } catch (error) {
        console.error('Error generating study plan:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate study plan.' });
    }
});

//Route to save the study plan to database (ONLY when the user clicks "Save Plan")
app.post('/save-study-plan', async (req, res) => {
    const { firstName, userEmail, studyPlan, notificationEnabled, scheduleOffset} = req.body;

    if (!userEmail || !studyPlan) {
        return res.status(400).json({
            success: false,
            message: 'User email and study plan are required.'
        });
    }

    try {
        const query = 'INSERT INTO studyPlans (user_email, plan_text) VALUES (?, ?)';
        const [result] = await db.promise().query(query, [userEmail, JSON.stringify(studyPlan)]);

        if(notificationEnabled && studyPlan.length > 0){
          for(const session of studyPlan){
            sessionEmailInfo = {
              firstName,
              scheduleId: result.insertId,
              email: userEmail,
              subject: session.subject,
              day: session.day,
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              offset: scheduleOffset
            };
            // schedule session email
            const scheduleEmail = await fetch(`${emailServerURL}/add-session`, {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify(sessionEmailInfo)
            });

            const emailResult = await scheduleEmail.json();
            if(emailResult.success){
                console.log(emailResult.message);
            }else{
                console.error(emailResult.message);
            }
          }
        }

        return res.status(200).json({
            success: true,
            message: 'Study plan saved successfully!',
            planId: result.insertId
        });
    } catch (error) {
        console.error('Database error while saving:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save the study plan.'
        });
    }
});

//setup a server
app.listen(PORT, error => {
    if (error) return console.error("Server failed to start:", error);
    console.log(`Server is running on http://3.15.237.83:${PORT}`);
});

async function getPublicIP() {
    const ssmClient = new SSMClient({ region: 'us-east-2' });
    const params = new GetParameterCommand({
        Name: 'StudyBuddyPublicIP',
        WithDecryption: false
    });

    try {
        const data = await ssmClient.send(params);
        return data.Parameter.Value; // return the stored IP
    } catch (err) {
        console.error('Error fetching IP from Parameter Store: ', err);
    }
}

getPublicIP().then(ip => {
  console.log("Fetched Public IP:", ip);
});



//default route to check the server status
app.get('/', (req, res) => {
  res.send('Server is up and running!');
  console.log("GET request to '/' route");
});

//route to fetch all study plans for a specific user
app.get('/get-study-plans/:userEmail', async (req, res) => {
    const { userEmail } = req.params;

    try {
        const query = 'SELECT * FROM studyPlans WHERE user_email = ?';
        const [plans] = await db.promise().query(query, [userEmail]);

        // Parse the JSON stored in `plan_text`
        const formattedPlans = plans.map(plan => ({
            id: plan.id,
            user_email: plan.user_email,
            plan_text: JSON.parse(plan.plan_text), // Convert back to JSON object
            created_at: plan.created_at
        }));

        return res.status(200).json(formattedPlans);
    } catch (error) {
        console.error('Database error while retrieving study plans:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving study plans.'
        });
    }
});

// Route to fetch a single study plan by ID
app.get('/get-single-study-plan/:planId', async (req, res) => {
    const { planId } = req.params;

    try {
        const query = 'SELECT * FROM studyPlans WHERE id = ?';
        const [result] = await db.promise().query(query, [planId]);

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Study plan not found." });
        }

        const studyPlan = {
            id: result[0].id,
            user_email: result[0].user_email,
            plan_text: JSON.parse(result[0].plan_text), // Convert from JSON string
            created_at: result[0].created_at
        };

        res.status(200).json(studyPlan);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching study plan." });
    }
});



//Connect to mySQL
db.connect(error => {
  if (error) return console.error('Database connection failed:', error);
  console.log('Connected to MySQL database');
});


//Adding signup route
app.post('/signup', async (req, res) => {
const{firstName, lastName, email, password} = req.body;
console.log('Incoming request data:', req.body); // logging the request body

try{
  //make sure all fields have input
  if (!firstName || !lastName || !email || !password){
    console.error('Validating error: Missing required fields.');
    return res.status(400).json({
      success: false, 
      message: 'All fields are required.'
    });
  }

  // check if email already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
db.query(checkQuery, [email], async (checkError, checkResult) =>{
  if (checkError){
    console.error('Database error during email check:' , checkError);
    return res.status(500).json({success: false, message: 'Database error during email check.'});
  }
  if (checkResult.length > 0){
    console.log('Duplicate email: ', email);
    return res.status(400).json({success: false, message: 'Email already exists.'});
  }


  //hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Password hashed successfully.');

  //save the user with hashed password
  const query = 'INSERT INTO users (first_Name, last_Name, email, password_hash) Values (?, ?, ?, ?)';
  db.query(query, [firstName, lastName, email, hashedPassword], (error, result) => {
    if(error){
      console.error('Error saving user to database:' , error);
      res.status(500).json(
        {success: false, message: 'Error saving user'});
    } 
    console.log('User saved to database:', result); //logging successful save
      res.status(200).json({ success: true, message: 'User registered successfully'});
      return;
  });
});
} catch (error) {
  console.error('Error during signup:', error);
  res.status(500).json({ success: false, message: 'Server error'});
}
});

//adding find email route
app.post('/find-email', (req, res) => {
  //getting email from request
  const { email } = req.body;
  //looking for email in our database
  const query = 'select * from users where email = ?';
  try{
    db.query(query, [email], (err, results) =>{
      if(err){
        //There was an error accessing the database
        res.status(500).json({success:false, message: 'Error querying the database'});
        return;
      }

      if(results.length > 0){
        //email was found in our database
        res.status(200).json({success: true, message:'Email exists'});
      }else{ 
        //email not found in our database
        res.status(404).json({success: false, message:'This Email does not match any account in our system. \nPlease try another email or Sign-Up for an account'});
      }
    });
  }catch (err){
    //error connecting to the database
    res.status(500).json({success: false, message: 'Server error'});
  }
});

//adding save token route
app.post('/save-token', (req, res) =>{
  //getting token information from request
  const {email, token, formattedExp} = req.body;
 try{ 
  //saving token, expiration data, and email to reset_tokens table, 
  //if the email already exists in the table, the table is updated instead
    const query = 'INSERT INTO reset_tokens(token, expiration, email) Values(?, ?, ?)' +
      'ON DUPLICATE KEY UPDATE token = VALUES(token), expiration = VALUES(expiration)';
    db.query(query,[token, formattedExp, email], (err, results) =>{
      if(err){
        //The password could not be saved
        console.error("Database error: ", err);
        res.status(500).json({success:false, message: 'Error saving reset password token'});
      }else{
        //the password was saved
        res.status(200).json({success:true, message: 'Reset token successfully saved'})
      }
  });
} catch(err){
  //error connecting to server
  console.error("Server error: ", err);
  res.status(500).json({success:false, message: "Server error"});
  
}
});

//adding save new password route
app.post('/save-new-password', (req, res) => {
  //getting token and password from request
  const {token, password} = req.body;
  //finding email and expiration date associated with the given token
  const query = 'SELECT email, expiration FROM reset_tokens WHERE token = ?'
  db.query(query, [token], async (err, results) =>{
    if(err){
      //there was an error connecting to the server
      return res.status(500).json({success: false, message: "Server error"});
    }

    //if no results were found then the token did not match
    if (results.length === 0){
      return res.status(400).json({success:false, message: "This link does not match the current token. \nPlease use the latest email sent to you by StudyBuddy to reset your password. \n"});
    }

    //getting email and expiration for given token from database
    const {email, expiration} = results[0];
    //getting current time
    const now = new Date();
    //checking if link is still valid by comparing current time to expiration time
    if(now > new Date(expiration)){
      return res.status(400).json({success:false, message: "This email token has expired, please request a new email"});
    }

    //hash the password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedPassword = await bcrypt.hash(password, salt);

    //updating user table with the new password for the correct user
    const updateQuery = 'UPDATE users SET password_hash = ? WHERE email = ?'
    db.query(updateQuery, [hashedPassword, email], (updateErr, updateResults) =>{
      if(updateErr){
        //there was an error connecting to the database
        return res.status(500).json({success: false, message: "Server Error"});
      }

      //deleting the token from the reset_token database so we're not storing data that is no longer needed
      const deleteQuery = 'DELETE FROM reset_tokens WHERE token = ?';
      db.query(deleteQuery, [token], (deleteErr, deleteResults) =>{
        if(deleteErr){
          console.error("Failed to delete used token: ", deleteErr);
        }
      });
      //the password was reset and the user is notified
      return res.status(200).json({success:true, message: 'Password successfully reset'});
    });
  });
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log("Incoming Login Request:", email, password);

  try{
    const query = 'SELECT * FROM users WHERE email = ?';
    const [userResults] = await db.promise().query(query, [email]);

    if (userResults.length === 0){
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const user = userResults[0];
    console.log("Password provided by user:", password);
    console.log("Hashed password from database:", user.password_hash);

    if (!user.password_hash) {
      console.error("Password hash is missing for the user");
      return res.status(500).json({ success: false, message: 'Password hash is missing in database' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    const notifQuery = "SELECT * FROM notification_preferences WHERE user_id = ?";
    const [notifResults] = await db.promise().query(notifQuery, [user.id]);
    const notifPreferences = notifResults.length > 0 ? notifResults[0] : {deadline_alert_timing: 'never', schedule_alert_timing: 'never'};

    // Send user information to the frontend
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        notificationEnabled: user.notification_enabled,
        deadlineOffset: notifPreferences.deadline_alert_timing,
        scheduleOffset: notifPreferences.schedule_alert_timing
      }
    });
  }catch(err){
    console.error("Database Error:", err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user info route
app.put('/update-user', async (req, res) => {
  const { userId, email, firstName, lastName, currentPassword, newPassword, notificationEnabled, deadlineOffset, scheduleOffset } = req.body;

  try{
    const query = 'SELECT * FROM users WHERE email = ?';
    const [userResults] = await db.promise().query(query, [email]);
    if(userResults.length === 0){
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = userResults[0];
    const passwordUpdated = currentPassword && newPassword;

    // If password is to be changed, check current password
    let hashedPassword;
    if (passwordUpdated) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      // Hash the new password
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    }

    const firstNameUpdated = user.first_name === firstName ? false : true;
    const lastNameUpdated = user.last_name === lastName ? false : true;
    const notifsUpdated = user.notification_enabled === notificationEnabled ? false : true;

    const deadlineOffsetQuery = 'SELECT deadline_alert_timing FROM notification_preferences WHERE user_id = ?';
    const deadlineOffsetResults = await db.promise().query(deadlineOffsetQuery, [userId]);
    const deadlineOffsetUpdated = deadlineOffsetResults[0].deadline_alert_timing === deadlineOffset ? false : true;

    const scheduleOffsetQuery =  'SELECT schedule_alert_timing FROM notification_preferences WHERE user_id = ?';
    const scheduleOffsetResults = await db.promise().query(scheduleOffsetQuery, [userId]);
    console.log(`schedule Offset: ${scheduleOffset}`);
    console.log(`schedule alert timing: ${scheduleOffsetResults[0].schedule_alert_timing}`);
    const scheduleOffsetUpdated = scheduleOffsetResults[0].schedule_alert_timing === scheduleOffset ? false : true;
    console.log(`schedule Offset Updated: ${scheduleOffsetUpdated}`);

    // parsing update query and parameters based on attributes that need to be updated
    let updateQueryParams = [];
    let updateParams = [];

    if(firstNameUpdated){
      updateQueryParams.push("first_name = ?");
      updateParams.push(firstName);
    }

    if(lastNameUpdated){
      updateQueryParams.push("last_name = ?");
      updateParams.push(lastName);
    }

    if(passwordUpdated){
      updateQueryParams.push("password_hash = ?");
      updateParams.push(hashedPassword);
    }

    if(notifsUpdated){
      updateQueryParams.push("notification_enabled = ?");
      updateParams.push(notificationEnabled ? 1 : 0);
    }
    updateParams.push(email);

    if(firstNameUpdated || lastNameUpdated || passwordUpdated || notifsUpdated)
    {
      // updating user information
      try{
        const updateQuery = `UPDATE users SET ${updateQueryParams.join(", ")} WHERE email = ?`;
        await db.promise().query(updateQuery, updateParams)
      }catch(updateErr){
        return res.status(500).json({ success: false, message: 'Failed to update user' });
      }
    }

    if(notifsUpdated || deadlineOffsetUpdated || scheduleOffsetUpdated){
      // updating notification preferences
      try{
        const notifQuery = 'UPDATE notification_preferences SET deadline_alert_timing = ?, schedule_alert_timing = ? WHERE user_id = ?';
        const notifParams = notificationEnabled ? [deadlineOffset, scheduleOffset, userId] : ['never', 'never', userId];
        
        await db.promise().query(notifQuery, notifParams);
        
        // get data for notifications that need to be scheduled
        const deadlinesQuery = 'SELECT task_id, list_name, task_description, deadline FROM todo_lists INNER JOIN tasks on todo_lists.list_id = tasks.list_id WHERE user_id = ? AND deadline IS NOT NULL AND deadline >= CURRENT_DATE AND completed = 0';
        const [deadlines] = await db.promise().query(deadlinesQuery, [userId]);

        const scheduleQuery = 'SELECT id, plan_text FROM studyPlans WHERE user_email = ?';
        const [schedules] = await db.promise().query(scheduleQuery, [email]);

        // user did not update notifications settings but updated deadline notification preferences
        console.log(`notifsUpdated: ${notifsUpdated}`);
        console.log(`deadlineOffsetUpdated: ${deadlineOffsetUpdated}`);
        if(!notifsUpdated && deadlineOffsetUpdated){
          for(const deadline of deadlines){
            deadlineEmailInfo = {
              firstName, 
              taskId: deadline.task_id, 
              listName: deadline.list_name,
              email, 
              taskDescription: deadline.task_description, 
              deadline: deadline.deadline, 
              offset: deadlineOffset
            };

            // rescheduling deadline emails with updated notification preferences
            console.log(`task id: ${deadlineEmailInfo.taskId}`);
            const rescheduleEmail = await fetch(`${emailServerURL}/reschedule-email`,{
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify(deadlineEmailInfo)
            });

            const result = await rescheduleEmail.json();
            if(result.success){
              console.log(result.message);
            }else{
              console.error(result.message);
            }
          }

        }

        // user did not update notifications settings but updated schedule notification preferences
        console.log(`notifsUpdated: ${notifsUpdated}`);
        console.log(`scheduleOffsetUpdated: ${scheduleOffsetUpdated}`);
        if(!notifsUpdated && scheduleOffsetUpdated){
          for(const schedule of schedules){
            const scheduleId = schedule.id;
            const studyPlan = JSON.parse(schedule.plan_text);

            // retrieving job ids for all sessions associated with the schedule
            const jobsQuery = "SELECT job_id FROM schedule_emails WHERE schedule_id = ?";
            const [jobIds] = await db.promise().query(jobsQuery, [scheduleId]);
            const jobIdsArray = jobIds.map(job => job.job_id);
            
            // deleting all scheduled jobs for sessions associated with the schedule
            const cancelEmails = await fetch(`${emailServerURL}/delete-schedule-notifications`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                  jobIds: jobIdsArray,
                  scheduleId
                })
            });

            const result = await cancelEmails.json();
            if(result.success){
              console.log(result.message);
            }else{
              console.error(result.message);
            }
            
            // rescheduling with new offset for each individual session job associated with the schedule 
            for(const session of studyPlan){
              sessionEmailInfo = {
                firstName,
                scheduleId: scheduleId,
                email,
                subject: session.subject,
                day: session.day,
                date: session.date,
                startTime: session.startTime,
                endTime: session.endTime,
                offset: scheduleOffset
              };

              // reschedule session email with updated notification preferences
              const rescheduleEmail = await fetch(`${emailServerURL}/add-session`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(sessionEmailInfo)
              });

              const result = await rescheduleEmail.json();
              if(result.success){
                console.log(result.message);
              }else{
                console.error(result.message);
              }
            }
          }
          
        }

        // Updating scheduled notifications based on user account settings
        // User has updated their notification settings
        console.log(`notifsUpdated: ${notifsUpdated}`);
        if(notifsUpdated){
          // scheduling or un-scheduling deadlines based on notification setting
          for(const deadline of deadlines){
            deadlineEmailInfo = {
              firstName, 
              taskId: deadline.task_id, 
              listName: deadline.list_name,
              email, 
              taskDescription: deadline.task_description, 
              deadline: deadline.deadline, 
              offset: deadlineOffset
            };

            // schedule all deadline emails
            if(notificationEnabled){
              const scheduleEmail = await fetch(`${emailServerURL}/create-task`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(deadlineEmailInfo)
              });
              const result = await scheduleEmail.json();
                if(result.success){
                    console.log(result.message);
                }else{
                    console.error(result.message);
              }
              // unschedule all deadline emails
            }else{
              const cancelEmail = await fetch(`${emailServerURL}/delete-task-notification`,{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({taskId: deadlineEmailInfo.taskId})
              });

              const result = await cancelEmail.json();
              if(result.success){
                console.log(result.message);
              }else{
                console.error(result.message);
              }
            }
          }

          // scheduling or un-scheduling study sessions based on notification setting
          // loops through each schedule
          for(const schedule of schedules){
            const scheduleId = schedule.id;
            const studyPlan = JSON.parse(schedule.plan_text);

            // un-schedules all session emails associated with the schedule if notifications have been turned off
            if(!notificationEnabled){
              const jobsQuery = "SELECT job_id FROM schedule_emails WHERE schedule_id = ?";
              const [jobIds] = await db.promise().query(jobsQuery, [scheduleId]);
              const jobIdsArray = jobIds.map(job => job.job_id);

              const cancelEmails = await fetch(`${emailServerURL}/delete-schedule-notifications`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                  jobIds: jobIdsArray,
                  scheduleId
                })
              });

              const result = await cancelEmails.json();
              if(result.success){
                console.log(result.message);
              }else{
                console.error(result.message);
              }
            // schedules emails for each session if notifications have been turned on
            }else{
              // loops through each session for a schedule
              for(const session of studyPlan){
                sessionEmailInfo = {
                  firstName,
                  scheduleId: scheduleId,
                  email,
                  subject: session.subject,
                  day: session.day,
                  date: session.date,
                  startTime: session.startTime,
                  endTime: session.endTime,
                  offset: scheduleOffset
                };
                // schedule session email
                const scheduleEmail = await fetch(`${emailServerURL}/add-session`, {
                  method: "POST",
                  headers: {"Content-Type": "application/json"},
                  body: JSON.stringify(sessionEmailInfo)
                });

                const result = await scheduleEmail.json();
                if(result.success){
                    console.log(result.message);
                }else{
                    console.error(result.message);
                }
              }
            }
          }        
        }
      }catch(notifErr){
        return res.status(500).json({success: false, message: "Failed to update Notification Preferences"});
      }
    }

    const [updatedUserResults] = await db.promise().query(query, [email]);
    const updatedUser = updatedUserResults[0];

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        userId: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        notificationEnabled: updatedUser.notification_enabled,
        deadlineOffset,
        scheduleOffset
      },
    });
  }catch(err){
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

//Delete study plan
app.delete('/delete-study-plan/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
      return res.status(400).json({ success: false, message: 'Missing study plan ID' });
  }

  // retrieving job ids for all sessions associated with the schedule
  const jobsQuery = "SELECT job_id FROM schedule_emails WHERE schedule_id = ?";
  const [jobIds] = await db.promise().query(jobsQuery, [id]);
  const jobIdsArray = jobIds.map(job => job.job_id);
  
  if(jobIdsArray.length != 0){
    // deleting all scheduled jobs for sessions associated with the schedule
    const cancelEmails = await fetch(`${emailServerURL}/delete-schedule-notifications`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          jobIds: jobIdsArray,
          scheduleId: id
        })
    });

    const result = await cancelEmails.json();
    if(result.success){
      console.log(result.message);
    }else{
      console.error(result.message);
    }
  }

  try {
      const deleteQuery = 'DELETE FROM studyPlans WHERE id = ?';
      const [result] = await db.promise().query(deleteQuery, [id]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Study plan not found' });
      }

      res.status(200).json({ success: true, message: 'Study plan deleted successfully' });
  } catch (error) {
      console.error('Error deleting study plan:', error);
      res.status(500).json({ success: false, message: 'Failed to delete study plan' });
  }
});


app.delete('/delete-user', async (req, res) =>{
  const { email, userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required to delete an account.' });
  }

  // getting getting users deadlines and unschedule any associated notifications
  const deadlinesQuery = 'SELECT task_id FROM todo_lists INNER JOIN tasks on todo_lists.list_id = tasks.list_id WHERE user_id = ? AND deadline IS NOT NULL AND deadline >= CURRENT_DATE AND completed = 0';
  const [deadlines] = await db.promise().query(deadlinesQuery, [userId]);
  if(deadlines.length > 0){
    for(const deadline of deadlines){
      const deleteEmail = await fetch(`${emailServerURL}/delete-task-notification`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({taskId: deadline.task_id})
      });

      const result = await deleteEmail.json();
      if(result.success){
        console.log(result.message);
      }else{
        console.error(result.message);
      }
    }
  }

  // getting all schedules and unschedule any associated notifications
  const scheduleQuery = 'SELECT id FROM studyPlans WHERE user_email = ?';
  const [schedules] = await db.promise().query(scheduleQuery, [email]);

  if(schedules.length > 0){
    for(const schedule of schedules){
      const scheduleId = schedule.id;

      // retrieving job ids for all sessions associated with the schedule
      const jobsQuery = "SELECT job_id FROM schedule_emails WHERE schedule_id = ?";
      const [jobIds] = await db.promise().query(jobsQuery, [scheduleId]);
      const jobIdsArray = jobIds.map(job => job.job_id);
      
      if(jobIdsArray.length != 0){
        // deleting all scheduled jobs for sessions associated with the schedule
        const cancelEmails = await fetch(`${emailServerURL}/delete-schedule-notifications`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              jobIds: jobIdsArray,
              scheduleId
            })
        });

        const result = await cancelEmails.json();
        if(result.success){
          console.log(result.message);
        }else{
          console.error(result.message);
        }
      }
    }
  }

  const query = 'DELETE FROM users WHERE id = ?';

  db.query(query, [userId], (err, result) =>{
      if(err){
        console.error('Error executing the delete query: ', err);
        res.status(500).json({success: false, message: 'Failed to delete user profile, please try again later'});
        return;
      }
      if(result.affectedRows === 0){
        console.error('Delete cannot be performed: The user could not be found in the database')
        res.status(404).json({success: false, message: 'User account not found in our system.'});
      }else{
        res.status(200).json({success: true, message: 'Your account has been successfully deleted'});
      }
  });
});

// Saves a newly created to-do list
app.post('/save-todo', async (req, res) =>{
    // getting list info from request
    const{firstName, email, listName, tasks, taskDates, userId, deadlineOffset, notificationEnabled} = req.body;
    // starting transaction so all queries succeed or fail together
    db.beginTransaction((transErr) =>{
      // error starting transaction
      if(transErr){
        return res.status(500).json({success: false, message: 'This transaction could not be started, please try saving your list again.'});
      }
  
      // query to add new list to to-do list table 
      const addListQuery = 'INSERT INTO todo_lists (user_id, list_name) Values(?, ?)';
      db.query(addListQuery, [userId, listName], (listErr, result) => {
        // roll database back to previous state if error occurs while adding list
        if(listErr){
          return db.rollback(() =>{
            res.status(500).json({success: false, message: 'The To-Do List could not be added at this time, please try again later.'});
          });
        }
  
        // getting newly generated list id from insert query
        const listId = result.insertId;
        // query to add tasks to task table
        const addTaskQuery = 'INSERT INTO tasks (list_id, task_description, deadline, priority) Values(?, ?, ?, ?)';
        
        // maps a promise for each task in the task array
        const taskPromises = tasks.map((taskDescription, index) =>{
          return new Promise ((resolve, reject) =>{
            let deadline = null;
  
            // checks if the task has a deadline
            if(taskDates[index] != null){
              // formats date to match database formatting
              deadline = taskDates[index].slice(0,10);
            }
            // makes a promise to complete (or fail) the insertion of each task 
          
              db.query(addTaskQuery, [listId, taskDescription, deadline, index + 1], async (taskErr, result) =>{
                // if an error occurs while adding a task the promise for that task is rejected
                if(taskErr){
                  return reject(taskErr);
                }
                if(notificationEnabled){
                  const taskId = result.insertId;
                  if(deadline && new Date(deadline).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)){
                    try{
                      const scheduleEmail = await fetch (`${emailServerURL}/create-task` ,{
                        method: "POST",
                        headers: {"Content-Type" : "application/json"},
                        body: JSON.stringify({
                          firstName,
                          taskId,
                          listName,
                          email,
                          taskDescription,
                          deadline,
                          offset: deadlineOffset
                        }),
                      });
                      const emailResult = await scheduleEmail.json();
                      if(!emailResult.success){
                        console.error(`Failed to schedule email for task ${taskId}: ${emailResult.message}`);
                      }
                    }catch(emailErr){
                      console.error(`Error scheduling email for task ${taskId}:`, emailErr);
                    }
                  }
                }
                resolve(result)
              });
            });
        });
  
        // Makes sure all promises were fulfilled before committing
        Promise.all(taskPromises).then(() => {
          // attempts to commit 
          db.commit((commitErr) => {
            // rolls database back if there is a transaction error
            if(commitErr){
              return db.rollback(() =>{
                res.status(500).json({success: false, message: 'This Transaction could not be completed, please try again'});
              });
            }
            //informs user when to -do list has been saved
            res.status(200).json({success: true, message: `To-Do List: '${listName}' was saved successfully.`});
          });
        }).catch((taskPromisesError) => {
          // rolls database back if any promise was rejected
          console.log('Failed to add tasks, error:', taskPromisesError.message);
          db.rollback(() => {
            res.status(500).json({success: false, message: 'The To-Do List could not be added at this time due to issues adding a task, please try again later.'});
          });
        });
      });
    });
});

// gets to-do list information for preview page
app.post('/get-todo-lists', async (req, res) =>{
  // getting user id from request
  const { user_id }  = req.body;
  let inProgressLists = [];
  let completedLists = [];
  
  // query to get all the lists associated with a specific user
  const query = `SELECT todo_lists.list_id, list_name, created_at, completed_at, task_id, task_description, deadline, completed, priority
                FROM todo_lists 
                LEFT JOIN tasks ON todo_lists.list_id = tasks.list_id
                WHERE user_id = ?
                ORDER BY todo_lists.list_id, priority`;
  
  db.query(query, [user_id], async (err, results) => {
    if(err){
      return res.status(500).json({success: false, message: "Error Retrieving To-Do Lists"});
    }

    let progressIndex = 0;
    let completedIndex = 0;
    // goes through results and separates each to-do list into completed and in progress arrays
    results.forEach(row =>{
      // in progress list
      if(row.completed_at === null){
        let taskAdded = false;
        // the list already exists and just the task needs to be added
        if(!(inProgressLists.length == 0)){
          for(let i = 0; i < inProgressLists.length; i++){
              if(row.list_id == inProgressLists[i].list_id){
                inProgressLists[i].tasks.push({
                  task_id: row.task_id,
                  task_description: row.task_description,
                  deadline: row.deadline,
                  completed: row.completed,
                  priority: row.priority
                });
                taskAdded = true;
              }
          }
        }
        // the list does not exist already both the list and the task need to be added
        if(!taskAdded){
          inProgressLists.push({
            list_id: row.list_id,
            list_name: row.list_name,
            created_at: row.created_at,
            completed_at: row.completed_at,
            tasks: []
          });
          inProgressLists[progressIndex].tasks.push({
            task_id: row.task_id,
            task_description: row.task_description,
            deadline: row.deadline,
            completed: row.completed,
            priority: row.priority
          });
          progressIndex++;
        }
        // completed list
      }else{
        let taskAdded = false;
        // the list already exists in the array, just the task needs to be added
        if(!(completedLists.length == 0)){
          for(let i = 0; i < completedLists.length; i++){
              if(row.list_id == completedLists[i].list_id){
                completedLists[i].tasks.push({
                  task_id: row.task_id,
                  task_description: row.task_description,
                  deadline: row.deadline,
                  completed: row.completed,
                  priority: row.priority
                });
                taskAdded = true;
              }
          }
        }
        // the list did not exist and both list and task must be added
        if(!taskAdded){
          completedLists.push({
            list_id: row.list_id,
            list_name: row.list_name,
            created_at: row.created_at,
            completed_at: row.completed_at,
            tasks: []
          });
          completedLists[completedIndex].tasks.push({
            task_id: row.task_id,
            task_description: row.task_description,
            deadline: row.deadline,
            completed: row.completed,
            priority: row.priority
          });
          completedIndex++;
        }
      }
    });

    // returns arrays with in progress and completed lists
    res.json({
      success: true,
      message: "To-Do list retrieved successfully",
      inProgressLists: inProgressLists,
      completedLists: completedLists
    });

  });
});

// update list and task information once its been edited
app.post('/update-todo', async(req, res) =>{
  // getting data from request
  const {listDetails, userId, firstName, email, deadlineOffset, notificationEnabled} = req.body;

  // deconstructing list details
  const {list_id, list_name, created_at, completed_at, tasks} = listDetails;

  // starting transaction so all queries fail or succeed together
  db.beginTransaction((transErr) =>{
    if(transErr){
      return res.status(500).json({success: false, message: "This transaction could not be started, please try saving your list again."});
    }

    // query to update list information
    const updateListQuery = "UPDATE todo_lists SET list_name = ?, completed_at = ? WHERE list_id = ? AND user_id = ?";
    db.query(updateListQuery, [list_name, completed_at, list_id, userId], (err, results) =>{
      // rolls back transaction to start if query fails
      if(err){
        return db.rollback(() =>{
          return res.status(500).json({success: false, message: 'The To-Do List could not be updated at this time, please try again later.'});
        });
      }

      // query to get get task ids
      const getTasksQuery = "SELECT task_id FROM tasks WHERE list_id = ?";
      db.query(getTasksQuery, [list_id], (getTasksErr, results) => {
        if(getTasksErr){
          // rolls back transaction to start if query fails
          return db.rollback(() =>{
            return res.status(500).json({success: false, message: 'The list tasks could not be retrieved at this time, please try again later.'});
          });
        }

        // compares tasks in database to updated tasks
        const existingTaskIds = results.map(row => row.task_id);
        const updatedTaskIds = tasks.filter(task => task.task_id !== null).map(task => task.task_id);
        // stores the task ids of tasks that need to be deleted from the database
        const deletedTaskIds = existingTaskIds.filter(id => !updatedTaskIds.includes(id));

        // deletes tasks from the database
        const deleteTask = (taskId) => {
          return new Promise((resolve, reject) =>{
            
            // query to delete task
            const deleteTaskQuery = "DELETE FROM tasks WHERE task_id = ?";
            db.query(deleteTaskQuery, [taskId], async (deleteTaskErr, results) =>{
              if(deleteTaskErr){
                return reject(deleteTaskErr);
              }

              try{
                const deleteEmail = await fetch(`${emailServerURL}/delete-task-notification`,{
                  method: "POST",
                  headers: {"Content-Type": "application/json"},
                  body: JSON.stringify({ taskId })
                });
            
                const result = await deleteEmail.json();
                if(result.success){
                  console.log(result.message);
                }else{
                  console.error(result.message);
                }
              }catch(err){
                console.error(`Error deleting notification for task ${taskId}:` , err);
              }
              resolve();
            });
          });
        };

        // makes the promise to complete each deletion 
        const deleteTaskPromises = deletedTaskIds.map(deleteTask);
        
        // updates task info if task already existed
        const updateTask = (task) =>{
          return new Promise((resolve, reject) =>{
            //query to update task information
            const updateTaskQuery = "UPDATE tasks SET task_description = ?, deadline = ?, completed = ?, priority = ? WHERE task_id = ? AND list_id = ?";
            db.query(updateTaskQuery, [task.task_description, task.deadline, task.completed, task.priority, task.task_id, list_id], async (updateTaskErr, results) =>{
              if(updateTaskErr){
                return reject(updateTaskErr);
              }

              const deadline = task.deadline;
              const taskCompleted = task.completed;
              // scheduling notification if task hasn't been completed
              if(notificationEnabled && !taskCompleted){
                if(deadline && new Date(deadline).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)){
                  try{
                    const rescheduleEmail = await fetch (`${emailServerURL}/reschedule-email` ,{
                      method: "POST",
                      headers: {"Content-Type" : "application/json"},
                      body: JSON.stringify({
                        firstName,
                        taskId: task.task_id,
                        listName: list_name,
                        email,
                        taskDescription: task.task_description,
                        deadline,
                        offset: deadlineOffset
                      }),
                    });
                    const emailResult = await rescheduleEmail.json();
                    if(!emailResult.success){
                      console.error(`Failed to reschedule email for task ${taskId}: ${emailResult.message}`);
                    }
                  }catch(emailErr){
                    console.error(`Error rescheduling email for task ${taskId}:`, emailErr);
                  }
                }
              // removing scheduled notification if task has been completed
              }else if(notificationEnabled && deadline && taskCompleted){
                try{
                  taskId = task.task_id;
                  const deleteEmail = await fetch(`${emailServerURL}/delete-task-notification`,{
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ taskId })
                  });
              
                  const result = await deleteEmail.json();
                  if(result.success){
                    console.log(result.message);
                  }else{
                    console.error(result.message);
                  }
                }catch(err){
                  console.error(`Error deleting notification for task ${taskId}:` , err);
                }
              }
              resolve(results);
            });
          });
        };

        // adds task to task table in database if task did not exist before
        const addTask = (task) =>{
          return new Promise((resolve, reject) =>{
            // query to add task to task table
            const addTaskQuery = "INSERT INTO tasks (list_id, task_description, deadline, completed, priority) VALUES(?, ?, ?, ?, ?)";
            db.query(addTaskQuery, [list_id, task.task_description, task.deadline, task.completed, task.priority], async (addTaskErr, results) =>{
              if(addTaskErr){
                return reject(addTaskErr);
              }
              const taskCompleted = task.completed;
              if(notificationEnabled && !taskCompleted){
                const taskId = results.insertId;
                const deadline = task.deadline;
                if(deadline && new Date(deadline).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)){
                  try{
                    const scheduleEmail = await fetch (`${emailServerURL}/create-task` ,{
                      method: "POST",
                      headers: {"Content-Type" : "application/json"},
                      body: JSON.stringify({
                        firstName,
                        taskId,
                        listName: list_name,
                        email,
                        taskDescription: task.task_description,
                        deadline,
                        offset: deadlineOffset
                      }),
                    });
                    const emailResult = await scheduleEmail.json();
                    if(!emailResult.success){
                      console.error(`Failed to schedule email for task ${taskId}: ${emailResult.message}`);
                    }
                  }catch(emailErr){
                    console.error(`Error scheduling email for task ${taskId}:`, emailErr);
                  }
                }
              }
              resolve(results);
            });
          });
        };

        // makes a promise to complete each task insertion or update
        const taskPromises = tasks.map((task, index) =>{
          task.priority = index + 1;
          if(task.task_id){
            return updateTask(task);
          } else{
            return addTask(task);
          }
        });

        // ensures all promises were fulfilled
        Promise.all([...deleteTaskPromises, ...taskPromises]).then(() => {
          db.commit((err) => {
            if(err){
              return db.rollback(() =>{
                return res.status(500).json({success: false, message: 'The To-Do List could not be updated at this time, please try again later.'});
              });
            }
            res.status(200).json({success: true, message: "To-do list was updated successfully"});
          });
        }).catch((err) =>{
          db.rollback(() =>{
            return res.status(500).json({success: false, message: 'The transaction promises could not be made at this time, please try again later.'});
          });
        });
      });
    });
  });
});

// deleting to do list from database
app.delete('/delete-todo-list', async(req, res) =>{
  // getting list info from request
  const {userId, list_id} = req.body;

  // getting deadlines to delete scheduled notifications
  const deadlinesQuery = 'SELECT task_id FROM todo_lists INNER JOIN tasks on todo_lists.list_id = tasks.list_id WHERE user_id = ? AND tasks.list_id = ? AND deadline IS NOT NULL AND deadline >= CURRENT_DATE AND completed = 0';
  const [deadlines] = await db.promise().query(deadlinesQuery, [userId, list_id]);

  for(const deadline of deadlines){
    const deleteEmail = await fetch(`${emailServerURL}/delete-task-notification`,{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({taskId: deadline.task_id})
    });

    const result = await deleteEmail.json();
    if(result.success){
      console.log(result.message);
    }else{
      console.error(result.message);
    }
  }

  // delete query
  const deleteListQuery = 'DELETE FROM todo_lists WHERE list_id = ? AND user_id = ?';

  // making query to the database, only list deletion needs to be done, cascade rules will delete the tasks for us
  db.query(deleteListQuery, [list_id, userId], (err, results) =>{
    if(err){
      return res.status(500).json({success: false, message: 'The To-Do List could not be deleted at this time, please try again later.'});
    }
    return res.status(200).json({success: true, message: 'The To-Do List was deleted successfully.'});
  });
});

// adding deadline email information to database
app.post('/save-deadline-job', async(req, res) =>{
  const {taskId, firstName, listName, email, taskDescription, deadline, offset} = req.body;

  const query = "INSERT INTO deadline_emails (task_id, first_name, list_name, email, task_description, deadline, deadline_offset) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(query, [taskId, firstName, listName, email, taskDescription, deadline, offset], (err) => {
    if(err){
      return res.status(500).json({success: false, message: `Failed to save job for task ${taskId} to the database: ${err}`});
    }else{
      return res.status(200).json({success: true, message: `The job for task ${taskId} has been saved to the database`});
    }
  });
});

// deleting deadline email information from database
app.delete('/delete-deadline-job', async(req, res) =>{
  const { taskId } = req.body;

  const query = "DELETE FROM deadline_emails WHERE task_id = ?";
  db.query(query, [taskId], (err) => {
    if(err){
      return res.status(500).json({success: false, message: `Failed to remove job for task ${taskId} from the database: ${err}`});
    }else{
      return res.status(200).json({success: true, message: `The job for task ${taskId} has been removed from the database`});
    }
  });
});

// getting the information for previously scheduled emails from database
app.get('/get-scheduled-jobs', async(req, res) =>{
  db.query("SELECT * FROM deadline_emails", (err, results) => {
    if(err){
      console.error("Failed to retrieve scheduled jobs from the database: ", err);
      return res.status(500).json({success: false, message: "Failed to retrieve scheduled jobs from the database"});
    }
    return res.status(200).json({success: true, message: "scheduled jobs retrieved", data: results});
  });
});

// adding schedule email information to database
app.post('/save-study-job', async (req, res) =>{
  const {scheduleId, firstName, email, subject, day, date, startTime, endTime, offset} = req.body;
  const query = "INSERT INTO schedule_emails (schedule_id, first_name, email, subject, day, date, start_time, end_time, notification_offset) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(query, [scheduleId, firstName, email, subject, day, date, startTime, endTime, offset], (err, result) =>{
    if(err){
      return res.status(500).json({success: false, message: `Failed to save job for a study session to the database: ${err}`});
    }else{
      return res.status(200).json({
        success: true, 
        message: `The job has been saved to the database`,
        job_id: result.insertId
      });
    }
  });
});

app.delete('/delete-study-jobs', async(req, res) =>{
  const { jobIds } = req.body;
  const query = "DELETE FROM schedule_emails WHERE job_id IN (?)";
  db.query(query, [jobIds], (err) => {
    if(err){
      return res.status(500).json({success: false, message: `Failed to remove job for schedule notifications from the database: ${err}`});
    }else{
      return res.status(200).json({success: true, message: `The job has been removed from the database`});
    }
  });
});
app.get("/get-scheduled-session-jobs", async (req, res) =>{
  db.query("SELECT * FROM schedule_emails", (err, results) => {
    if(err){
      console.error("Failed to retrieve scheduled jobs for study sessions from the database: ", err);
      return res.status(500).json({success: false, message: "Failed to retrieve scheduled jobs for study sessions from the database"});
    }
    return res.status(200).json({success: true, message: "scheduled jobs for study sessions retrieved", data: results});
  });
});