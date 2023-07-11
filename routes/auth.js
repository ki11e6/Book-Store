const express = require('express');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');
// const isAuth = require('../middleware/is-auth');

const router = express.Router();
const mailformat =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value) => {
        if (!mailformat.test(value)) {
          throw new Error('This is not a valid email address');
        }
        return true;
      }),
    body(
      'password',
      'Please enter a password length min 5 and max 16'
    ).isLength({ min: 5, max: 16 }),
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
