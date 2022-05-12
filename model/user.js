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
    admin: {
      type: Boolean,
      default: false
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: { // When the store portion is intergrated, this code will be useful.
        items: [
            {
                product: {type: Schema.Types.ObjectId, ref: 'Product', required: true}, // call schema to describe id type of mongoDb in User model | relation : not used when docs embedded
                quantity: {type: Number, required: true}
            }
        ]
    }
});

// methods key allows us to add our own methods to defined user schema : userSchema
// has to be written as bellow so that 'this' keyword still refers to schema
userSchema.methods.addToCart = function(product){

    const cartProductIndex = this.cart.items.findIndex(cp => { // this.cart still refers to the one defined in the userSchema
      // returns cart item index if product beong added already exists in the cart
      // returns -1 if the product does not exist
      // productId is how we save product ids in data base | cp.'product' is from 'ref: Product' above
      return cp.product.toString() === product._id.toString(); 
    });

    let newQuantity = 1; // clicking add to cart adds one item
    const updatedCartItems = [...this.cart.items];  // created a new ref array we can edit without editing cart array

    if(cartProductIndex >= 0){ 

      let newCartQuantity = this.cart.items[cartProductIndex].quantity + newQuantity;  // increment cart product qty
      updatedCartItems[cartProductIndex].quantity = newCartQuantity;  // add the incremented qty to ref cart array

    }else{ // or just add the cart item into cart ref array

      updatedCartItems.push({
        product: product._id, // 'product' is from 'ref: Product' above
        quantity: newQuantity
      });

    }

    const updatedCart = {
      items: updatedCartItems
    } // adding new cart id and new product qty to cart 

    this.cart = updatedCart;

    return this.save();
}

// methods key allows us to add our own methods to defined user schema : userSchema
// has to be written as bellow so that 'this' keyword still refers to schema
userSchema.methods.deleteCartItem = function(productId){

    const updatedCartItems = this.cart.items.filter(item => {
      return item.product.toString() !== productId.toString(); // item.'product' is from 'ref: Product' above
    });

    this.cart.items = updatedCartItems;
    return this.save();

}

// methods key allows us to add our own methods to defined user schema : userSchema
// has to be written as bellow so that 'this' keyword still refers to schema
userSchema.methods.clearCart = function(product){

    this.cart = {items:[]}; //empty cart

    return this.save(); // save empty cart
}

// User arg is a name we give to our exported schema | Caps first letter
// this same name is used to create a collection in db | User creates products, Cat creates cats
module.exports = mongoose.model('User', userSchema); // this export connects the model with the schema
