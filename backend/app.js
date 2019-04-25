const express = require('express');
const userRoutes = require('../routes/users');
const googleCalRoutes = require('../routes/emailVerify');
const meetingRoutes = require('../routes/meeting');
const sendEmail = require('../routes/sendEmail');
const integrationRoutes = require('../routes/integration');
const PasswordRoutes = require('../routes/password');
const calendlyTimeFilter = require('../routes/calendlyTimeFilter');
const userDataRoutes = require('../routes/userData');
const zoomIntegrate = require('../routes/zoomIntegration');
const userTable = require('../routes/user_table');
const team = require('../routes/team');
const app = express();
const bodyParser = require('body-parser');
const path  = require('path');
const mysql = require('mysql');
const eventsRoutes = require('../routes/events');
const sendResetPasswordEmail = require('../routes/sendPasswordEmail');

/*const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ca_calendly'
});*/
/*Main Data Base*/
/*const db = mysql.createConnection({
  host: '166.62.118.106',
  user: 'cloudmee_analogy',
  port: '3306',
  password: 'uLm7OCMf,b7k',
  database: 'cloudmee_ca_calendly'
});*/

/*Dev Data Base*/
const db = mysql.createConnection({
  host: '166.62.118.106',
  user: 'cloudmee_dev',
  port: '3306',
  password: 'XcH2RzZ4f=Pa',
  database: 'cloudmee_dev_cloudmeetin'
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
/*app.use(express.static(path.join(__dirname, '../CloudMeetIn')));
app.use('/:id',express.static(path.join(__dirname, '../CloudMeetIn')));*/
app.use('/userData',userDataRoutes);
app.use('/images',express.static(path.join('backend/images')));
app.use('/user', userRoutes);
app.use('/meeting', meetingRoutes);
app.use('/integration', integrationRoutes);
app.use('/googleCalendar', googleCalRoutes);
app.use('/sendEmail', sendEmail);
app.use('/filter', calendlyTimeFilter);
app.use('/password', PasswordRoutes);
app.use('/zoom', zoomIntegrate);
app.use('/usertable', userTable);
app.use('/team', team);
app.use('/events', eventsRoutes);
app.use('/sendResetPasswordEmail',sendResetPasswordEmail);
module.exports = app;
