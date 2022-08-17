const express = require('express');
const mongoose = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc'); // Swagger docs
const swaggerUI = require('swagger-ui-express'); // Swagger UI 
const bodyParser = require('body-parser');
require('dotenv').config(); // import config values

const PORT = process.env.PORT;
const DB_URL = process.env.MONGODB_URL;
const URL = process.env.URL;

const pantryRoutes = require('./routes/pantry');
const userRoutes = require('./routes/user'); // authentication routes

// Swagger const options
const options = {
   definition: {
       openapi: '3.0.0.',
       info: {
           title: 'The food storage API',
           version: '1.0.0',
           description: 'A food storage API built with Node.JS and MongoDB'
       },
       servers: [
           {
               url: 'http://localhost:3000/' // The web url for the api
           }
       ],
       components: { // this token is added to specify securitySchema
         securitySchemes: { // type http as opposed to type apiKey doesn't require adding "Bear " infront of token
           bearerAuth: {
               type: "http",
               scheme: "bearer",
           },
         },
       },
       security: [ // this part goes with the preceding components obj
         {
           bearerAuth: [],
         },
       ],
   },
   apis: ['./routes/*.js'] // api routes shown in Swagger UI are all js files inside routes folder
 }
 
 
// Swagger docs creation
const swaggerSpec = swaggerJsdoc(options);


// define express app | express used to manage middlewares
const app = express();

// Swagger UI setup | the url route specified is where UI will be displayed
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerSpec));
 
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

app.use('/products', pantryRoutes); 
app.use('/user', userRoutes); // use authentication routes 

// establish a connection to the mongo database
mongoose.connect(DB_URL,
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