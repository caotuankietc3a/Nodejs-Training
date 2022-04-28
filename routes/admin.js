// const path = require('path');
const express = require('express');
const {checkAddProduct} = require('../middleware/auth');

const adminController = require('../controllers/admin');
const {isAuth} = require('../middleware/auth');

const router = express.Router();


// /admin
router.get('/products', isAuth, adminController.getProducts);

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', isAuth, checkAddProduct(), adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', isAuth, checkAddProduct(), adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
