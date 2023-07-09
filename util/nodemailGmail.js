const nodemailer = require('nodemailer');

const sentEmail = (mailOptions, callback) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });

  // let mailOptions = {
  //   from: process.env.FROM_EMAIL,
  //   to: email,
  //   subject: 'Signup Success',
  //   text: 'Welcome to BookStore',
  //   html: '<h2>Your have Successfully Signed in to BookStore!<h2>',
  // };

  transporter.sendMail(mailOptions, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

module.exports = sentEmail;
