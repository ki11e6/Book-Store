const User = require('../models/user');
const bcrypt = require('bcryptjs');
const sendEmail = require('../util/nodemailGmail');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

exports.getLogin = (req, res) => {
  let message = req.flash('login-error');
  if (message.length > 0) {
    message = message[0];
    // console.log('getlogin:', message);
  } else {
    message = null;
    // console.log('getlogin:', message);
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash('signup-error');
  // console.log('getSignup:', message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('login-error', 'email not found');
        // console.log(req.flash('error'));
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('login-error', 'password not match');
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          'signup-error',
          'E-Mail exists already, please pick a different one.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then(() => {
          res.redirect('/login');
          //signup success mail
          let mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: 'Signup Success',
            text: 'Welcome to BookStore',
            html: '<h2>Your have Successfully SignedUp in to BookStore!<h2>',
          };
          return sendEmail(mailOptions, (err) => {
            if (err) {
              console.log('Error:' + err);
            } else {
              console.log('mail sent successfully');
            }
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res) => {
  let message = req.flash('reset-error');
  if (message.length > 0) {
    message = message[0];
    // console.log(message);
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset',
    errorMessage: message,
  });
};

exports.postReset = (req, res) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      req.flash('reset-error', 'Something went wrong!Retry');
      return res.redirect('/reset');
    }
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash('reset-error', 'Email does not exist');
          // console.log(req.flash('error'));
          return res.redirect('/reset');
        }

        const token = buffer.toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36000000;
        return user.save();
      })
      .then((user) => {
        const rlink = `http://localhost:${process.env.PORT}/reset/${user.resetToken}`;
        let mailOptions = {
          from: process.env.FROM_EMAIL,
          to: email,
          subject: 'Password reset',
          // text: 'Welcome to BookStore',
          html: `
        <p>You requested a password reset</p>
        <p>click this <a href=${rlink}>Link</a> to set a new password</p>
        `,
        };
        res.redirect('/');
        return sendEmail(mailOptions, (err) => {
          if (err) {
            console.log('Error:' + err);
          } else {
            console.log('mail sent successfully');
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash('signup-error');
      // console.log('getSignup:', message);
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      // console.log('user:', user);
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      // console.log('hashedpassoed:', hashedPassword);
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      const rlink = `http://localhost:${process.env.PORT}/login`;
      let mailOptions = {
        from: process.env.FROM_EMAIL,
        to: resetUser.email,
        subject: 'Successfully Password reset',
        html: `
        <p>You requested to password reset was successful</p>
        <p>click this <a href=${rlink}>Link</a> to login</p>
        `,
      };
      res.redirect('/login');
      return sendEmail(mailOptions, (err) => {
        if (err) {
          console.log('Error:' + err);
        } else {
          console.log('mail sent successfully');
        }
      });
    })
    .catch((err) => console.log(err));
};
