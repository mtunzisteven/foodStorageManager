const express = require('express');

const {check, body} = require('express-validator'); // import check method of express validator sub package

const bcrypt = require('bcryptjs'); // csrf token generating package imported
const isAuth = require('../middleware/is-auth'); // Manage logged in users

const authController = require('../controllers/user');

const User = require('../models/user');

const router = express.Router();

// /login => POST
router.post(
    '/login', 
     
    [
        body( // chaning a second validator for req.body object
            'password', // req.body.password value being validated here
            'Please make sure password is at least 8 characters long and includes letters and numbers' // error message displayed
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

                        return Promise.reject("Invalid email. Email not foumd.");

                    }else{

                        return bcrypt
                                .compare(req.body.password, user.password) // compare entered password with mongodb user password using bcrypt
                                .then(passwordsMatch => {
                        
                                    if(passwordsMatch){

                                        return true;  // if no error, true returned otherwise we'd still end up with error

                                    }else{

                                        return Promise.reject("Invalid password!");

                                    }
                                });

                    }
                }) // promise returned if no email is fouind in the db matching the one entered.

            })
            .normalizeEmail() // make all letters lowercase
    ],
    authController.postLogin
);

// /signup => POST
router.post(
    '/signup', 
    [    
        body('name', // req.body.familySize value being validated here
            'Please make sure You added your name' // error message displayed
            )
            .isLength({min: 2}) // Name must have at least 2 chars
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

            })
            .normalizeEmail(), // make all letters lowercase and remove special characters
        // chaning a second validator for req.body object
        body('password', // req.body.password value being validated here
            'Please make sure password is at least 8 characters long and includes letters and numbers' // error message displayed
            )
            .isLength({min: 8})
            .isAlphanumeric()
            .trim(), // remove whitespace
        // chaning a third validator for req.body object
        body('confirmPassword').custom((confirmPasswordEntered, {req}) => { // my custom validation check and error message
                if(confirmPasswordEntered != req.body.password){
                    throw new Error("Passwords do not match!"); // throw returns message
                }
                return true; // if no error, true returned
        })
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

// /update => PATCH
router.patch(
    '/update', 
    isAuth,
    [
        body('name', // req.body.familySize value being validated here
            'Please make sure You added your name' // error message displayed
            )
            .isLength({min: 2}) // Name must have at least 2 chars
            .isString() // must be a string
            .trim(), // remove whitespace
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((emailEntered, {req}) => { // my custom validation check and error message

                // if(emailEntered === 'mtunzisteven@gmail.com'){
                //     throw new Error("I dont't like this email."); // throw returns message
                // }
                // return true; // if no error, true returned

                // must return User.findOne... in order for the Promise.reject error to be caught in controller
                return User.findOne({email: emailEntered}) // find a user document with email on the right, defined above.
                .then(userDoc => {
                    if(userDoc){
                        return Promise.reject("Email already exists."); // if email exists, we'll reach this part and throw error to get out of custom fn
                    }else{
                        return true;  // if no error, true returned otherwise we'd still end up with error
                    }
                }); // promise returned if no email is fouind in the db matching the one entered.

            })
            .normalizeEmail(), // make all letters lowercase and remove special characters
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
            .trim(), // remove whitespace
    ], 
    authController.patchUpdate
);


module.exports = router;
