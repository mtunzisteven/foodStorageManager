const express = require('express');
const { body } = require('express-validator');
const Product = require('../models/product'); // get the model and in there, the post schema


const pantryController = require('../controllers/pantry');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

/**
* @swagger
*  components:
*      schemas:
*          Product:
*              type: object
*              required: 
*                  - productId
*              parameters:
*                  productId:
*                      type: string
*                      description: Product id.
*/

/**
* @swagger
* /products:
*  get:
*      summary: Fetch all products in storage
*      tags:
*             : Get products
*      description: Fetch all the food in user's storage.
*      responses:
*        '200':
*          description: OK
*          content:
*            text/plain:
*              schema:
*                type: string
*
*/


//GET /products
router.get(
    '/', 
    isAuth, 
    pantryController.getProducts
);

/**
* @swagger
*  components:
*      schemas:
*          addProduct:
*              type: object
*              required: 
*                  - name
*                  - amount
*                  - servings
*                  - addedDate
*                  - expiryDate
*                  - creator
*              properties:
*                  name:
*                      type: string
*                      description: The email that the user will use to log in
*                  amount:
*                      type: string
*                      description: The secret password that the user will use to log in
*                  servings:
*                      type: number
*                      description: The email that the user will use to log in
*                  addedDate:
*                      type: number
*                      description: The secret password that the user will use to log in
*                  expiryDate:
*                      type: number
*                      description: The email that the user will use to log in
*                  creator:
*                      type: string
*                      description: The secret password that the user will use to log in
*/

/**
* @swagger
* /products:
*  post:
*      summary: Creates a new product
*      tags:
*           : Add a new product
*      description: New storage product added to the users pantry(Food storage).
*      requestBody:
*          required: true
*          content:
*              application/json:
*                  schema:
*                      $ref: '#components/schemas/addProduct'
*      responses:
*        '200':
*          description: OK
*          content:
*            text/plain:
*              schema:
*                type: string
*
*/

//POST /products
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

//PUT /products/:productId
router.put(
    '/:productId',   
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
    pantryController.updateProduct
);


//DELETE /products/:productId
router.delete(
    '/:productId', 
    isAuth,
    pantryController.deleteProduct
);

module.exports = router;