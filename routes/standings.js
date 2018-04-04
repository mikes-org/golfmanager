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
	let eventData  = await Event.find({ event_tourn_id: event_id}).exec();
    if (eventData.length > 0)
    {
    	console.log("Event Data" + eventData);
    	return eventData[0];
    }
    return null;
}

async function getPlayerScore(event_id, player_id)
{
	let retScore = {round:[{},{},{},{}], total:{}}
    try {
		console.log("Score finding for:" + event_id + "," + player_id);
		playerScoreData  = await Score.find({player_id: player_id, event_id: event_id}).exec();
		console.log("Got Score" + util.inspect(playerScoreData));
	    if (playerScoreData.length > 0)
	    {
	    	console.log("Setting score for" + player_id);
	    	
	    	
	    	retScore.round[0].score = playerScoreData[0].round_1_to_par;
	    	retScore.round[0].position = playerScoreData[0].round_1_position;
	    	retScore.round[1].score = playerScoreData[0].round_2_to_par;
	    	retScore.round[1].position = playerScoreData[0].round_2_position;
	    	retScore.round[2].score = playerScoreData[0].round_3_to_par;
	    	retScore.round[2].position = playerScoreData[0].round_3_position;
	    	retScore.round[3].score = playerScoreData[0].round_4_to_par;
	    	retScore.round[3].position = playerScoreData[0].round_4_position;
	    	retScore.total.score = playerScoreData[0].total_to_par;
	    	retScore.total.position = playerScoreData[0].total_position;
		    console.log("ScoreReturn:" + util.inspect(retScore));
	    }
    } catch (error)
    {
    	console.log("ERR:" + util.inspect(error));
    }
    return retScore;
}

async function getUserTeam(event_id, user_id, tourn_id)
{
	
  console.log("getUserTeamStart");
  var retVal = {playerRounds:[ {players:[{},{},{},{} ] } , {players:[{},{},{},{}] } , {players:[{},{},{},{}] } , {players:[{},{},{},{}] }  ]};
  let data2 = await TeamPlayer.find({team_user_id: user_id ,team_event_id: event_id}).exec();

  //console.log("TeamPlayers:" + util.inspect(data2));
  //console.log("Rounds:" + util.inspect(data2));
  for (i=0;i < data2.length;i++)
  {
	  teamPlayer = JSON.parse(JSON.stringify(data2[i]));
      //console.log("PLAYER:" + util.inspect(teamPlayer));
	  var playerScore = await getPlayerScore(tourn_id, teamPlayer.team_player_id);
	  teamPlayer.scores = playerScore.round[teamPlayer.team_player_round-1]; 
	  //console.log("PLAYER2:" + util.inspect(teamPlayer));
	  retVal.playerRounds[teamPlayer.team_player_round-1].players[teamPlayer.team_player_position] = teamPlayer;
  } 
  
  
  console.log(" *********** getUserTeamEnd ********************");
  
  for (nRnd=0;nRnd < retVal.playerRounds.length;nRnd++)
  {
	  if (retVal.playerRounds[nRnd])
	  {
		  let pData = JSON.parse(JSON.stringify(retVal.playerRounds[nRnd]));
		  nTotalScore = 0;
		  for (nPlay=0;nPlay<pData.players.length;nPlay++)
		  {
			  //console.log("PlayerRound:" + util.inspect(pData.players[nPlay]));
			  if (pData.players[nPlay].scores && pData.players[nPlay].scores.score)
			  {
				  nTotalScore = nTotalScore + pData.players[nPlay].scores.score;
			  }
		  }
		  pData.roundTotal = nTotalScore;
		  retVal.playerRounds[nRnd].roundTotal = nTotalScore;
	  }
  }
  console.log(" *********** getUserTeamEnd2 ********************" );
  console.log("TeamPlayers:" +  util.inspect(retVal , { depth : 6}));
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
	    	user_team.team_name = user.user_team_name;
	    	user_team.user_id = user._id;
	    	user_team.rounds = [];
		    let rounds = await getUserTeam(req.params.event_id, user_team.user_id, eventData.event_tourn_id);
			user_team.playerRounds = rounds.playerRounds;
		  	retVal.teams.push(user_team);
	      }
		    
	      console.log("Cal Done:" + util.inspect(retVal, {depth:1}));
	    
    } catch (err)
    {
    	console.log("ERROR:" + util.inspect(err));
    }
	res.json(retVal);
	console.log("end calc")
});


module.exports = router;
