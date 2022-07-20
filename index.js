const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
require('dotenv').config(); // import config values

const PORT = process.env.PORT;
const DB_URL = process.env.MONGODB_URL;

const pantryRoutes = require('./routes/pantry');
const userRoutes = require('./routes/user'); // authentication routes

const app = express();
app.use(bodyParser.json()); // application/json

// more elegant way to handle all errors
app.use((error, req, res, next)=>{
  
    const status = error.statusCode || 500;
    const message = error.message;
  
    res.status(status).json({message:message}); // return the error to the user
  
});

// set Headers for the API access
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/pantry', pantryRoutes);
app.use('/user', userRoutes); // use authentication routes

// establish a connection to the mongo database
mongoose.connect('mongodb://localhost:27017/foodstorage',
   { useNewUrlParser: true }, (err, res) => { 
      if (err) {
         console.log('Connection failed: ' + err);
      }
      else {
         console.log('Connected to database!');
      }
   }
);

app.listen(PORT, () => {
    console.info(`API running smoothly ${PORT}`);
})