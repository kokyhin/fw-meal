var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');
var Week = require('../models/week');
var Orders = require('../models/order')
var _ = require('underscore');

ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(401).send({error: err.message});
  }
};

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

router.get('/get-orders', ensureAuthenticated, function(req, res){
  var curWeek = new Date().getWeek() + '' +  new Date().getFullYear();
  Week.findOne({'weekNumber': curWeek}, (err, week) =>{
    if(err) {return res.status(400).send({error: err.message});}
    var response = {
      active: new Date().getDay() -1,
      days: week.days
    }
    return res.send(response);
  })
});


router.post('/get-orders-day', ensureAuthenticated, function(req, res){
  var id = req.body.day;
  Orders.find({'dayid': req.body.day}).populate('user').exec((err, orders) => {
    if(err) {return res.status(400).send({error: err.message});}
    var obj = {
      calc: []
    }
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
    })
    orders.push(total);
    obj.orders = orders;
    return res.send(obj);
  });
});

router.get('/get-week', ensureAuthenticated, function(req, res) {
  var curWeek = new Date().getWeek() + '' +  new Date().getFullYear();
  Week.findOne({'weekNumber': curWeek}, (err, week) =>{
    if(err) {return res.status(400).send({error: err.message});}
    if (week) {
      mongoose.model('users').findOne({'_id': req.user._id}).populate('orders').exec((err, user) =>{
        if(err) {return res.status(400).send({error: err.message});}
        var curDay = new Date().getDate();
        week.days.forEach(function (item){
          if (item.day == curDay) {
            item.active = true
          }
        });
        week.days.forEach(function(day) {
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
        return res.send(week);
      });
    } else {
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
      var newWeek = [
        {
          name: 'Пн',
          day: day.getDate(),
          active: false,
          dayid: Number(day.getDate() + '' + day.getMonth() + '' + day.getFullYear()),
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
          dayid: Number(day.getDate() + 1 + '' + day.getMonth() + '' + day.getFullYear()),
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
          dayid: Number(day.getDate() + 2 + '' + day.getMonth() + '' + day.getFullYear()),
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
          dayid: Number(day.getDate() + 3 + '' + day.getMonth() + '' + day.getFullYear()),
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
          dayid: Number(day.getDate() + 4 + '' + day.getMonth() + '' + day.getFullYear()),
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
      var weekSchema = {
        weekNumber: curWeek,
        days: newWeek
      }
      Week.create(weekSchema, (err, createdWeek) => {
        if(err) {return res.status(400).send({error: err.message});}
        return res.send(createdWeek);
      });

    }
  });
});

router.post('/create', ensureAuthenticated, function(req, res) {
  mongoose.model('orders').create(req.body, function(err, order) {
    if(err) {return res.status(400).send({error: err.message});}
    mongoose.model('users').findOne({'_id': req.user._id}, function(err, user){
      if(err) {return res.status(400).send({error: err.message});}
      user.orders.push(order);
      user.save();
      order.user = req.user._id;
      order.save();
      res.send('Order saved')
    })
  })
});

module.exports = router;
