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

router.get('/get-week', function(req, res) {
  function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
  var day = getMonday(new Date());
  var week = [
    {
      name: 'Пн',
      day: day.getDate(),
      active: false,
      price: {
        full: process.env.PRICE_FULL,
        first: process.env.PRICE_FIRST,
        second: process.env.PRICE_SECOND
      }
    },
    {
      name: 'Вт',
      day: day.getDate() + 1,
      active: false,
      price: {
        full: process.env.PRICE_FULL,
        first: process.env.PRICE_FIRST,
        second: process.env.PRICE_SECOND
      }
    },
    {
      name: 'Ср',
      day: day.getDate() + 2,
      active: false,
      price: {
        full: process.env.PRICE_FULL,
        first: process.env.PRICE_FIRST,
        second: process.env.PRICE_SECOND
      }
    },
    {
      name: 'Чт',
      day: day.getDate() + 3,
      active: false,
      price: {
        full: process.env.PRICE_FULL,
        first: process.env.PRICE_FIRST,
        second: process.env.PRICE_SECOND
      }
    },
    {
      name: 'Пт',
      day: day.getDate() + 4,
      active: false,
      price: {
        full: process.env.PRICE_FULL,
        first: process.env.PRICE_FIRST,
        second: process.env.PRICE_SECOND
      }
    }
  ]
  var curDay = new Date().getDate();
  week.forEach(function (item){
    if (item.day == curDay) {
      item.active = true
    }
  })
  res.send({week});
});

module.exports = router;
