var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
  event_name: String,
  event_code: String,
  event_tourn_id: String,
  event_year: String,
  event_status: String,
  event_start_date: Date,
  event_end_date: Date,
  event_owner: String,
  event_cost: Number,
  event_type: String,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);

