var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var order = new Schema({
    id:     Schema.ObjectId,
    dayid:  Number,
    full:   {type: Number, default: 0},
    first:  {type: Number, default: 0},
    second: {type: Number, default: 0}
});

module.exports = mongoose.model('orders', order);
