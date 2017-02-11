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

router.post('/create', ensureAuthenticated, function(req, res) {
  mongoose.model('orders').create(req.body, function(err, order) {
    if(err) {return res.status(400).send({error: err.message});}
    mongoose.model('users').findOne({'_id': req.user._id}, function(err, user){
      if(err) {return res.status(400).send({error: err.message});}
      user.orders.push(order);
      user.save();
      res.send('Order saved')
    })
  })
});

router.get('/get-week', ensureAuthenticated, function(req, res) {
  mongoose.model('users').findOne({'_id': req.user._id}).populate('orders').exec((err, user) =>{
    if(err) {return res.status(400).send({error: err.message});}
    function getMonday(d) {
      d = new Date(d);
      if(d.getDay() == 5 && d.getHours() > 13) {
        d.setDate(d.getDate() + 3);
        var day = d.getDay(),
            diff = d.getDate() - day + 1;
        return new Date(d.setDate(diff));
      } else if (d.getDay() > 5) {
        d.setDate(d.getDate() + 3);
        var day = d.getDay(),
            diff = d.getDate() - day + 1;
        return new Date(d.setDate(diff));
      } else {
        var day = d.getDay(),
            diff = d.getDate() - day + 1; // adjust when day is sunday
        return new Date(d.setDate(diff));
      }
    }
    var day = getMonday(new Date());
    var week = [
      {
        name: 'Пн',
        day: day.getDate(),
        active: false,
        dayid: day.getDate() + '' + day.getMonth() + '' + day.getFullYear(),
        first: 0,
        second: 0,
        full: 0,
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
        dayid: day.getDate() + 1 + '' + day.getMonth() + '' + day.getFullYear(),
        first: 0,
        second: 0,
        full: 0,
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
        dayid: day.getDate() + 2 + '' + day.getMonth() + '' + day.getFullYear(),
        first: 0,
        second: 0,
        full: 0,
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
        dayid: day.getDate() + 3 + '' + day.getMonth() + '' + day.getFullYear(),
        first: 0,
        second: 0,
        full: 0,
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
        dayid: day.getDate() + 4 + '' + day.getMonth() + '' + day.getFullYear(),
        first: 0,
        second: 0,
        full: 0,
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
    });

    week.forEach(function(day) {
      var id = Number(day.dayid);
      for(var i=0; i<user.orders.length; i++) {
        if(user.orders[i].dayid == id) {
          day.second = user.orders[i].second;
          day.first = user.orders[i].first;
          day.full = user.orders[i].full;
          day.disabled = true
        }
      }
    }, this);
    res.send(week);
  });
});

module.exports = router;
