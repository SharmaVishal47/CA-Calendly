
const express = require('express');
const userRoutes = require('../routes/users');
const meetingRoutes = require('../routes/meeting');
const integrationRoutes = require('../routes/integration');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');


console.log('test kishor');
console.log('test kishor');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ca_calendly'
});
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});
global.db = db;

app.use('/', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Max-Age');
  next();
});

app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/meeting', meetingRoutes);
app.use('/integration', integrationRoutes);
module.exports = app;
