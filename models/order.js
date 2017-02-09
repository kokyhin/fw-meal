var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var order = new Schema({
    id:     Schema.ObjectId,
    dayid:  Number,
    full:   Number,
    first:  Number,
    second: Number
});

module.exports = mongoose.model('orders', order);
