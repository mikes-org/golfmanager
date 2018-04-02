var mongoose = require('mongoose');

var ScoreSchema = new mongoose.Schema({
  player_id: String,
  event_id: String,
  total_to_par: Number,
  total_strokes: Number,
  total_position: Number,
  round_1_total : Number,
  round_1_to_par: Number,
  round_1_position: Number,
  round_2_total : Number,
  round_2_to_par: Number,
  round_2_position: Number,
  round_3_total : Number,
  round_3_to_par: Number,
  round_3_position: Number,
  round_4_total : Number,
  round_4_to_par: Number,
  round_4_position: Number,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Score', ScoreSchema);

