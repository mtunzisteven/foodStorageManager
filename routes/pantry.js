const express = require('express');
const { body } = require('express-validator');
const Product = require('../models/product'); // get the model and in there, the post schema


const pantryController = require('../controllers/pantry');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

//GET /pantry
router.get(
    '/', 
    isAuth, 
    pantryController.getProducts
);

//POST /pantry
router.post(
    '/', 
    isAuth,
    [ // validation middleware uses {check} above
        body('name')
            .trim()
            .isLength({min:2}),
        body('servings')
            .isLength({min:1})
            .isNumeric(),
        body('expiryDate')
            .isLength({min:1})
            .isNumeric()
    ],
    pantryController.createProduct
);

//DELETE /pantry/:productId
router.delete(
    '/:productId',  
    isAuth,
    pantryController.deleteProduct
    );

//PUT /pantry:productId
router.put(
    '/:productId',   
    isAuth,  
    [ // validation middleware uses {check} above
        body('name')
            .trim()
            .isLength({min:2}),
        body('servings')
            .trim()
            .isLength({min:1})
            .isNumeric(),
        body('expiryDate')
            .trim()
            .isLength({min:1})
            .isNumeric()
    ],
    pantryController.updateProduct
);


//DELETE /pantry/:productId
router.delete(
    '/:productId', 
    isAuth,
    pantryController.deleteProduct
);

module.exports = router;