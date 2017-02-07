var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');

ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(401).send({error: err.message});
  }
};

router.get('/get-week', ensureAuthenticated, function(req, res) {
  function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
  var day = getMonday(new Date());
  var week = [
    {name: 'Пн', day: day.getDate()},
    {name: 'Вт', day: day.getDate() + 1},
    {name: 'Ср', day: day.getDate() + 2},
    {name: 'Чт', day: day.getDate() + 3},
    {name: 'Пт', day: day.getDate() + 4}
  ]
  res.send({week});
});

module.exports = router;
