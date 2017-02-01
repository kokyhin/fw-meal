var express       = require('express');
var dotenv        = require('dotenv').config();
var path          = require('path');
var bodyParser    = require('body-parser');
var mongoose      = require('mongoose');
// var passport      = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
var fs            = require('fs');
var api           = require('./routes/api');

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
    secret: 'ms3 raml generator',
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

// var User = require('./models/users');

// // allows password reset to work
// passport.use(new LocalStrategy(function(username, password, done) {
//   console.log('password was requested by user:', username);
//   User.findOne({ username: username }, function(err, user) {
//     if (err) return done(err);
//     if (!user) return done(null, false, { message: 'Incorrect username.' });
//     user.comparePassword(password, function(err, isMatch) {
//       if (isMatch) {
//         return done(null, user);
//       } else {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//     });
//   });
// }));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// //AUTHENTIFICATION
// app.use(passport.initialize());
// app.use(passport.session());
app.use('/api', api);

var staticDir = 'app/build/bundled';
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

module.exports = app;
