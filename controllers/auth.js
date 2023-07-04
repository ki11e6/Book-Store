exports.getLogin = (req, res, next) => {
  let isLoggedIn;
  console.log(req.get('Cookie'));
  if (!req.get('Cookie')) {
    isLoggedIn = false;
  } else {
    isLoggedIn = req.get('Cookie').trim().split('=')[1];
    console.log(isLoggedIn);
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  res.setHeader('Set-Cookie', 'loggedIn=true');
  res.redirect('/');
};
