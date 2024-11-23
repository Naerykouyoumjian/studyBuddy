const mysql = require('mysql2');

console.log("Loading database.js");

const db = mysql.createConnection({
  host: 'studybuddydb.cvkowgakit8s.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'Studybuddy490!',
  database: 'studybuddydb'
});

db.connect((error) => {
  if (error) {
    console.error('Database connection failed:', error);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db;
