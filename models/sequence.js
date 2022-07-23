const mongoose = require('mongoose');

const sequenceSchema = mongoose.Schema({

    maxUserId: { 
        type: Number, 
        required: true 
    },
    maxProductId: { 
        type: Number,  
        required: true 
    }
}); // Schema is a blueprint : a definition

// Here we actually create the model and export it using the syntax: module.exports
// Sequence can be used as the model now anywhere outside this file with the blueprint defined here.
module.exports = mongoose.model('Sequence', sequenceSchema);