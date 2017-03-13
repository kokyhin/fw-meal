var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var order = new Schema({
    id:     Schema.ObjectId,
    dayid:  Number,
    full:   {type: Number, default: 0},
    first:  {type: Number, default: 0},
    second: {type: Number, default: 0},
    total: Number,
    custom: String,
    payed: {type: Boolean, default: false},
    user:   {
        type: Schema.ObjectId,
        ref: 'users'
    }
});

module.exports = mongoose.model('orders', order);
