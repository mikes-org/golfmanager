var Event = require('../models/Event.js');
var UserEvent = require('../models/UserEvent.js');
var User = require('../models/User.js');
var Team = require('../models/Team.js');
var TeamPlayer = require('../models/TeamPlayer.js');
var PgaPlayer = require('../models/PgaPlayer.js');
var Excel = require('exceljs');
var util = require('util');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mastersdb')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));



async function openSpreadsheet(filename)
{
  console.log("START");

  // read from a file
  var workbook = new Excel.Workbook();
  wb = await workbook.xlsx.readFile(filename);
  //console.log("worksheet:" + util.inspect(wb));	

  console.log("DONE");
  return wb;
}

async function saveTeam(team)
{
	  var userId = team.user_id;
	  var eventId = team.event_id;
	  
      // Add roster from first 2 days
	  console.log("TEAM DAYS:" + team.days.length);
	  for (let nDay=0;nDay<2;nDay++)
	  {
		console.log("TEAM ROSTER:" + team.days[nDay].players);
		for (let nPos=0;nPos < team.days[nDay].players.length;nPos++)
		{
			console.log("**************** Adding player to roster *****************");
	  		let newPlayer = {team_user_id: userId, team_event_id: eventId, team_player_id: team.days[nDay].players[nPos].player_id, team_player_name: team.days[nDay].players[nPos].name};
		    console.log("Adding:" + util.inspect(newPlayer));	  
		    let res = Team.create(newPlayer);
			  console.log("NP---:" + util.inspect(newPlayer));
		}
	  }
	  
	  for (i=0;i< team.days.length;i++)
	  {
		  for (pos=0;pos<4;pos++)
		  {
	  		  let player = {team_player_round: (i+1) , team_user_id: userId, team_event_id: eventId, team_player_name: team.days[i].players[pos].name, team_player_id: team.days[i].players[pos].player_id, team_player_position: pos };
			  console.log("TP:" + util.inspect(player));
			  TeamPlayer.create(player)
		  }
		  
	  }
	  

	  console.log("Replace Done");	
}  

async function clearEventUserData(eventId)
{
	console.log("DELETE");
	try {
	    let ret = await User.remove({}).exec();
	    ret = await UserEvent.remove({}).exec();
		console.log("Clearing UserEvent:" + eventId);
	    ret = await UserEvent.remove({ event_id : eventId }).exec();
		console.log("Clearing Teams" + ret);
	    ret = await Team.remove({ team_event_id : eventId }).exec();
		console.log("Clearing Team Players" + ret);
	    ret  = await TeamPlayer.remove({ team_event_id : eventId }).exec();
		return true;
	}
	catch (error)
	{
		console.log("ERROR:" + util.inspect(error));
		return false;
	}
    return true;
}

async function processDayLineup(dayRoster)
{
	//retTeam = JSON.parse(JSON.stringify(team));
	for (let nPos=0; nPos<4; nPos++)
	{
		//console.log("Processing pos:" + nPos);
		let playerName = dayRoster.players[nPos].name;
		playerArray = playerName.split(" ");
		let playerLastName = '';
		if (playerArray.length > 1)
		{
			console.log("&&&&&&&&&&& Player with Initial");
			playerName = playerArray[0];
			playerFirstInitial = playerArray[1];
		}
		
		let playersMatch = await PgaPlayer.find({player_last_name: {  "$regex": playerName, "$options": "i" } }).exec();
		//console.log("PM:" + util.inspect(playersMatch));
		if (playersMatch.length == 1)
		{
			dayRoster.players[nPos].player_id = playersMatch[0].player_id;
		}
		else
		{
			if (playerFirstInitial != '')
			{
				bMatchFound = false;
				  for (n=0;n<playersMatch.length;n++)
				  {
					  if (playersMatch[n].player_first_name.startsWith(playerFirstInitial) == true)
					  {
						dayRoster.players[nPos].player_id = playersMatch[n].player_id;
						bMatchFound = true;
					  }
				  }
				  if (bMatchFound == false)
				  {
					  console.log("Check Initial Error Failed ++++++++++++++++++++++ :" + playerName);
					  return null;
				  }
			}
			else
			{
			  console.log("Error Failed ++++++++++++++++++++++ (" + playerName);
			  return null;
			}
		}
		
	}
	//console.log("Return Team:" + util.inspect(dayRoster, {depth: 10}));
	return dayRoster; 
}

async function findPgaPlayers(team)
{
	//retTeam = JSON.parse(JSON.stringify(team));
	
	for (i=0;i<team.days.length;i++)
	{
	  bRes = await processDayLineup(team.days[i]);
	  if (bRes == null)  return false;
	  team.days[i] = bRes;
	}
	return team;
}

async function createUpdateUser(team)
{
	try {
		console.log("Finding User:" + team.user_name);
	    let ret = await User.find({ user_name : team.user_name }).exec();
	    if (ret.length > 0)
	    {
	    	ret = await UserEvent.findOne({ user_id: ret[0]._id} );
	    	if (ret != null)
	    	{
		    	team.user_id = ret[0]._id;
		    	return true;
	    	}
	    }
		let userData = {user_name: team.user_name, user_full_name: team.user_full_name ,user_email: team.user_name, user_event_id: team.event_id,  user_reg_code: 'masters2018', user_password: 'changeme', user_team_name: team.team_name, user_role: 'user'}
	    ret = await User.create(userData);
		console.log("New user:" + util.inspect(ret));
		if (ret != null)
		{
			let userEvent = {event_id: team.event_id, user_id: ret._id, user_balance: -200 };
		    ret = await UserEvent.create(userEvent);
		    team.user_id = ret._id;	
		    if (ret != null)
		    {
				console.log("New user event:" + util.inspect(ret));
				return true;
		    }
		}
	}
	catch (error)
	{
		console.log("ERROR:" + util.inspect(error));
		return false;
	}
    return false;
}



async function addUserTeam(team)
{
	let userName = team.team_name.replace(/\s+/g, '-').toLowerCase();
	console.log("UserName:" + userName);
	team.user_name = userName;
	
	let bUser = await createUpdateUser(team);
	
	if (bUser == false) return false;

	
    //console.log("UPDATEDING TEAM:" + util.inspect(team)); 
	let updatedTeam  = await findPgaPlayers(team);

	if (updatedTeam == null)
	{
		console.log("Error getting pga players;");
		return false;
	}
    console.log("UPDATED TEAM:" + util.inspect(updatedTeam , {depth:10})); 
    let saveStatus = await saveTeam(team);
    if (saveStatus == false)
    {
		console.log("Error saving team");
		return false;
    }
    return true;
}


async function loadInitialTeams(file,eventId)
{
	
  let clearStatus = await clearEventUserData(eventId);
  if (clearStatus ==false)
  {
	  console.log("Clear Failed ++++++++++++++++++++++");
	  return false;
  }
  
  let work = await openSpreadsheet(filename);
  let scores = await work.getWorksheet("Pick Sheet");
  //console.log("Scores:" + util.inspect(scores));
  let emptyCells = 0;
  let col = 2;
  let teamRow = scores.getRow(1);
  let nameRow = scores.getRow(2);

  let a1Row = scores.getRow(4);
  let b1Row = scores.getRow(5);
  let c1Row = scores.getRow(6);
  let d1Row = scores.getRow(7);

  let a2Row = scores.getRow(8);
  let b2Row = scores.getRow(9);
  let c2Row = scores.getRow(10);
  let d2Row = scores.getRow(11);
  
  let a3Row = scores.getRow(13);
  let b3Row = scores.getRow(14);
  let c3Row = scores.getRow(15);
  let d3Row = scores.getRow(16);
  
  let a4Row = scores.getRow(18);
  let b4Row = scores.getRow(19);
  let c4Row = scores.getRow(20);
  let d4Row = scores.getRow(21);
  
  let cellNum = 2;
  while (emptyCells < 3)
  {
	  let teamName = teamRow.getCell(cellNum).value;
	  if (teamName == null)
	  {
		  emptyCells++;
	  }
	  else
	  {    
		  let ownerName = nameRow.getCell(cellNum).value;
		  console.log("Cell:" + cellNum + " ,TeamName:" + teamName+ " ,OwnerName:" + ownerName);
		  emptyCells=0;
		  let thursA = a1Row.getCell(cellNum).value;
		  let thursB = b1Row.getCell(cellNum).value;
		  let thursC = c1Row.getCell(cellNum).value;
		  let thursD = d1Row.getCell(cellNum).value;
		  let friA = a2Row.getCell(cellNum).value;
		  let friB = b2Row.getCell(cellNum).value;
		  let friC = c2Row.getCell(cellNum).value;
		  let friD = d2Row.getCell(cellNum).value;
		  let satA = a3Row.getCell(cellNum).value;
		  let satB = b3Row.getCell(cellNum).value;
		  let satC = c3Row.getCell(cellNum).value;
		  let satD = d3Row.getCell(cellNum).value;
		  let sunA = a4Row.getCell(cellNum).value;
		  let sunB = b4Row.getCell(cellNum).value;
		  let sunC = c4Row.getCell(cellNum).value;
		  let sunD = d4Row.getCell(cellNum).value;
		  teamPlayers = {team_name: teamName.trim(), user_full_name: ownerName.trim(), event_id: eventId, 
			             days:[ { players: [ {name: thursA}, {name: thursB}, {name: thursC}, {name: thursD}] }, 
			                    { players: [ {name: friA},{name: friB},{name: friC},{name: friD}] } ,
		                        { players: [ {name: satA},{name: satB},{name: satC},{name: satD}] } ,
		                        { players: [ {name: sunA},{name: sunB},{name: sunC},{name: sunD}] }
	                          ] };
		  //console.log("Adding user-team:" + util.inspect(teamPlayers, {depth:8}));
		  let res = await addUserTeam(teamPlayers);
		  if (res == false)
		  {
			  return false;
		  }
		  
	  }
	  cellNum++;
  }
  //scores.commit();
  console.log("Done Cells");
  return true;
}
let filename = "./data/Masters_2018_Picks.xlsx";
let event_id = "b404a8d5-5e33-4417-ae20-5d4d147042ee";

try {
   loadInitialTeams(filename,event_id);
} catch (error)
{
	console.log("ERR:" + error);
}