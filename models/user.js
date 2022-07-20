const mongoose = require('mongoose'); // import mongoose
const Schema = mongoose.Schema; // store schema 

const userSchema = new Schema({

    id: {
        type: String,
        required: true
    },    
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    familySize: {
      type: Number,
      default: false
    },
    admin: {
      type: Boolean,
      default: false
    }
});


// User arg is a name we give to our exported schema | Caps first letter
// this same name is used to create a collection in db | User creates products, Cat creates cats
module.exports = mongoose.model('User', userSchema); // this export connects the model with the schema
