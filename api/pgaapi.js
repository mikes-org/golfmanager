var Swagger = require( 'swagger-client' );
var pgaSpec = require('./swagger/golf-v2.json');
var util = require( 'util' );
var mongoose = require('mongoose');
var PgaPlayer = require('../models/PgaPlayer.js');
var fs = require('fs');
var Score = require('../models/Score.js');


var header = {'Ocp-Apim-Subscription-Key': 'c5db33a8301d4588bcbc569781984315'}

var isVerbose = false;

async function ocApiCallPromise( func, arg, requestContentType='application/json') {
	console.log("Start API Call:" + func);
	//await ocApiPromise;
	var myInterceptor = function (req)
	{
		    req.headers = header;
		    req.headers.Accept = '*/*';
		    return req;
	}
        return await Swagger.execute({ spec: pgaSpec, operationId: func, requestInterceptor : myInterceptor ,
	                                parameters: arg, requestContentType: requestContentType }).then((resp) => 
	{
		//console.log("CallPromiseDone:" + util.inspect(resp.obj, {depth: 1 }));
	                  return resp;
	              }, err => {
                          if (isVerbose) console.error( util.inspect( err ) );
                          throw err;
	} );
  }  

async function getAllPlayers() {
    return ocApiCallPromise( 'Players', { format: 'JSON'} );
  }

async function readPlayerRanking() {

	var obj = {};
	console.log("reading1");
	obj = fs.readFileSync("./data/rankings.json", 'utf8'); // ,function (err, data) {
	var ret  = JSON.parse(obj);
	//console.log("parsed" + util.inspect(ret));
	console.log("read")
	return ret
	
  }

async function readEventScores() {

	var obj = {};
	console.log("reading1");
	obj = fs.readFileSync("./data/leaderboard.json", 'utf8'); // ,function (err, data) {
	var ret  = JSON.parse(obj);
	//console.log("parsed" + util.inspect(ret));
	console.log("read")
	return ret
	
  }


function  makeTourneyObj( tourn ) {
	  return {
	    name: tourn.Name,
        ID: tourn.TournamentID,
        startDate: tourn.StartDate,
        endDate: tourn.EndDate
	};
}

async function getTourneyResultsCall(tournId) {
	console.log("Getting results for:" + tournId);
    return await ocApiCallPromise( 'Leaderboard', { format: 'JSON', tournamentid: tournId} );
    //.then((resp) => {
    //	"RETURNING RESPONSE 2"
    //    return resp.obj;
    //}, err => {
    //	cosole.log("ERROR getting leaderboard:" + util.inspect(err));
    //});
    console.log("getTResCall exit");
  }

async function getAllTourneys() {
    var resp = await ocApiCallPromise( 'Schedules', { format: 'JSON'} );
    return resp.obj.map( makeTourneyObj );
  }

function filterT(t,year)
{
	//console.log('Filtering:' + t.name.toLowerCase())
	//console.log('Filtering:' + (t.name.toLowerCase().indexOf('masters') >= 0 ))
	if (t.startDate.startsWith(year) && t.name.toLowerCase().indexOf('masters') >= 0) return true;
	return false;
}

function makePlayerStandingObj(player)
{
	var retObj = {}
	retObj.PlayerID = player.PlayerID
	retObj.Name = player.Name
	retObj.Rank = player.Rank
	
	var Rounds = []
	
	player.Rounds.forEach(r => {
		var round = {};
		round.Score = r.Score
		Rounds.push(round)
	});
	retObj.Rounds = Rounds;
	
	
	return retObj;
	
}

async function getTournamentResults(id)
{
	var returnVal = {}
	console.log("Start")
	return await getTourneyResultsCall(id).then((results) => {
	    //console.log("RESULTS:" + util.inspect(results));
		returnVal = results.obj;
		//var players = results.Players.map (makePlayerStandingObj)
		//results.players = players;
		console.log("RETURNING RESULTS:");
		return returnVal;
		
	});
	
    return {};
	
}

async function getTournament(name, year)
{
	var tournament = null
	console.log("Start")
	var resp = await getAllTourneys();
    //resp.forEach( tourney => {
    //	console.log("Tourney:" + util.inspect(tourney,{ depth: 11 }));
    //})
    if (resp.length > 0)
    {	
    	tournament = resp.filter( s => s.startDate.startsWith(year) == true && s.name.toLowerCase().indexOf(name) >= 0)[0]
    	//tournament = resp.filter( filterT() )[0]
    }
    console.log("Tournament:" + util.inspect(tournament,  { depth: 1 }));
    return tournament;
	
}

async function getTournamentForYear(year)
{
	var tournament = null
	console.log("Start")
	var resp = await getAllTourneys();
    //resp.forEach( tourney => {
    //	console.log("Tourney:" + util.inspect(tourney,{ depth: 11 }));
    //})
    if (resp.length > 0)
    {	
    	tournament = resp.filter( s => s.startDate.startsWith(year) == true)
    	//tournament = resp.filter( filterT() )[0]
    }
    console.log("Tournament:" + util.inspect(tournament,  { depth: 11 }));
    return tournament;
	
}

async function getResults(tourn)
{
	   var tourney = await getTournament(tourn, '2018');
	   if (tourney)
	   {
		   console.log('Getting results for:' + tourney);
		   var results = await getTournamentResults(tourney.ID);
		   console.log("Results:" + util.inspect(results,{ depth: 10 }));
	   }
}

async function listPlayers()
{
	console.log("Start")
	var resp = await getAllPlayers();
	console.log("Players:" + util.inspect(resp.obj,{ depth: 0 }));
    resp.obj.forEach( player => {
    	console.log("Player:" + util.inspect(player.LastName,{ depth: 1 }));
    	
    })
	var players = [{'player': {'name': 'phil'}}]
	console.log("Finished")
	return players
}
exports.getTournamentResults = async function(tourn_id)
{
	console.log("GETTING RESULTS FOR:" + tourn_id);
	
	return await readEventScores().then((resp) =>
	{
		console.log("GOT:" + util.inspect(resp, {depth: 1}));
		return resp;
	}, err => { console.log("ERR1:" + err); return {status: "ERROR-12", message: err}
		
	})
	console.log("Leaving")
}

exports.getAllTournaments = async function(year)
{
	console.log("GETTING Tournaments for:" + year);
	
	return await getTournamentForYear(year).then((resp) =>
	{
		console.log("Returning:" + util.inspect(resp));
		return resp;
	}, err => { return {status: "ERROR-4", message: err}
		
	})
	console.log("Leaving")
	return {status: "WARN"}
}


exports.getAndUpdateScores = async function(event_id, lastRound)
{
	console.log("GETTING Scores" + lastRound + "," + event_id)
	console.log("Clearing Scores table");
	try {
	    data = await Score.remove({event_id: event_id}).exec();
	    console.log("Table cleared" + data);
		console.log("reading scores ");
		scoreData = await readEventScores();
		console.log("GOT Scores")
	    for (n=0;n<scoreData.leaderboard.length;n++)	
	    {
	      score = scoreData.leaderboard[n];
	  	   console.log("Score:" + util.inspect(score,{ depth: 8 }));
		   var myscore = {player_id: score.id, event_id: event_id, total_position: score.position, total_strokes: score.strokes ,total_to_par: score.score }
	       for (nRnd=0;nRnd< lastRound;nRnd++)
	       {
	    	   console.log("UPDATING ROUND:" + (nRnd +1));
	    	   if (score.rounds.length > nRnd)
	    	   { 
				   eval("myscore.round_" + (nRnd+1) + "_total = score.rounds[" + nRnd + "].strokes;"); 
				   eval("myscore.round_" + (nRnd+1) + "_to_par = score.rounds[" + nRnd + "].score;"); 
				   console.log("myscore.round_" + (nRnd+1) + "_to_par = score.rounds[" + nRnd + "].score;"); 
	    	   }
	    	   else
	    	   {
				   eval("myscore.round_" + (nRnd+1) + "_total = 99"); 
				   eval("myscore.round_" + (nRnd+1) + "_to_par = 99"); 
	    	   }
			   eval("myscore.round_" + (nRnd+1) + "_position = 99"); 
	       }
		   console.log("MyScore:" + util.inspect(myscore,{ depth: 10 }));
		   await Score.create(myscore);
		}

		console.log("Update Round Positions");
        for (nRnd=0;nRnd< lastRound;nRnd++)
        {
        	eval('sortC = {round_' + (nRnd+1) + '_total: "ascending"}');
        	console.log("Sorter:" + util.inspect(sortC));
    	    roundData = await Score.find({event_id: event_id,}).sort(sortC).exec();
    	    positionRank = 0;
    	    lastScore = 0;
    	    newScore = 99;
    	    for (n=0;n<roundData.length;n++)
    	    {
    	    	curData = roundData[n];
    	    	newScore = eval("curData.round_" + (nRnd+1) + "_total");
    	    	if (newScore > lastScore)
    	        {
    	    		positionRank = positionRank + 1;
    	    		lastScore = newScore;
    	        }
    	    	eval('curData.round_' + (nRnd+1) + '_position = positionRank;');
    	    	if (nRnd==0) curData.round_1_position = positionRank;
    	    	if (nRnd==1) curData.round_2_position = positionRank;
    	    	if (nRnd==2) curData.round_3_position = positionRank;
    	    	if (nRnd==3) curData.round_4_position = positionRank;
    	    	//console.log(n + ":NS:" + newScore + ",lS:" + lastScore  + ",R:" + positionRank);
       	    	//console.log("Update:" + util.inspect(curData));
       	        res = await Score.findByIdAndUpdate(curData._id,curData).exec();
       	        //console.log("URES:" + res);
    	    }
        }
		
	} catch (error)
    {
		console.log("ERROR:" + util.inspect(error));
		return {status: "ERROR", message: error};
    }
	console.log("Leaving")
	return {status: "DONE"}
}



exports.getAndUpdateAllPlayers = async function()
{
	console.log("GETTING PLAYERS")
	
    await PgaPlayer.remove({}).then(() => {
      console.log("Table cleared");
    });

	
	await readPlayerRanking().then((resp) =>
	{
		console.log("GOT")
        resp.players.forEach( player => {
      	   console.log("Player:" + util.inspect(player,{ depth: 1 }));
    	   var myplayer = {player_id: player.id, player_first_name: player.first_name, player_last_name: player.last_name,player_world_rank: player.rank,player_country: player.country}
    	   console.log("Player:" + util.inspect(myplayer,{ depth: 1 }));
    	   PgaPlayer.create(myplayer, function (err, post) {
    		    if (err) throw err
    		    console.log("Saved")
    		  });
        })
		return resp;
	}, err => { return {status: "ERROR-8", message: err}
		
	})
	console.log("Leaving")
	return {status: "WARN"}
}



exports.getAndUpdateAllPlayersold = async function()
{
	console.log("GETTING PLAYERS")
	
    await PgaPlayer.remove({}).then(() => {
      console.log("Table cleared");
    });

	
	return await getAllPlayers().then((resp) =>
	{
		console.log("GOT")
        resp.obj.forEach( player => {
     	   console.log("Player:" + util.inspect(player,{ depth: 1 }));
    	   var myplayer = {player_id: player.PlayerID, player_first_name: player.FirstName, player_last_name: player.LastName,player_world_rank: 99,player_country: player.Country}
    	   console.log("Player:" + util.inspect(myplayer,{ depth: 1 }));
    	   PgaPlayer.create(myplayer, function (err, post) {
    		    if (err) throw err
    		    console.log("Saved")
    		  });
        })
		return resp;
	}, err => { return {status: "ERROR-3", message: err}
		
	})
	console.log("Leaving")
	return {status: "WARN"}
}


try {

   console.log("Start0")
   //var tourneys = getResults('valspar');
   
   //var players = listPlayers();
   //console.log("Players:" + util.inspect(players,  { depth: 1 }));
   console.log("Finished0")
} catch( err ) {
  console.log( util.inspect( err ) );
}

