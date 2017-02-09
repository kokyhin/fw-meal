var mongoose             = require('mongoose');
var Schema               = mongoose.Schema;
var pasportLocalMongoose = require('passport-local-mongoose');
var bcrypt               = require('bcrypt-nodejs');

var UsersSchema = new Schema({
  id:         Schema.ObjectId,
  username: { type: String, required: true, unique: true, default: 'Default'},
  // email: { type: String, required: true, unique: true, default: 'Default'},
  password:   {type: String, default: 'Default'},
  orders:   [{
    type: Schema.ObjectId,
    ref: 'orders'
  }],
},
{
  timestamps: true
});

UsersSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UsersSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UsersSchema.plugin(pasportLocalMongoose);

module.exports = mongoose.model('users', UsersSchema);
