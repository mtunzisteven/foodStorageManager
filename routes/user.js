const express = require('express');

const {check, body} = require('express-validator'); // import check method of express validator sub package

const bcrypt = require('bcryptjs'); // csrf token generating package imported
const isAuth = require('../middleware/is-auth'); // Manage logged in users

const authController = require('../controllers/user');

const User = require('../models/user');

const router = express.Router();

const nameChars = 2;

/**
* @swagger
*  components:
*      schemas:
*          UserSignup:
*              type: object
*              required: 
*                  - email
*                  - password
*              properties:
*                  email:
*                      type: string
*                      description: The users personal email
*                  password:
*                      type: string
*                      description: The user's secret password 
*                  name:
*                      type: string
*                      description: The user's name that thy may be addressed by
*                  familySize:
*                      type: number
*                      description: The number of family members for the user
*                      default: 1
*                  admin:
*                      type: boolean
*                      description: True for admin users and false for the rest
*                      default: false
*/


// The definition of the signup route.

/**
* @swagger
* /user/signup:
*  post:
*      summary: Creates a new user
*      tags:
*           : User signup 
*      description: New users can signup for an account in order to add and update their Food
*      requestBody:
*          required: true
*          content:
*              application/json:
*                  schema:
*                      $ref: '#components/schemas/UserSignup'
*      responses:
*        '200':
*          description: OK
*          content:
*            text/plain:
*              schema:
*                type: string
*
*/

// /signup => POST
router.post(
    '/signup', 
    [    
        body('name', // req.body.familySize value being validated here
            `Name input has less than ${nameChars} characters` // error message displayed
            )
            .isLength({min: nameChars}) // Name must have at least 2 chars
            .isString() // must be a string
            .trim(), // remove whitespace
        check('email')
            .isEmail() 
            .withMessage('Please enter a valid email')
            .custom((emailEntered, {req}) => { // my custom validation check and error message

                // must return User.findOne... in order for the Promise.reject error to be caught in controller
                return User.findOne({email: emailEntered}) // find a user document with email on the right, defined above.
                .then(userDoc => {
                    if(userDoc){
                        return Promise.reject("Email already exists."); // if email exists, we'll reach this part and throw error to get out of custom fn
                    }else{
                        return true;  // if no error, true returned otherwise we'd still end up with error
                    }
                }); // promise returned if no email is fouind in the db matching the one entered.

            }),
        // chaning a second validator for req.body object
        body('password', // req.body.password value being validated here
            'Please make sure password is at least 8 characters long and includes letters and numbers' // error message displayed
            )
            .isLength({min: 8})
            .isAlphanumeric()
            .trim(), // remove whitespace
        // chaining a third validator for req.body object
        body('familySize', // req.body.familySize value being validated here
            'Please make sure Fmily size is a positive number' // error message displayed
            )
            .isNumeric() // must be a number
            .trim() // remove whitespace
    ], 
    authController.postSignup
);

/**
* @swagger
*  components:
*      schemas:
*          UserLogin:
*              type: object
*              required: 
*                  - email
*                  - password
*              properties:
*                  email:
*                      type: string
*                      description: The email that the user will use to log in
*                  password:
*                      type: string
*                      description: The secret password that the user will use to log in
*/

/**
* @swagger
* /user/login:
*  post:
*      summary: User authentication
*      tags:
*           : User login  
*      description: New users can signup for an account in order to add and update their Food
*      requestBody:
*          required: true
*          content:
*              application/json:
*                  schema:
*                      $ref: '#components/schemas/UserLogin'
*      responses:
*        '200':
*          description: OK
*          content:
*            text/plain:
*              schema:
*                type: string
*
*/

// /login => POST
router.post(
    '/login', 
     
    [
        body( // chaning a second validator for req.body object
            'password', // req.body.password value being validated here
            'Invalid email or password.' // error message displayed
            )
            .isLength({min: 8})
            .isAlphanumeric()
            .trim(), // remove white space
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((emailEntered, {req}) => { // my custom validation check and error message

                // must return User.findOne... in order for the Promise.reject error to be caught in controller
                return User.findOne({email: emailEntered}) // find a user document with email on the right, defined above.
                .then(user => {
                    if(!user){

                        return Promise.reject("Invalid email or password."); // don't specify email or password as it hints to hacker

                    }else{

                        return bcrypt
                                .compare(req.body.password, user.password) // compare entered password with mongodb user password using bcrypt
                                .then(passwordsMatch => {
                        
                                    if(passwordsMatch){

                                        return true;  // if no error, true returned otherwise we'd still end up with error

                                    }else{

                                        return Promise.reject("Invalid email or password!");

                                    }
                                });

                    }
                }) // promise returned if no email is fouind in the db matching the one entered.

            })
    ],
    authController.postLogin
);

// /:id => GET  getUser
router.get(
    '/:id', 
    isAuth,
    [
        // chaining a third validator for req.body object
        body('id', // req.body.familySize value being validated here
            'User id not a number!' // error message displayed
            )
            .trim(), // remove whitespace
    ], 
    authController.getUser
);

// /update => PUT
router.put(
    '/:id', 
    isAuth,
    [
        // chaining a third validator for req.body object
        body('familySize', // req.body.familySize value being validated here
            'Please make sure Fmily size is a positive number' // error message displayed
            )
            .isNumeric() // must be a number
            .trim(), // remove whitespace
    ], 
    authController.putUpdate
);


module.exports = router;
