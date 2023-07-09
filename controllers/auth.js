const User = require('../models/user');
const bcrypt = require('bcryptjs');
const sendEmail = require('../util/nodemailGmail');
const crypto = require('crypto');

exports.getLogin = (req, res) => {
  let message = req.flash('login-error');
  if (message.length > 0) {
    message = message[0];
    console.log('getlogin:', message);
  } else {
    message = null;
    console.log('getlogin:', message);
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash('signup-error');
  console.log('getSignup:', message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('login-error', 'Invalid email or password.');
        console.log(req.flash('error'));
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
          req.flash('login-error', 'Invalid email or password.');
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
  // const confirmPassword = req.body.confirmPassword;
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
            html: '<h2>Your have Successfully Signed in to BookStore!<h2>',
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
    console.log(message);
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
  let token;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('reset-error', 'Email does not exist');
        console.log(req.flash('error'));
        return res.redirect('/reset');
      }
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log(err);
          req.flash('reset-error', 'Something went wrong!Retry');
          return res.redirect('/reset');
        }
        token = buffer.toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36000000;
        user.save();
      });
      return user;
    })
    .then((user) => {
      const rlink = `https://localhost:3000/reset/${user.resetToken}`;
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
};
