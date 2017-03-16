var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');
var Week = require('../models/week');
var moment = require('moment');
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
  var curWeek;
  var activeDay = new Date().getDay() -1;
  var date = new Date();
  if ((date.getDay() == 5 && date.getHours() > 13) || date.getDay() > 5) {
    curWeek = date.getWeek() + 1 + '' +  date.getFullYear();
    activeDay = 0;
  } else {
    curWeek = date.getWeek() + '' +  date.getFullYear();
  }

  Week.findOne({'weekNumber': curWeek}, (err, week) =>{
    if(err) {return res.status(400).send({error: err.message});}
    if(week == null) {return res.status(400).send({error: 'Missing week'});}
    var response = {
      active: activeDay,
      days: week.days
    }
    return res.send(response);
  })
});

router.post('/get-orders-day', ensureAuthenticated, function(req, res){
  var id = req.body.day;
  Orders.find({'dayid': req.body.day}).populate('user').exec((err, orders) => {
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
    orders.push(total);
    return res.send(orders);
  });
});

function getWeek () {
  var date = new Date();
  if ((date.getDay() == 5 && date.getHours() > 13) || date.getDay() > 5) {
    return date.getWeek() + 1 + '' +  date.getFullYear();
  } else {
    return date.getWeek() + '' +  date.getFullYear();
  }
}

router.get('/get-week', ensureAuthenticated, function(req, res) {
  var curWeek = getWeek();
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
        var date = moment();
        week.days.forEach(function(day) {
          var id = Number(day.dayid);
          var isDisabled = false;
          if (date.date() == (day.day - 1) && date.hour() >= 15) {
            isDisabled = true
          } else if (date.date() > day.day) {
            isDisabled = true;
            day.disabled = true
          }
          for(var i=0; i<user.orders.length; i++) {
            if(user.orders[i].dayid == id) {
              day.second = user.orders[i].second;
              day.first = user.orders[i].first;
              day.full = user.orders[i].full;
              day.disabled = isDisabled;
            }
          }
        }, this);
        return res.send(week);
      });
    } else {
      var nextWeek = false;
      function dayCalc (i) {
        if (nextWeek) {
          return moment().add(1, 'weeks').day(0).add(i, 'days').date()
        }
        return moment().day(0).add(i, 'days').date()
      }
      var day = moment();
      if ((day.day() == 5 && day.hour() > 13) || day.day() > 5 ) {
        nextWeek = true;
      }
      var newWeek = [
        {
          name: 'Пн',
          day: dayCalc(1),
          active: false,
          dayid: Number(dayCalc(1) + '' + day.month() + '' + day.year()),
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
          day: dayCalc(2),
          active: false,
          dayid: Number(dayCalc(2) + '' + day.month() + '' + day.year()),
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
          day: dayCalc(3),
          active: false,
          dayid: Number(dayCalc(3) + '' + day.month() + '' + day.year()),
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
          day: dayCalc(4),
          active: false,
          dayid: Number(dayCalc(4) + '' + day.month() + '' + day.year()),
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
          day: dayCalc(5),
          active: false,
          dayid: Number(dayCalc(5) + '' + day.month() + '' + day.year()),
          first: 0,
          second: 0,
          full: 0,
          custom: 'default',
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
  var date = moment();
  var orderDay = Number(req.body.dayid.toString().substring(0,2));
  if(date.date() == orderDay && date.hour() >= 10) {
    return res.status(400).send({error: 'Sorry, you are to late'});
  }
  Orders.findOneAndUpdate({'dayid': req.body.dayid, 'user': req.user._id}, req.body, {upsert: false}, function(err, order) {
    if(err) {return res.status(400).send({error: err.message});}
    if (err == null & order == null) {
      var isValid = false
      for(var key in req.body) {
        if(key == 'dayid' ) continue;
        if (req.body[key] && Number(req.body[key]) > 0) {
          isValid = true
        }
      }
      if (!isValid) {return res.status(400).send({error: 'Fill order please'})}
      Orders.create(req.body, function(err, order) {
        if(err) {return res.status(400).send({error: err.message});}
        mongoose.model('users').findOne({'_id': req.user._id}, function(err, user){
          if(err) {return res.status(400).send({error: err.message});}
          user.orders.push(order);
          user.save();
          order.user = req.user._id;
          order.save();
          return res.send('Order saved');
        })
      })
    } else {
      return res.send('Order updated');
    }
  });
});

router.post('/update-order', ensureAuthenticated, function(req, res){

  Orders.findOneAndUpdate({'_id': req.body.id}, {payed: req.body.payed}, {upsert: false}, function(err, order){
    if(err) {return res.status(400).send({error: err.message});}
    return res.send('Updated');
  });
});

module.exports = router;
