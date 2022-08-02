const { validationResult } = require('express-validator');

const Product = require('../models/product'); // get the model and in there, the post schema
const sequenceGenerator = require('./sequenceGenerator');

exports.getProducts = (req, res, next) => {

    Product.find({creator:req.userId}) // get products by the specific user, not ones created by another user(for total products count)
        .then(products=>{

            console.log(products); 

            // end the sherade if there is no posts found
            if(!products){
                return;
            }

            res.status(200).json({
                message: 'Fetched products successfully', 
                products:products
            });

        })
        .catch(err=>{

            if(!err.statusCode){ // give error a status code if it is not found 

                err.statusCode = 500;

            } // cannot throw error inside a promise, therefore we send it to next middleware

            next(err); // go to next middleware with err as an argument passed to it.
        })
};

exports.getProduct = (req, res, next) => {

    const productId = req.params.id;

    Post.findById(productId)
    .then(product =>{
        
        if(!product){
            const error = new Error('Could not find product!');

            error.statusCode = 404;

            throw error; // will send us to catch block
        }

        // This response(res.json()) returns a json format response to the request
        // This response(res.status(200).json()) includes status code to assist request understand outcome since they must decide what view to dispay
        res.status(200).json({
            message: 'Product retrieved successfully',
            product: product
        })

    })
    .catch(err =>{

        if(!err.statusCode){ // give error a status code if it is not found 

            err.statusCode = 500;

        } // cannot throw error inside a promise, therefore we send it to next middleware

        next(err); // go to next middleware with err as an argument passed to it.
    });

};

exports.createProduct = (req, res, next) => {

    const errors = validationResult(req); // fetch all errors caught by express-validator in router

    if(!errors.isEmpty()){ // errors is not empty

        const error = new Error("Validation Failed: Entered product data is incorrect!");

        error.statusCode = 422; 

        throw error;
    }

    // get the next id for the new user being added
    const maxProductId = sequenceGenerator.nextId("products");

    const name = req.body.name;
    const amount = req.body.amount;
    const servings = req.body.servings;
    const addedDate = Date.now();
    const expiryDate = req.body.expiryDate;

    const product = new Product({
        id: maxProductId,
        name:name, 
        amount:amount, 
        servings:servings,        
        addedDate:addedDate,
        expiryDate:expiryDate,
        creator: req.userId // req.userId defined at authentication of user
    });

    product.save() // store product in db
        .then(result => {

            // This response(res.json()) returns a json format response to the request
            // this product would be stored in the db
            res.status(201).json({
                message:'Product created subbessfully!',
                product: product
            });
        })
        .catch(err =>{

            if(!err.statusCode){ // give error a status code if it is not found 

                err.statusCode = 500;

            } // cannot throw error inside a promise, therefore we send it to next middleware

            next(err); // go to next middleware with err as an argument passed to it.
        });
};

exports.updateProduct = (req, res, next) => {

    const errors = validationResult(req); // fetch all errors caught by express-validator in router

    if(!errors.isEmpty()){ // errors is not empty

        const error = new Error("Validation Failed: Entered data is incorrect!");

        error.statusCode = 422;

        throw error;
    }
    
    const productId = req.params.id;
    const amount = req.body.amount;
    const name = req.body.name;
    const servings = req.body.servings;
    const expiryDate = req.body.expiryDate;

    Product.findById(productId)
    .then(product =>{

        // Check if product was found
        if(!product){
            const error = new Error('Could not find post!');

            error.statusCode = 404;

            throw error; // will send us to catch block
        }

        // check if the user trying to update the product is the logged in user
        if(post.creator.toString() !== req.userId){
            const error = new Error('Cannot edit product created by another user');

            error.statusCode = 403;

            throw error; // will send us to catch block
        }

        // update product details
        product.name = name;
        product.amount = amount;
        product.servings = servings;
        product.expiryDate = expiryDate;

        return product.save(); // save to db

    })
    .then(result=>{
        res.status(200)
            .json({
                massage:"Product updated successfully"
            });
    })
    .catch(err =>{

        if(!err.statusCode){ // give error a status code if it is not found 

            err.statusCode = 500;

        } // cannot throw error inside a promise, therefore we send it to next middleware

        next(err); // go to next middleware with err as an argument passed to it.
    });
};

exports.deleteProduct = (req, res, next) => {

    const productId = req.params.id;

    Product.findById(productId)
    .then(product=>{

        if(!product){
            const error = new Error('Could not find product!');

            error.statusCode = 404;

            throw error; // will send us to catch block
        }

        
        // check if the user trying to update the product is the logged in user
        if(product.creator.toString() !== req.userId){
            const error = new Error('Cannot delete product created by another user');

            error.statusCode = 403;

            throw error; // will send us to catch block
        }

        // delete post
        return Product.findByIdAndRemove(productId);
    })
    .then(result=>{
        res.status(200).json({massage:"Product deleted successfully"});
    })
    .catch(err =>{

        if(!err.statusCode){ // give error a status code if it is not found 

            err.statusCode = 500;

        } // cannot throw error inside a promise, therefore we send it to next middleware

        next(err); // go to next middleware with err as an argument passed to it.
    });

}
