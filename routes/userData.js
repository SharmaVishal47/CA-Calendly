const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let errror = new Error('invalid mime type');
    if(isValid){
      errror = null;
    }
    cb(errror,'backend/images');
  },
  filename: function (req, file, cb) {
    const name = file.originalname.toLowerCase().split('.').join('-');
    const extension = MIME_TYPE_MAP[file.mimetype];
    const fullFileName = name+'-'+Date.now()+'.'+extension;
    cb(null, fullFileName);
  }
});

const upload = multer({ storage: storage });

router.post('/updateProfile',upload.single('image'),(req,res,next)=>{
  console.log("Body Path================",req.body);
  const url = req.protocol+'://'+req.get('host');
  let imagePath=url +'/images/'+req.file.filename;
  let query = "UPDATE `calendly` SET  `profilePic` = '" + imagePath +"'  WHERE `calendly`.`userId` = '" + req.body.userId + "'";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json({
      message: 'userData update Successfully.',
      data: result
    });
  });
});

router.post('/userData',(req,res,next)=>{
  console.log("UsrID ------------------->", req.body.userId);
  let integrationQuery = "SELECT userId,fullName,welcomeMessage,language,dateFormat,timeFormat,country,timeZone,profilePic FROM `calendly` WHERE userId = '" + req.body.userId + "'";
  db.query(integrationQuery, (err, result) => {
    if (err!==null) {
      console.log('Req',req.body.userID);
      return res.status(500).send(err);
    }else {
      res.status(200).json({
        message: 'userData Get Successfully.',
        data: result
      });
    }
  });
});

router.post('/addUserData',(req,res,next)=>{
  let integrationQuery = "SELECT userId,fullName,welcomeMessage,language,dateFormat,timeFormat ,country,timeZone FROM `calendly` WHERE userId = '" + req.body.userId + "'";
  db.query(integrationQuery, (err, result) => {
    if(result.length>0){
      console.log('Result is greater than 1');
      let query = "UPDATE `calendly` SET `userId` = '" + req.body.userId + "', `fullName` = '" + req.body.name + "', `welcomeMessage` = '" + req.body.welcome +"',`language` = '" + req.body.language+ "',"+"`dateFormat` = '" + req.body.dateFormat+"' ,"+"`timeFormat` = '" + req.body.timeFormat+"' ,"+"`country` = '" + req.body.country+"' ,"+"`timeZone` = '" + req.body.timeZone+"'  WHERE `calendly`.`userId` = '" + req.body.userId + "'";
      db.query(query, (err, result) => {
        console.log("result=====",result);
        console.log("err=====",err);
        if (err!==null) {
          return res.status(500).send(err);
        }else {
          res.status(200).json({
            message: 'setting form Add Successfully.',
            data: result
          });
        }
      });
    }else{
      let query = "INSERT INTO `calendly` ( userId,fullName,welcomeMessage,language,dateFormat,timeFormat,country,timeZone) VALUES ('"+req.body.userId+"', '"+req.body.name+"', '"+req.body.welcome+"','"+req.body.language+"','"+req.body.dateFormat+"', '" + req.body.timeFormat+"' , '" + req.body.country+"' , '" + req.body.timeZone+"')";
      db.query(query, (err, result) => {
        console.log("result=====",result);
        console.log("err=====",err);
        if (err!==null) {
          return res.status(500).send(err);
        } else {
          res.status(200).json({
            message: 'userData Added Successfully.',
            data: result
          });
        }
        // }else {
        //   let query = "UPDATE `calendly` SET  `go2meeting` = '"+true+"' WHERE `calendly`.`userId` = '" + req.body.userId + "'";
        //   db.query(query, (err, result) => {
        //     console.log("result=====",result);
        //     console.log("err=====",err);
        //     if (err!==null) {
        //       return res.status(500).send(err);
        //     }else {
        //       res.status(200).json({
        //         message: 'Go2Meeting Add Successfully.',
        //         data: result
        //       });
        //     }
        //   });
        // }
      });
    }
  });
});

router.post('/deleteProfile',(req,res,next)=>{
  console.log("UsrID ------------------->", req.body.id);
  let deleteUserQuery = 'DELETE FROM calendly WHERE userId = "' + req.body.id + '"';
  //let deleteQuery = "DELETE  FROM  'calendly'  WHERE 'userId' = '" + req.body.id + "'";
  db.query(deleteUserQuery, (err, result) => {
    if (err!==null) {
      console.log('Req',req.body.id);
      return res.status(500).send(err);
    }else {
      let deleteMeetingQuery = 'DELETE FROM calendlymeeting WHERE userId = "' + req.body.id + '"';
      //let deleteQuery = "DELETE  FROM  'calendly'  WHERE 'userId' = '" + req.body.id + "'";
      db.query(deleteMeetingQuery, (err, result) => {
        if (err!==null) {
          console.log('Req',req.body.id);
          return res.status(500).send(err);
        }else {
          let deletegtmQuery = 'DELETE FROM g2meetingintegration WHERE userId = "' + req.body.id + '"';
          //let deleteQuery = "DELETE  FROM  'calendly'  WHERE 'userId' = '" + req.body.id + "'";
          db.query(deletegtmQuery, (err, result) => {
            if (err!==null) {
              console.log('Req',req.body.id);
              return res.status(500).send(err);
            }else {
              res.status(200).json({
                message: 'userData deleted Successfully.',
                data: result
              });
            }
          });
        }
      });
    }
  });
});
//////////////////////////////////


router.post('/updateLink',(req,res,next)=>{

  let query = "UPDATE `calendly` SET `userId` = '" + req.body.userID + "'   WHERE `calendly`.`userId` = '" + req.body.id + "'";
  db.query(query, (err, result) => {
    console.log("result=====",result);
    console.log("err=====",err);
    if (err!==null) {
      return res.status(500).send(err);
    }else {
      let query = "UPDATE `calendlymeeting` SET  `userId`= '" + req.body.userID + "' WHERE `calendlymeeting`.`userId` = '" + req.body.id + "'";
      db.query(query, (err, result) => {
        console.log("result=====",result);
        console.log("err=====",err);
        if (err!==null) {
          return res.status(500).send(err);
        }else {
          let querygtm = "UPDATE `g2meetingintegration` SET  `userId`= '" + req.body.userID + "' WHERE `g2meetingintegration`.`userId` = '" + req.body.id + "'";
          db.query(querygtm, (err, result) => {
            console.log("result=====",result);
            console.log("err=====",err);
            if (err!==null) {
              return res.status(500).send(err);
            }else {
              res.status(200).json({
                message: 'Link updated Successfully.',
                data: result
              });
            }
          });
        }
      });

    }
  });
});


// check the filetype before uploading it
//   if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
//     // upload the file to the /public/assets/img directory
//     uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
//       if (err) {
//         res.status(500).json({
//           message,
//           data: "Invalid mime type"
//         });
//       }
//       // send the player's details to the database
//
//   } else {
//     res.status(500).json({
//       message,
//       data: "Invalid mime type"
//     });
//   }
//
//
//
//
//
//
//
// });

module.exports = router;
