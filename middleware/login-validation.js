const { check, body } = require('express-validator');
const mailformat =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

module.exports = [
  check('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value) => {
      console.log('validation middleware');
      if (!mailformat.test(value)) {
        throw new Error('This is not a valid email address');
      }
      return true;
    })
    .normalizeEmail(),
  body('password', 'Please enter a password length min 5 and max 16')
    .isLength({
      min: 5,
      max: 16,
    })
    .trim(),
];
