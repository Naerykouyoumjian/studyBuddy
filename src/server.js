const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is up and running!');
  console.log("GET request to '/' route");
});

//Connect to mySQL
db.connect(error => {
  if (error) return console.error('Database connection failed:', error);
  console.log('Connected to MySQL database');
});


//Adding signup route
app.post('/signup', async (req, res) => {
const{username, email, password} = req.body;

try{
  //hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  //save the user with hashed password
  const query = 'INSERT INTO users (username, email, password) Values (?, ?, ?)';
  db.query(query, [username, email, hashedPassword], (error, result) => {
    if(error){
      console.error('Error saving user to database:' , error);
      res.status(500).json(
        {success: false, message: 'Error saving user'});
    } else {
      res.status(200).json({ success: true, message: 'User registered successfully'});
    }
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
    const updateQuery = 'UPDATE users SET password = ? WHERE email = ?'
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


app.listen(PORT, error => {
  if (error) return console.error("Server failed to start:", error);
  console.log(`Server is running on http://localhost:${PORT}`);
});

/*
You should write this in the Mysql workbench to work
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

/*
add this create statement to database to create reset_tokens table:
create table reset_tokens(
	  id INT AUTO_INCREMENT PRIMARY KEY,
	  email VARCHAR(100) NOT NULL UNIQUE,
    token VARCHAR(50) NOT NULL UNIQUE,
    expiration DATETIME NOT NULL,
    FOREIGN KEY (email) REFERENCES users(email)
);
*/