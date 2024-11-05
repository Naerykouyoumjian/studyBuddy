const mysql = require('mysql2');

console.log("Loading database.js");

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'Studybuddy490!',  // Update with your MySQL password
  database: 'studyBuddyDB'
});

db.connect((error) => {
  if (error) {
    console.error('Database connection failed:', error);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db;
