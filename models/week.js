var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var week = new Schema({
	id: Schema.ObjectId,
	weekNumber:  String,
	days: Object
});

module.exports = mongoose.model('weeks', week);
