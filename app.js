const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const path = require('path');
const errorController = require('./controllers/error');
const User = require('./models/user');
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: 'sessions',
});
const csrfProtection = csrf();
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
//below need to be used after session
//csrf protection againt cross site request forgery
app.use(csrfProtection);
//message middleware
app.use(flash());

//middleware to add local values to view rendering
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

//check user in session and set user as current user
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use('/500', errorController.get500);
app.use(errorController.get404);
//express error handler, next is to recognize it as an error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  // res.redirect('/500');
  console.log(error.message);
  res.status(500).render('500', {
    pageTitle: 'Internal Server Error',
    path: '/500',
  });
});

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log('Connected to mongodb');
    app.listen(PORT, () =>
      console.log(`server listening on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
  });
