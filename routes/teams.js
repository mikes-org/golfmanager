var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var util = require( 'util' );
var Team = require('../models/Team.js');
var TeamPlayer = require('../models/TeamPlayer.js');
var UserEvent = require('../models/UserEvent.js');

/* GET ALL TEAMS */
router.get('/', function(req, res, next) {
  Team.find(function (err, products) {
    if (err) return next(err);
    res.json(products);
  });
});

/* GET SINGLE USERS TEAM */
router.get('/:team_user_id/:team_event_id', async function(req, res, next) {
	
  console.log("Getting Team:" + req.params.team_user_id + " Event:"+ req.params.team_event_id);
  
  let userEvent = await UserEvent.findOne({user_id: req.params.team_user_id, event_id: req.params.team_event_id});
  if (userEvent == null)
  {
	  return {status: "ERROR", message: 'User event not found'};
  }
  
  console.log("Getting Team:" + userEvent._id + " Event:"+ req.params.team_event_id);
  let data = await Team.find({team_user_id: userEvent._id ,team_event_id: req.params.team_event_id}).exec();

  var retVal = {roster:[],playerRounds:[[{},{},{},{}],[{},{},{},{}],[{},{},{},{}],[{},{},{},{}]]};
  console.log("Team:" + util.inspect(data));
  data.forEach(teamPlayer =>
  {
		console.log("PLAYER")
	    retVal.roster.push(teamPlayer);
  });
  //console.log("TeamPlayer:" +  util.inspect(retVal));
  
  let data2 = await TeamPlayer.find({team_user_id: userEvent._id ,team_event_id: req.params.team_event_id}).exec();

  console.log("TeamPlayers:" + util.inspect(data2));
  console.log("Rounds:" + util.inspect(retVal.playerRounds));
  data2.forEach(teamPlayer =>
  {
		console.log("PLAYER:" + util.inspect(teamPlayer));
	    retVal.playerRounds[teamPlayer.team_player_round-1][teamPlayer.team_player_position] = teamPlayer;
  });
  console.log("TeamPlayer:" +  util.inspect(retVal));
  
  
  res.json(retVal);

});


/* GET SINGLE TEAM BY ID */
router.get('/:id', function(req, res, next) {
  Team.findById(req.params.id, function (err, post) {
    var retVal = {round1:[], round2: [], round3: [], round4: []};
    console.log("Team:" + util.inspect(post));
    post.forEach(teamPlayer => 
    {
    });
    if (err) return next(err);
    console.log("TeamPlayer:" +  util.inspect(retVal));
    res.json(retVal);
  });
});

/* SAVE TEAM */
router.post('/', function(req, res, next) {
  Team.create(req.body.round1, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE TEAM */
router.post('/replace', async function(req, res, next) {
  console.log('Replacing Team:' + util.inspect(req.body));

  var userId = req.body.user_id;
  var eventId = req.body.event_id;
  var newTeam = JSON.parse(req.body.team);
  console.log('Deleting Old Team');
  await Team.find({ team_user_id: userId, team_event_id : eventId }).exec().then((teamdata) => {
    console.log("Team" + util.inspect(teamdata));
    if (teamdata.length > 0)
    {
	console.log("DELETE");
        Team.remove({ team_user_id: userId, team_event_id : eventId }).exec().then((data) => {
	   console.log("Removed:" + data);
	}, err => { console.log("ERROR REMOVE:" + err)
	});
	    	
    }
  }, err => {
    console.log("Error:" + err)
	 }
  );
  
  teamPlayerDel = await TeamPlayer.remove({ team_user_id: userId, team_event_id : eventId }).exec();
  
  console.log("Team Delete Done" + teamPlayerDel);
  
  newTeam.roster.forEach( t => { 
    console.log("Adding:" + util.inspect(t));	  
    Team.create(t, function (err, post) {
      if (err) return next(err);
    });
  });
  
  for (i=1;i<=4;i++)
  {
	  for (pos=0;pos<4;pos++)
	  {
		  teamPlayer = newTeam.playerRounds[i-1][pos];
		  console.log("TP:" + util.inspect(teamPlayer));
		  TeamPlayer.create(teamPlayer)
	  }
	  
  }
  

  console.log("Replace Done");
  res.json({status: "OK", message: "Team saved"});
});


/* UPDATE TEAM */
router.put('/:id', function(req, res, next) {
  Team.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE TEAM */
router.delete('/:id', function(req, res, next) {
  Team.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
