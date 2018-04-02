var mongoose = require('mongoose');

var TeamPlayerSchema = new mongoose.Schema({
  team_user_id: String,
  team_event_id: String,
  team_player_id: String,
  team_player_name: String,
  team_player_position: Number,
  team_player_round: Number,
  team_player_score: Number,
  team_player_rank: Number,
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamPlayer', TeamPlayerSchema);

