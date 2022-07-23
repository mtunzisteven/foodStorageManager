const jwt = require('jsonwebtoken');
require('dotenv').config(); // import config values

const SECRET = process.env.SECRET;

module.exports = (req, res, next) => {

    // auth header sent by the frontend and includes 'bearer token' formated string | on each req :
    //
    //         headers:{
    //              Authorization: 'Bearer '+token 
    //         }
    //
    // frontend receives it from login response 200 json
    const authHeader = req.get('Authorization'); 
    
    if(!authHeader){
        const error = new Error('Not Authenticated[No authHeader]: Error!');
        error.statusCode = 401;

        throw error;
    }

    const token = authHeader.split(' ')[1]; // split into array at the space and use 2nd element

    if(!token){
        return res.status(200).json({
            message:'Please Log in'
        })
    }

    let decodedToken;

    try{
        decodedToken = jwt.verify(token, SECRET); // same secret created in login middleware of auth controller

    } catch(err){
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken){ // token decoding error | came up false
        const error = new Error('Not Authenticated: Error!');
        error.statusCode = 401;
        throw error;
    }

    console.log(decodedToken);

    req.userId = decodedToken.userId;
    next();
};