var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var code = new Schema({
  id:     Schema.ObjectId,
  user:   {
    type: Schema.ObjectId,
    ref: 'users'
  }
});

module.exports = mongoose.model('codes', code);
