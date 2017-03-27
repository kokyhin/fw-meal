var express       = require('express');
var dotenv        = require('dotenv').config();
var path          = require('path');
var bodyParser    = require('body-parser');
var mongoose      = require('mongoose');
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs            = require('fs');
var api           = require('./routes/api');
var schedule      = require('node-schedule');
var Orders        = require('./models/order');
var _             = require('underscore');
var nodemailer    = require('nodemailer');

var app           = express();
var env           = process.env.NODE_ENV || 'development';
var fallback      = require('express-history-api-fallback');

app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

var mongooseOptions = {
  "server": {
    "socketOptions": {
      "autoReconnect": 1,
      "keepAlive": 1000,
      "connectTimeoutMS": 30000
    }
  }
};

mongoose.connect('mongodb://localhost/fw-meal', mongooseOptions);

//SESSION
var session       = require('express-session');
var MongoStore    = require('connect-mongo')(session);

app.use(session({
    secret: 'FW meal',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      db: 'fw-meal',
      url: 'mongodb://localhost/fw-meal',
      ttl: 12 * 60 * 60,
      mongoOptions: {
        "autoReconnect": 1,
        "keepAlive": 1000,
        "connectTimeoutMS": 30000
      }
    }),
    cookie: {
      httpOnly: false
    }
}));

// // load all files in models folder
fs.readdirSync(__dirname + '/models').forEach(function(fileName) {
   require(__dirname + '/models/' + fileName);
});

// app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var User = require('./models/user');

// allows password reset to work
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  });
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// //AUTHENTIFICATION
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', api);

var staticDir = 'build/bundled';
if (process.env.NODE_ENV === 'development') {
  staticDir = __dirname;
}

app.use(express.static(staticDir));
console.log('static Dir:', staticDir);
app.use(fallback('index.html', { root: staticDir }));

/// catch 404 and forward to error handler

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { error: 'Not found: ' + req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

var ruleEvening = new schedule.RecurrenceRule();
ruleEvening.dayOfWeek = [0, new schedule.Range(1, 5)];
ruleEvening.hour = 17;
ruleEvening.minute = 0;

var sendEvening = schedule.scheduleJob(ruleEvening, function(){
  var d = new Date();
  var dayid = d.getDate() +1 + '' + d.getMonth() + '' + d.getFullYear();
  generateOrders(dayid)
});

var ruleMorning = new schedule.RecurrenceRule();
ruleMorning.dayOfWeek = [0, new schedule.Range(1, 5)];
ruleMorning.hour = 9;
ruleMorning.minute = 0;

var sendMorning = schedule.scheduleJob(ruleMorning, function(){
  var d = new Date();
  var dayid = d.getDate() + '' + d.getMonth() + '' + d.getFullYear();
  generateOrders(dayid)
});

function generateOrders(id) {
  Orders.find({'dayid': id}, (err, orders) => {
    if(err) {return res.status(400).send({error: err.message});}
    var total = {
      user: {
        username: 'Итого'
      },
      full: 0,
      first: 0,
      second: 0,
      total: 0
    }
    _.each(orders, function(order) {
      order.total =
        order.full * process.env.PRICE_FULL +
        order.first * process.env.PRICE_FIRST +
        order.second * process.env.PRICE_SECOND;
      total.total = total.total + order.total;
      total.full = total.full + order.full;
      total.second = total.second + order.second;
      total.first = total.first + order.first;
    });
    var plainText = '';

    if (total.full > 0) {
      plainText += total.full + ' полных \n';
    }
    if (total.first > 0) {
      plainText += total.first + ' первых \n';
    }
    if (total.second > 0) {
      plainText += total.second + ' вторых \n';
    }
    sendLetter(plainText)
  });
}

function sendLetter(text) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_ACC,
      pass: process.env.MAIL_PASS
    }
  });

  var mailOptions = {
    from: '"FusionWorks Meal 🍔" <meal@fusionworks.md>',
    to: 'srusev@fusionworks.md',
    subject: 'Заказы',
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
  });
}

module.exports = app;
