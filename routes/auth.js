const express = require('express');

const {check, body} = require('express-validator'); // import check method of express validator sub package

const bcrypt = require('bcryptjs'); // csrf token generating package imported

const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

// /login => GET
router.get('/login', authController.getLogin);

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

                        return Promise.reject("Invalid email or password...");

                    }else{

                        return bcrypt
                                .compare(req.body.password, user.password) // compare entered password with mongodb user password using bcrypt
                                .then(passwordsMatch => {
                        
                                    if(passwordsMatch){

                                        req.session.isLoggedIn = true; // stores isLoggedIn session variable in mongo db
                                        req.session.user = user; // stores user session variable in mongo db

                                        return true;  // if no error, true returned otherwise we'd still end up with error

                                    }else{

                                        return Promise.reject("Invalid email or password!");

                                    }
                                });

                    }
                }) // promise returned if no email is fouind in the db matching the one entered.

            })
            .normalizeEmail() // make all letters lowercase
    ],
    authController.postLogin
    );

// /logout => POST
router.post('/logout', authController.postLogout); 

// /signup => GET
router.get('/signup', authController.getSignup);

// /signup => POST
router.post(
    '/signup', 
    [
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
        // chaning a third validator for req.body object
        body('confirmPassword').custom((confirmPasswordEntered, {req}) => { // my custom validation check and error message
                if(confirmPasswordEntered != req.body.password){
                    throw new Error("Passwords do not match!"); // throw returns message
                }
                return true; // if no error, true returned
        })
        .trim() // remove whitespace
    ], 
    authController.postSignup
);

// /reset => GET
router.get('/reset', authController.getReset);

// /reset => POST
router.post(
    '/reset', 
    [
        check('email')
            .isEmail()
            .normalizeEmail() // make all letters lowercase and remove special characters
        // chaning a second validator for req.body object, authController.postReset);
    ], 
    authController.postReset
);

// /new-password => GET
router.get('/reset/:token', authController.getNewPassword);

// /new-password => POST
router.post(
    '/new-password',    
    [
    body('password', // req.body.password value being validated here
        'Please make sure password is at least 8 characters long and only includes letters and numbers' // error message displayed
        )
        .isLength({min: 8})
        .isAlphanumeric()
        .trim() // remove whitespace
    ], 
    authController.postNewPassword
);

module.exports = router;
