var passport = require('passport');
var User     = require('../models/user');
var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');

// var nodemailer = require('nodemailer');
// var bcrypt = require('bcrypt-nodejs');
// var async = require('async');
// var crypto = require('crypto');

router.route('/register').post(function(req,res,next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (user) {
      return res.sendStatus(410);
    }
    User.register(new User({
      username: req.body.name,
      // email: req.body.email,
      password: req.body.password,
    }), req.body.password, function (err) {
      if (err) {
        return res.status(400).send({error: err.message});
      }
      res.send({result: "ok"});
    });
  });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  User.findOne({'_id': req.user._id}, function(err, user) {
    if (err) {
      return res.status(400).send({error: err.message});
    }
    res.send(user);
  });
});

router.all('/user', function(req, res) {
  if (req.isAuthenticated() && req.user) {
    User.findOne({'_id': req.user._id}, function(err, user) {
      if(err){return res.status(400).send({error: err.message});}
      res.send(user);
    });
  } else {
    res.status(401).send({error: 'Unauthorized'});
  }
});

router.all('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// router.get('/forgot-password', function(req, res) {
//   res.render('forgot', {
//     user: req.user
//   });
// });

// router.post('/forgot-password', function(req, res, next) {
//   async.waterfall([
//     function(done) {
//       crypto.randomBytes(20, function(err, buf) {
//         var token = buf.toString('hex');
//         done(err, token);
//       });
//     },
//     function(token, done) {
//       User.findOne({ email: req.body.email }, function(err, user) {
//         if (!user) {
//           logger.error("Forget Password Error: Email: " + req.body.email + "could not be found.");
//           return res.sendStatus(401);
//         }

//         user.resetPasswordToken = token;
//         user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

//         user.save(function(err) {
//           logger.info("Forget Password Success: User: " + user.username + "found");
//           done(err, token, user);
//         });
//       });
//     },
//     function(token, user, done) {
//       var smtpTransport = nodemailer.createTransport('SMTP', {
//         service: 'SendGrid',
//         auth: {
//           user: 'mmurgia',
//           pass: 'ms3password123'
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: 'passwordreset@ms3-inc.com',
//         subject: 'RAML Builder Password Reset',
//         text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account. If you did not request this, please ignore this email and your password will remain unchanged.\n\n' +
//           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//           'Username: ' + user.username + '\n\n' +
//           'http://' + req.headers.host + '/resetpassword/' + token
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         if(err){
//             logger.error(err);
//         }
//         done(err, 'done');
//       });
//     }
//   ], function(err) {
//     if (err) return next(err);
//     res.redirect('/');
//   });
// });

// router.get('/reset/:token', function(req, res) {
//   User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
//     if (!user) {
//       return res.redirect('/');
//     }
//     res.render('reset', {
//       user: req.user
//     });
//   });
// });

// router.post('/reset/:token', function(req, res) {
//   async.waterfall([
//     function(done) {
//       User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
//         if (!user) {
//           logger.error("Password reset fail: " + req.params.token + "not found");
//           return res.sendStatus(401);
//         }

//         user.password = req.body.password;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;

//         user.save(function(err) {
//           logger.info("Password Reset Success: " + user.username);
//           done(err, user);
//         });
//       });
//     },
//     function(user, done) {
//       var smtpTransport = nodemailer.createTransport('SMTP', {
//         service: process.env.MAIL_SERVICE,
//         auth: {
//           user: process.env.MAIL_USER,
//           pass: process.env.MAIL_PASSWORD
//         }
//       });

//       var mailOptions = {
//         to: user.email,
//         from: 'passwordreset@ms3-inc.com',
//         subject: 'Your RAML Builder password has been changed',
//         text: 'Hello,\n\n' +
//           'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function(err) {
//         done(err);
//       });
//     }
//   ], function(err) {
//     res.redirect('/');
//   });
// });

module.exports = router;
