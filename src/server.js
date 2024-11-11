const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

//default route to check the server status
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
    console .error('Database error during email check:' , checkError);
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
  const query = 'INSERT INTO users (firstName, lastName, email, password) Values (?, ?, ?, ?)';
  db.query(query, [firstName, lastName, email, hashedPassword], (error, result) => {
    if(error){
      console.error('Error saving user to database:' , error);
      res.status(500).json(
        {success: false, message: 'Error saving user'});
        return res.status(500).json({success: false, message: 'Error saving user to database.'});
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