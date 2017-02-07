var express = require('express');
var router = express.Router();

var auth = require('./auth');
var order = require('./order')

setHeader = function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

router.use('/auth', setHeader,  auth);
router.use('/order', setHeader, order);

module.exports = router;
