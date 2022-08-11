const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config(); // import config values

const User = require('../models/user');
const sequenceGenerator = require('./sequenceGenerator');

const SECRET = process.env.SECRET;


exports.postLogin = (req, res, next) => {

    let errors = validationResult(req); // get all erros stored by check in this request

    if(!errors.isEmpty()){
        return res.status(422).json({
            message:errors.array()[0].msg
        });
    }

    console.log(req.body.email);

    const email = req.body.email;

    User.findOne({email: email})
        .then(user=> {

            if(!user){ // give error a status code if it is not found 

                const error = new Error('User with this email was not found')

                error.statusCode = 401;

                throw error;

            } // cannot throw error inside a promise, therefore we send catch block
           
            // if password was correct, we continue and sign token
            const token = jwt.sign(
                {
                    email: user.email,
                    userId: user._id.toString()
                }, 
                SECRET, // 'secret | developer generated string to sign token'
                {expiresIn:'1h'}
            ); 

            // This response(res.json()) returns a json format response to the request
            // This response(res.status(201).json()) includes status code to assist request understand outcome since they must decide what view to dispay
            res.status(200).json({
                token:token, // frontend must receive & store this as long as the user is logged in
                user: user,
                _tokenExpirationDate: new Date(new Date().getTime() + 1*60*60*1000)
            });        })
        .catch(err =>{

            if(!err.statusCode){ // give error a status code if it is not found 

                err.statusCode = 500;

            } // cannot throw error inside a promise, therefore we send it to next middleware

            next(err); // go to next middleware with err as an argument passed to it.
        });
};

exports.getUser = (req, res, next) => {

    let errors = validationResult(req); // get all erros stored by check in this request

    if(!errors.isEmpty()){
        return res.status(422).json({
            message:errors.array()[0].msg
        });
    }

    User.findOne({id: req.params.id})
        .then(user=> {

            if(!user){ // give error a status code if it is not found 

                const error = new Error('User was not found')

                error.statusCode = 401;

                throw error;

            } // cannot throw error inside a promise, therefore we send catch block

            // This response(res.json()) returns a json format response to the request
            // This response(res.status(201).json()) includes status code to assist request understand outcome since they must decide what view to dispay
            res.status(201).json({user: user});

        })
        .catch(err =>{

            if(!err.statusCode){ // give error a status code if it is not found 

                err.statusCode = 500;

            } // cannot throw error inside a promise, therefore we send it to next middleware

            next(err); // go to next middleware with err as an argument passed to it.
        });
};

exports.putUpdate = (req, res, next) => {

    let errors = validationResult(req); // get all erros stored by check in this request

    if(!errors.isEmpty()){
        return res.status(500).json({
            message:errors.array()[0].msg
        });
    }

    const familySize = req.body.familySize;
    
    const id = req.params.id;

    User.updateOne({id: id},{$set:{familySize: familySize}})
    .then(result =>{
        res.status(201).json({
            massage: 'User updated successfully!',
            status: true
        })
    })
    .catch(err => {
        res(500).json({
            message: err.massage
        });
    })
};

exports.postSignup = (req, res, next) => {

    let errors = validationResult(req); // get all erros stored by check in this request

    if(!errors.isEmpty()){
        return res.status(422).json({
            message:errors.array()[0].msg
        });
    }

    // get the next id for the new user being added
    const maxUserId = sequenceGenerator.nextId("users");

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const familySize = req.body.familySize;
    const id = maxUserId;

    bcrypt.hash(password, 12) // hash password with salt of 12 characters included
    .then(hashedPassword=>{

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword, // password to supply to user is hashed
            familySize: familySize,
            id: id
        })
    
        return user.save();
    })
    .then(result=>{
        res.status(201).json({
                message:'User Created successfully!',
                status: true
            })
    })
    .catch(err=>{
        if(!err.statusCode){ // give error a status code if it is not found 

            err.statusCode = 500;

        } // cannot throw error inside a promise, therefore we send it to next middleware

        next(err); // go to next middleware with err as an argument passed to it.
    })

};
  
