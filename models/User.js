var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  user_name: String,
  user_email: String,
  user_team_name: String,
  user_password: String,
  user_event_id: String,
  user_status: String,
  user_role: { type: String, default: 'user' },
  user_balance: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);

