var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  user_name: String,
  user_email: String,
  user_team_name: String,
  user_password: String,
  user_event_id: String,
  user_status: String,
  user_role: String,
  user_balance: Number,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);

