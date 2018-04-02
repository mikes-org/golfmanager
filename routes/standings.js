var express = require('express');
var router = express.Router();
var util = require('util');
var User = require('../models/User.js');
var Event = require('../models/Event.js');
var Team = require('../models/Team.js');
var TeamPlayer = require('../models/TeamPlayer.js');
var Score = require('../models/Score.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  var userData = req.session['userdata'];
  console.log("Session:" + util.inspect(userData));
  if (userData) 
  {
    res.render('standings', { title: 'Event Standings', user_id: userData.user_id , event_id: userData.event_id, user_name : userData.user_name });
  }
  else
  {
    res.render('index', { title: '2018 Masters', message: 'Sign in for access'});
  }
});

async function getEvent(event_id)
{
	console.log("Event finding for:" + event_id);
	let eventData  = await Event.find({ _id: event_id}).exec();
    if (eventData.length > 0)
    {
    	console.log("Event Data" + eventData);
    	return eventData[0];
    }
    return null;
}

async function getPlayerScore(event_id, player_id)
{
	console.log("Score finding for:" + event_id + "," + player_id);
	playerScoreData  = await Score.find({player_id: player_id, event_id: event_id}).exec();
	let retScore = {round:[{},{},{},{}], total:{}}
	console.log("Got Score" + playerScoreData);
    if (playerScoreData.length > 0)
    {
    	console.log("Setting score for" + player_id);
    	
    	
    	retScore.round[0].score = playerScoreData[0].round_1_to_par;
    	retScore.round[0].position = playerScoreData[0].round_1_position;
    	retScore.round[1].score = playerScoreData[0].round_1_to_par;
    	retScore.round[1].position = playerScoreData[0].round_1_position;
    	retScore.round[2].score = playerScoreData[0].round_1_to_par;
    	retScore.round[2].position = playerScoreData[0].round_1_position;
    	retScore.round[3].score = playerScoreData[0].round_1_to_par;
    	retScore.round[3].position = playerScoreData[0].round_1_position;
    	retScore.total.score = playerScoreData[0].total_to_par;
    	retScore.total.position = playerScoreData[0].total_position;
	    console.log("ScoreReturn:" + util.inspect(retScore));
    }
    return retScore;
}

async function getUserTeam(event_id, user_id, tourn_id)
{
	

  var retVal = {playerRounds:[ {players:[{},{},{},{} ] } , {players:[{},{},{},{}] } , {players:[{},{},{},{}] } , {players:[{},{},{},{}] }  ]};
  let data2 = await TeamPlayer.find({team_user_id: user_id ,team_event_id: event_id}).exec();

  //console.log("TeamPlayers:" + util.inspect(data2));
  console.log("Rounds:" + util.inspect(retVal.playerRounds));
  for (i=0;i < data2.length;i++)
  {
	  teamPlayer = data2[i];
      console.log("PLAYER:" + util.inspect(teamPlayer));
	  var playerScore = await getPlayerScore(tourn_id, teamPlayer.team_player_id);
	  teamPlayer.scores = playerScore[teamPlayer.team_player_round-1];
	  retVal.playerRounds[teamPlayer.team_player_round-1].players[teamPlayer.team_player_position] = teamPlayer;
  }
  console.log("TeamPlayers:" +  util.inspect(retVal));
  
  
  return retVal;
	
}


/* GET STANDINGS */
router.get('/calculate/:event_id', async function(req, res, next) {

    console.log("standings:" + req.params.event_id);
    var retVal = {teams:[]};
    
    try {
  
	    let eventData = await getEvent(req.params.event_id);
	    if (eventData ==  null)
	    {
	    	return {status: "ERROR", message: "Event Data not found"};
	    }
	    let users = await User.find({user_event_id : req.params.event_id}).exec()
	    console.log("Users")
	    for (let i=0;i<users.length;i++)
	    {
	    	let user = users[i];
		    console.log("User2")
	    	var user_team = {};
	    	user_team.user_name = user.user_name;
	    	user_team.team_name = "not";
	    	user_team.user_id = user._id;
	    	user_team.rounds = [];
		    let rounds = await getUserTeam(req.params.event_id, user_team.user_id, eventData.event_tourn_id);
			user_team.playerRounds = rounds.playerRounds;
		  	retVal.teams.push(user_team);
	      }
		    
	      console.log("Cal Done:" + util.inspect(retVal, {depth:10}));
	    
    } catch (err)
    {
    	console.log("ERROR:" + util.inspect(err));
    }
	res.json(retVal);
	console.log("end calc")
});


module.exports = router;
