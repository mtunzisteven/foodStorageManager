const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');  // import Heroku options manager
const session = require('express-session');
const sessionDBStorage = require('connect-mongodb-session')(session); // session constant passed to a function stored in sessionDBstorage
const csrf = require('csurf'); // import csrf token manager 
const flash = require('connect-flash'); // import session flash message manager 
const multer = require('multer'); // file upload download package for non-Windows computers
const { v4: uuidv4 } = require('uuid'); // file upload download package for Windows computers
require('dotenv').config(); // import config values

const errorController = require('./controllers/errors');

// MongoDB URL
const MONGODB_URL = process.env.MONGODB_URL; 

// used in password reset link
const APP_URL = process.env.PASSWORD_RESET_URL || 'http://localhost:3000';

// server port           
const PORT = process.env.PORT || 3000;

const app = express(); 

// initialize session storage
// store used to store sessions in the db 
// using constructor fn returned to sessionDBStorage constant above
const store = new sessionDBStorage({
  uri: MONGODB_URL, // the url to the db connection
  collection: 'sessions' // the collection created to store sessions in the db
});

const csrfProtection = csrf(); // using the token as default, through token

// set ejs and views folder
app.set('view engine', 'ejs');
app.set('views', 'views');

// fetch all routes and assign them to constants
const adminRoutes = require('./routes/admin'); 
const shopRoutes = require('./routes/pantry');
const authRoutes = require('./routes/auth'); 

// get the user model into scope
const User = require('./models/user');


// file upload middleware | storage key to be used in multer
const fileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'images'); // define destination folder, if none, new one created
  },
  filename: function(req, file, cb) {
      cb(null, uuidv4()+'-'+file.originalname) // uuidv4 gives unique name | file.originalname preserves the file extension
  } // create unique alphanumeric file name
});

// check if file upload is the correct image(mime) type
const fileFilter = (req, res, cb) =>{
  if(file.mimetype == jpg || file.mimetype == png || file.mimetype == jpeg ){

    cb(null, true);
 
  }else{

    cb(null, false);

  }
};

// using multer to upload images
app.use(multer({
  storage: fileStorage, // 1st element of the object arg of multer() is storage location of file(defined above)
  file: fileFilter,     // 2nd element of the object arg of multer() is file filtration info(defined above)
  })
  .single('image') // specifies that we'll input a single image and 'image' points to the input name
);

// serve images statically : if path has '/images' serve it as if it is on root to public
app.use('/images', express.static(path.join(__dirname, 'images')));

// bring public folder into scope
app.use(express.static(path.join(__dirname, 'public')));


// initialize body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// setup session storage middle ware(storage in the database)
// secret: used for signing the hash that secretly saves the id in a cookie. the value must be a long string in production
// resave: set to false to make sure session is not saved with every request, but on every change
// saveUninitialized: set to false ensures no session is saved on every request(e.g: nothing changed)
app.use(
  session({ 
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false,  
    store: store  // session db storage const defined above
  })
);

app.use(csrfProtection); // register csrf token after session creation code

app.use(flash()); // register flash token after session creation code

// // find the user in the db
// // if found, we proceed to set user object into each request on the app.
app.use((req, res, next) => {
  if(!req.session.user){
    return next(); // skip code below this if statement in this middleware when user not logged in
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

// middleware to add all enclosed values to views using special express fn: res.locals
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn; // login confirmation using session variable: isLoggedIn

  if(res.locals.isAuthenticated){
    res.locals.admin = req.user.admin; // define the user level in order to reveal or hide admin functionalities
  }

  res.locals.csrfToken = req.csrfToken(); // csrf token provided by csurf package allows only pages with valid token to use site
  next();
});

// get routes into scope for use in app
app.use('/admin', adminRoutes);
app.use(shopRoutes); 
app.use(authRoutes);

// error controller has no route, so is used directly from controller
app.use(errorController.get404); 

const corsOptions = {
  origin: APP_URL,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false, 
  family: 4
};


// mongoose will give us the connection. No need for mongoConnect
mongoose
  .connect(
    MONGODB_URL, 
    options
    ) //connected to shop db in firstcluster21 of db user mtunzi with specified password.
  .then(result => {
    // start server at localhost:3000
    app.listen(PORT);
  })
  .catch(err => { 
    console.log(err);
  })