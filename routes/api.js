var express = require('express');
var router = express.Router();

// var users         = require('./user');
var auth          = require('./auth');
// var projects      = require('./project');
// var governance    = require('./governance');

setHeader = function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

// router.use('/users', setHeader, users);
router.use('/auth', setHeader,  auth);
// router.use('/project', setHeader, projects);
// router.use('/governance', setHeader, governance);

module.exports = router;
