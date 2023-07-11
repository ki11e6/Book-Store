const { body } = require('express-validator');

module.exports = [
  body('title', 'Enter valid title with atleast ')
    .isString()
    .isLength({ min: 3 })
    .trim(),
  body('imageUrl', 'Enter valid image Url').isURL(),
  body('price', 'Enter valid numbers').isFloat(),
  body('description', 'Description should be atleast length 10')
    .isString()
    .isLength({
      min: 10,
      max: 400,
    })
    .trim(),
];
