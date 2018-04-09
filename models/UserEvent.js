var mongoose = require('mongoose');

var UserEventSchema = new mongoose.Schema({
  event_id: String,
  user_id: String,
  user_balance: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserEvent', UserEventSchema);

