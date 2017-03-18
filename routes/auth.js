var passport = require('passport');
var User     = require('../models/user');
var Codes    = require('../models/codes')
var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');

// var nodemailer = require('nodemailer');
// var bcrypt = require('bcrypt-nodejs');
// var async = require('async');
// var crypto = require('crypto');

router.route('/register').post(function(req,res,next) {
  let mail = req.body.email;
  let isValidEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(mail);
  let isCorporativeEmail = function(mail) {
    let mailParts = mail.split('@');
    return mailParts[1] == 'fusionworks.md';
  }
  if(!isValidEmail || !isCorporativeEmail(mail)) {
    return res.status(400).send({error: 'Invalid email, use corporative Email'});
  }

  User.findOne({email: mail}, function(err, user) {
    if (user) {return res.status(400).send({error: 'User already registered'});}
    User.register(new User({
      username: mail.split('@')[0],
      email: mail,
      password: req.body.password,
    }), req.body.password, function (err, newUser) {
      if (err) {
        return res.status(400).send({error: err.message});
      }
      Codes.create({user: newUser}, function(err, code) {
        if (err) {
          return res.status(400).send({error: err.message});
        }
        let activationURL = process.env.APP_URL + '?activation=' + code._id;
        // Send email activation
        res.send({result: "ok"});
      });
    });
  });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  User.findOne({'_id': req.user._id}, function(err, user) {
    if (err) {
      return res.status(400).send({error: err.message});
    }
    if(!user.active) {
      if (!req.body.code.length) {
        return res.status(400).send({error: 'Please follow link that you received in email'});
      }
      Codes.findOne({'_id': req.body.code}, function(err, code){
        if(!code) {
          return res.status(400).send({error: 'Wrond code activation'});
        }
        if (err) {
          return res.status(400).send({error: err.message});
        }
        User.findOne({'_id': code.user}, function(err, userCode) {
          if (err) {
            return res.status(400).send({error: err.message});
          }
          code.remove();
          userCode.active = true;
          userCode.save(function(err){
            if (err) {
              return res.status(400).send({error: err.message});
            }
            return res.send(userCode);
          });
        });
      });
    } else {
      res.send(user);
    }
  });
});

router.all('/user', function(req, res) {
  if (req.isAuthenticated() && req.user) {
    User.findOne({'_id': req.user._id}, function(err, user) {
      if(err){return res.status(400).send({error: err.message});}
      if(!user.active) {
        req.logout();
        return res.status(401).send({error: 'Unactivated'});
      }
      res.send(user);
    });
  } else {
    res.status(403).send({error: 'Unauthorized'});
  }
});

router.all('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
