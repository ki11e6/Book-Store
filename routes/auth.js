const express = require('express');
const signupValidator = require('../middleware/signup-validation');
const loginValidator = require('../middleware/login-validation');
const authController = require('../controllers/auth');
// const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', loginValidator, authController.postLogin);

router.post('/signup', signupValidator, authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
