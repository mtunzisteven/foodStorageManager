var Sequence = require('../models/sequence');

var maxUserId;
var maxProductId;
var sequenceId = null;


// query's db and finds the sequence document
function SequenceGenerator() {

  Sequence.findOne()
    .exec(function(err, sequence) {
      if (err) {
        err.status = 500;
        err.message = 'An error occurred';
        return err;
      }

      // assign db values to local corresponding vars
      sequenceId = sequence._id;
      maxUserId = sequence.maxUserId;
      maxProductId = sequence.maxProductId;

    });
}

// check which collection we're working with and then increment
// the max id for the corresponding collection's id in the  
// sequences collection
SequenceGenerator.prototype.nextId = function(collectionType) {

  var updateObject = {};
  var nextId;

  // collection checking logic and id incrementing 
  switch (collectionType) {
    case 'users':
      maxUserId++;
      updateObject = {maxUserId: maxUserId};
      nextId = maxUserId;
      break;
    case 'products':
        maxProductId++;
      updateObject = {maxProductId: maxProductId};
      nextId = maxProductId;
      break;
    default:
      return -1;
  }

  // update the value in the sequence collection
  Sequence.update({_id: sequenceId}, {$set: updateObject},
    function(err) {
      if (err) {
        console.log("nextId error = " + err);
        return null
      }
    });

  // return the id which will be assigned to the newly created document in:
  // documents, messages, or contacts collection
  return nextId;
}

module.exports = new SequenceGenerator();
