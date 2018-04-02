var mongoose = require('mongoose');

var PgaPlayerSchema = new mongoose.Schema({
  player_first_name: String,
  player_last_name: String,
  player_id: String,
  player_country: String,
  player_world_rank : Number,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PgaPlayer', PgaPlayerSchema);

