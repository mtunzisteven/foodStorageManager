const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create a product schema to let mongoose know how data will look(data definition)
const productSchema = new Schema({

    id: {
      type: String,
      required: true
    },    
    name: {
      type: String,
      required: true
    },
    servings: {
      type: String,
      required: true
    },
    addedDate: {
      type: Number,
      required: true
    },
    expiryDate: {
      type: Number,
      required: true
    },
    creator: { // User who created this product referenced
      type: Schema.Types.ObjectId,  // call schema to describe id type of mongoDb
      ref: 'User', // referes to mongodb id in User model | relation : not used when docs embedded
      required: true
    }
});

// Product arg is a name we give to our exported schema | Caps first letter
// this same name is used to create a collection in db | Product creates products, Cat creates cats
module.exports = mongoose.model('Product', productSchema); // this export connects the model with the schema