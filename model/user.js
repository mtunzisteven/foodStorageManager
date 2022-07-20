const mongoose = require('mongoose'); // import mongoose
const Schema = mongoose.Schema; // store schema 

const userSchema = new Schema({

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
    },
    pantry: { // When the store portion is intergrated, this code will be useful.
        items: [
            {
                product: {type: Schema.Types.ObjectId, ref: 'Product', required: true}, // call schema to describe id type of mongoDb in User model | relation : not used when docs embedded
                quantity: {type: Number, required: true}
            }
        ]
    }
});


// User arg is a name we give to our exported schema | Caps first letter
// this same name is used to create a collection in db | User creates products, Cat creates cats
module.exports = mongoose.model('User', userSchema); // this export connects the model with the schema
