const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log("token========",token);
    const decodedToken = jwt.verify(token,'secret-code-for-token');
    req.userData = {
      userId: decodedToken.userId
    };
    next();
  }catch (e) {
    res.status(401).json({
      message:'Auth Faild(No/Invalid Token)',
      data: []
    });
  }
};
