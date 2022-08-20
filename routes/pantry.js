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
*          '200': 
*              description: 
*                  Fetched products successfully
*          '401': 
*              description: 
*                  Not Authenticated!
*          '4XX': 
*              description: 
*                  Error fetching products!
*          '5XX': 
*              description: 
*                  Server Error!
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
*                      description: The name of the product 
*                  amount:
*                      type: string
*                      description: The volume of the product
*                  servings:
*                      type: number
*                      description: The number of servings the product has
*                  addedDate:
*                      type: number
*                      description: The date when the product was created
*                  expiryDate:
*                      type: number
*                      description: The date when the product will expire
*                  creator:
*                      type: string
*                      description: The id of the user who created the product
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
*          '201': 
*              description: 
*                  Product created successfully!
*          '401': 
*              description: 
*                  Not Authenticated!
*          '422': 
*              description: 
*                  Validation Failed. Entered product data is incorrect!
*          '5XX': 
*              description: 
*                  Server Error!
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


/**
* @swagger
* /products/{productId}:
*  put:
*      parameters:
*         - in: path
*           name: id
*           required: true
*           schema:
*             type: integer
*           style: simple
*           explode: true
*      summary: Update a existing product
*      tags:
*           : Update an existing product
*      description: New storage product added to the users pantry(Food storage).
*      requestBody:
*          required: true
*          content:
*              application/json:
*                  schema:
*                      $ref: '#components/schemas/addProduct'
*      responses:
*          '200': 
*              description: 
*                  Product created successfully!
*          '422': 
*              description: 
*                  Validation Failed. Entered product data is incorrect!
*          '401': 
*              description: 
*                  Not Authenticated!
*          '403': 
*              description: 
*                  Cannot edit product created by another user
*          '404': 
*              description: 
*                  Could not find Product!
*          '5XX': 
*              description: 
*                  Server Error!
*/

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

/**
* @swagger
* /products/{productId}:
*  delete:
*      parameters:
*         - in: path
*           name: id
*           required: true
*           schema:
*             type: integer
*           style: simple
*           explode: true
*      summary: Delete a product from the products list
*      tags:
*           : Delete a product
*      description: New storage product added to the users pantry(Food storage).
*      responses:
*          '200': 
*              description: 
*                  Product deleted successfully!
*          '422': 
*              description: 
*                  Validation Failed. Entered product data is incorrect!
*          '401': 
*              description: 
*                  Not Authenticated!
*          '403': 
*              description: 
*                  Cannot delete product created by another user
*          '404': 
*              description: 
*                  Could not find Product!
*          '5XX': 
*              description: 
*                  Server Error!
*/

//DELETE /products/:productId
router.delete(
    '/:productId', 
    isAuth,
    pantryController.deleteProduct
);

module.exports = router;