var mongoose = require('mongoose');
var UserEvent = require('./UserEvent');

var UserSchema = new mongoose.Schema({
  user_name: String,
  user_full_name: String,
  user_email: String,
  user_team_name: String,
  user_password: String,
  user_status: { type: String, default: 'imported'} ,
  user_role: { type: String, default: 'user' },
  user_balance: { type: Number, default: 0 },
  event: {type: mongoose.Schema.Types.ObjectId, ref: 'UserEvent' },
  updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('User', UserSchema);

