const express = require('express');
const router = express.Router();
const fs = require('fs');
const {google} = require('googleapis');
const googleAuth = require('google-auth-library');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

router.post('/checkTokenUserId',(req,res,next)=>{
  const decodedToken = jwt.verify(req.body.token,'secret-code-for-token');
  if(decodedToken.userId === req.body.userId){
    res.status(200).json({
      message: 'Match Successfully.'
    });
  }else{
    res.status(404).json({
      message: 'Invalid Token'
    });
  }
});

router.post('/checkMeetingPlatform',(req,res,next)=>{
  console.log(req.body);
  let usernameQuery = "SELECT email,go2meeting,salesforce,zoom,userId FROM `calendly` WHERE userId = '" + req.body.userId + "'";
  db.query(usernameQuery, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'Search Successfully.',
        data: result
      });
    }
  });
});

router.post('/getcalendarlist',(req,res,next)=>{
  let usernameQuery = "SELECT token_path FROM `calendly` WHERE email = '"+req.body.email+"'";
  db.query(usernameQuery, (err, result) => {
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      console.log('TokenPath === > > >>',result[0].token_path);
      const TOKEN_PATH =  result[0].token_path;
      const googleSecrets = JSON.parse(fs.readFileSync('credentials.json')).installed;
      const oauth2Client = new googleAuth.OAuth2Client(
        googleSecrets.client_id,
        googleSecrets.client_secret,
        googleSecrets.redirect_uris[0]
      );
      const token = fs.readFileSync(TOKEN_PATH);
      oauth2Client.setCredentials(JSON.parse(token));
      const calendar = google.calendar({version: 'v3'});
      calendar.calendarList.list({ auth: oauth2Client }, function(err, resp) {
        let myCalendarMap = {
          record : resp.data.items
        };
        console.log(myCalendarMap);
        res.status(200).json(myCalendarMap);
      });
    }
  });
});

// Insert event in google calendar using google calendar api
router.post('/insertevent',(req,res,next)=>{
  let usernameQuery = "SELECT token_path FROM `calendly` WHERE email = '"+req.body.email+"'";
  db.query(usernameQuery, (err, result) => {
    if (err !== null) {
      return res.status(500).send(err);
    } else {
      const TOKEN_PATH =  result[0].token_path;
      console.log(TOKEN_PATH);
      const googleSecrets = JSON.parse(fs.readFileSync('credentials.json')).installed;
      const oauth2Client = new googleAuth.OAuth2Client(
        googleSecrets.client_id,
        googleSecrets.client_secret,
        googleSecrets.redirect_uris[0]
      );
      const token = fs.readFileSync(TOKEN_PATH);
      oauth2Client.setCredentials(JSON.parse(token));
      const calendar = google.calendar({version: 'v3'});
      console.log('Request body ', req.body.meetIngData);
      const event = {
        'summary': req.body.meetIngData.subject,
        'start': {
          'dateTime': req.body.meetIngData.starttime,
          'timeZone': 'Asia/Kolkata',
        },
        'end': {
          'dateTime': req.body.meetIngData.endtime,
          'timeZone': 'Asia/Kolkata',
        },
      };
      /* const event = {
         'summary': 'Task Example By Sumit',
         'start': {
           'dateTime': '2019-01-15T12:00:00-05:00',
           'timeZone': 'Asia/Kolkata',
         },
         'end': {
           'dateTime': '2019-01-15T12:00:00-05:00',
           'timeZone': 'Asia/Kolkata',
         },
       };*/
      console.log(event);
      calendar.events.insert({
        auth: oauth2Client,
        calendarId: req.body.email,
        resource: event,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          res.status(500).json( {
            message :  'There was an error contacting the Calendar service' +err
          });
          return;
        }
        console.log('Event created: %s', event.htmlLink);
        res.status(200).json( {
          message :  'Event is successfully added in google calendar'
        });

      });
    }
  });

});

router.post('/signinwithgoogle',(req,res,next)=>{
  console.log("req.body====",req.body);
  const TOKEN_PATH = './Token/calendar-nodejs-quickstart.json';
  const googleSecrets = JSON.parse(fs.readFileSync('credentials.json')).installed;
  const oauth2Client = new googleAuth.OAuth2Client(
    googleSecrets.client_id,
    googleSecrets.client_secret,
    googleSecrets.redirect_uris[0]
  );
  const token = fs.readFileSync(TOKEN_PATH);
  let tokenObject = JSON.parse(token);
  let refresh_token = tokenObject.refresh_token;
  let access_token = tokenObject.access_token;
  let scope = tokenObject.scope;
  let token_type = tokenObject.token_type;
  let expiry_date = tokenObject.expiry_date;

  let query = "UPDATE `calendly` SET  `accessToken` = '"+access_token+"' ,`refreshToken` = '"+refresh_token+"', `scope` = '"+scope+"', `tokenType` = '"+token_type+"' ,`expiryDate` = '"+expiry_date+"' WHERE `calendly`.`email` = '" + req.body.email + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'Login Successfully.',
        data: JSON.parse(token)
      });
    }
  });
//console.log("token===========",JSON.parse(token));
  /* const calendar = google.calendar({version: 'v3'});
   console.log("calendar",calendar);*/


  /* oauth2Client.setCredentials(JSON.parse(token));
  const calendar = google.calendar({version: 'v3'});
  calendar.calendarList.list({ auth: oauth2Client }, function(err, resp) {
  let calc = [];
  resp.data.items.forEach(function(cal) {
  // console.log(cal.summary + " - " + cal.id);
  calc.push(cal);
  });
  res.status(500).json({
  message: 'Sign Up.',
  data: token
  });
  });*/
});

router.post('/updateRole',(req,res,next)=>{
  console.log(req.body);
  let query = "UPDATE `calendly` SET `role` = '" + req.body.role + "' WHERE `calendly`.`email` = '" + req.body.email + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'updated Successfully.',
        data: result
      });
    }
  });
});

router.post('/updateConfiguration',(req,res,next)=>{
  console.log(req.body);
  let query = "UPDATE `calendly` SET `startTime` = '" + req.body.inTime + "', `endTime` = '" + req.body.outTime +"',`availableDays` = '" + req.body.selectedOption+ "' WHERE `calendly`.`email` = '" + req.body.email + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'updated Successfully.',
        data: result
      });
    }
  });
});

router.post('/checkuseremail',(req,res,next)=>{
  console.log(req.body);
  let usernameQuery = "SELECT email,fullName FROM `calendly` WHERE email = '" + req.body.email + "'";
  db.query(usernameQuery, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'Search Successfully.',
        data: result
      });
    }
  });
});

router.post('/checkemailpassword',(req,res,next)=>{

  console.log(req.body);
  let usernameQuery = "SELECT email, fullName, userId FROM `calendly` WHERE email = '" + req.body.emailID + "' AND password = '"+ req.body.password+"'";
  db.query(usernameQuery, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      if(result.length > 0){
          let userId = result[0].userId;
          console.log("UserId=====",userId);

          const token = jwt.sign({
            userId: userId
          },'secret-code-for-token',{expiresIn: '1h'});

          res.status(200).json({
            message: 'Login Successfully.',
            data: result,
            token: token,
            expiresIn: 3600
        });
      }else{
        res.status(200).json({
          message: 'Invalid Credentials',
          data: result
        });
      }
    }
  });
});

router.post('/checkuser',(req,res,next)=>{
  console.log(req.body);
  let usernameQuery = "SELECT id,email,userId,fullName FROM `calendly` WHERE userId = '" + req.body.userId + "'";
  db.query(usernameQuery, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).json({
        message: 'Internal Server Error.',
        data: err
      });
    }else {
      res.status(200).json({
        message: 'Sign Up Successfully.',
        data: result
      });
    }
  });
});

router.post('/updateCalendarEvent',(req,res,next)=>{
  console.log(req.body);
  let query = "UPDATE `calendly` SET `calanderId` = '" + req.body.calnedarOption + "', `calendarEvent` = '" + req.body.eventType +"' WHERE `calendly`.`email` = '" + req.body.email + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'updated Successfully.',
        data: result
      });
    }
  });
});


router.post('/updateUserProfile',(req,res,next)=>{
  console.log(req.body);
  let query = "UPDATE `calendly` SET `fullName` = '" + req.body.fullName + "', `password` = '" + req.body.password +"' WHERE `calendly`.`email` = '" + req.body.emailID + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).json({
        message: 'Internal Server Error.',
        data: err
      });
    }else {
      res.status(200).json({
        message: 'userId updated Successfully.',
        data: result
      });
    }
  });
});

router.post('/updateUser',(req,res,next)=>{
  console.log(req.body);
  let query = "UPDATE `calendly` SET `userId` = '" + req.body.userId + "', `timeZone` = '" + req.body.timeZone + "' WHERE `calendly`.`email` = '" + req.body.email + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'userId updated Successfully.',
        data: result
      });
    }
  });
});

router.post('/signup',(req,res,next)=>{
  console.log("req.body====",req.body);
  const TOKEN_PATH = './Token/calendar-nodejs-quickstart.json';
  const googleSecrets = JSON.parse(fs.readFileSync('credentials.json')).installed;
  const oauth2Client = new googleAuth.OAuth2Client(
    googleSecrets.client_id,
    googleSecrets.client_secret,
    googleSecrets.redirect_uris[0]
  );
  const token = fs.readFileSync(TOKEN_PATH);
  let tokenObject = JSON.parse(token);
  let refresh_token = tokenObject.refresh_token;
  let access_token = tokenObject.access_token;
  let scope = tokenObject.scope;
  let token_type = tokenObject.token_type;
  let expiry_date = tokenObject.expiry_date;

  let query = "INSERT INTO `calendly` ( email, accessToken, refreshToken, tokenType, scope,expiryDate) VALUES ('"+req.body.email+"', '" + access_token + "', '" + refresh_token + "', '" + token_type + "', '" + scope + "', '" + expiry_date + "')";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'Sign Up Successfully.',
        data: JSON.parse(token)
      });
    }
  });





//console.log("token===========",JSON.parse(token));
 /* const calendar = google.calendar({version: 'v3'});
  console.log("calendar",calendar);*/


  /* oauth2Client.setCredentials(JSON.parse(token));
  const calendar = google.calendar({version: 'v3'});
  calendar.calendarList.list({ auth: oauth2Client }, function(err, resp) {
  let calc = [];
  resp.data.items.forEach(function(cal) {
  // console.log(cal.summary + " - " + cal.id);
  calc.push(cal);
  });
  res.status(500).json({
  message: 'Sign Up.',
  data: token
  });
  });*/
});
router.get('/signup/calendar',(req,res,next)=>{
  const TOKEN_PATH = './Token/calendar-nodejs-quickstart.json';
  const googleSecrets = JSON.parse(fs.readFileSync('credentials.json')).installed;
  const oauth2Client = new googleAuth.OAuth2Client(
    googleSecrets.client_id,
    googleSecrets.client_secret,
    googleSecrets.redirect_uris[0]
  );
  const token = fs.readFileSync(TOKEN_PATH);
//console.log("token===========",JSON.parse(token));
  const calendar = google.calendar({version: 'v3'});
  console.log("calendar",calendar);

  res.status(500).json({
    message: 'Sign Up Successfully.',
    data: JSON.parse(token)
  });
  /* oauth2Client.setCredentials(JSON.parse(token));
  const calendar = google.calendar({version: 'v3'});
  calendar.calendarList.list({ auth: oauth2Client }, function(err, resp) {
  let calc = [];
  resp.data.items.forEach(function(cal) {
  // console.log(cal.summary + " - " + cal.id);
  calc.push(cal);
  });
  res.status(500).json({
  message: 'Sign Up.',
  data: token
  });
  });*/
});



/*router.post('/login',(req,res,next)=>{
  let fetchUser;
  User.findOne({
    email:req.body.email
  }).then(user=>{
    if(!user){

      return res.status(401).json({
        message: 'Auth Faild User does not exists.'
      });
    }
    fetchUser = user;
    return bcrypt.compare(req.body.password,user.password);
  }).then(result => {
    if(!result){

      res.status(401).json({
        message: 'Auth Faild User Password Wrong.'
      });
      return;
    }

    const token = jwt.sign({
      email:fetchUser.email,
      userId: fetchUser._id
    },'secret-code-for-token',{expiresIn: '1h'});

    res.status(200).json({
      userId: fetchUser._id,
      token: token,
      expiresIn: 3600
    })
  }).catch(err =>{
    console.log(err);
  });
});*/

// Get the start time and end time from database
router.post('/gettime',(req,res,next)=>{
  console.log(req.body.email);
  let usernameQuery = "SELECT startTime, endTime, availableDays  FROM `calendly` WHERE email = '" + req.body.email + "'";
  db.query(usernameQuery, (err, result) => {
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      console.log(result);
      res.status(200).json({
        message: 'Time is get successfully!',
        data: result
      });
    }
  });
});

// Get Available day api
router.post('/getAvailableDays',(req,res,next)=>{

  let usernameQuery = "SELECT availableDays,timeZone FROM `calendly` WHERE userId = '"+req.body.userId+"'";
  db.query(usernameQuery, (err, result) => {
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({data: result});
    }
  });
});
// update start and end time by after the sign up

router.post('/updateUserConfiguration',(req,res,next)=>{
  console.log(req.body);
  let query = "UPDATE `calendly` SET `startTime` = '" + req.body.inTime + "', `endTime` = '" + req.body.outTime +"',`availableDays` = '" + req.body.selectedOption+ "' WHERE `calendly`.`userId` = '" + req.body.userId + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'updated Successfully.',
        data: result
      });
    }
  });
});


router.post('/getTimeAvailability',(req,res,next)=>{
  console.log(req.body);
  let query =  "SELECT startTime , endTime , availableDays FROM `calendly` WHERE userId = '" + req.body.userId + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'get time successfully.',
        data: result
      });
    }
  });
});
module.exports = router;
