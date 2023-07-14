const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const productValidator = require('../middleware/product-validation');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  isAuth,
  productValidator,
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  isAuth,
  productValidator,
  adminController.postEditProduct
);

// router.post('/delete-product', isAuth, adminController.postDeleteProduct);
//using client side js for delete product
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
