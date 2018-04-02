var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
  team_user_id: String,
  team_event_id: String,
  team_player_id: String,
  team_player_name: String,
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Team', TeamSchema);

