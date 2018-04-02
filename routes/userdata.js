var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Event = require('../models/Event.js');
var util = require( 'util' );


/* GET ALL USERS */
router.get('/', function(req, res, next) {
  User.find(function (err, users) {
    if (err) return next(err);
    res.json(users);
  });
});


async function verifyUserRegistration(user)
{
	var status = {status: "OK"}
	var eventExists = true
	await Event.find({ event_code: user.user_reg_code }).exec().then((events) => {
	    //console.log("EVENTS" + util.inspect(events));
	    if (events.length < 1)
	    {
	    	eventExists = false
	    }
	});

	if (eventExists == false)
	{
		return {status:"ERROR" , message: "Reg Code does not exists!"}
	}
	
	var userExists = false
	await User.find({ user_email: user.user_email, user_event_id: user.event_id }).exec().then((users) => {
	    console.log("USERS" + util.inspect(users));
	    if (users.length > 0)
	    {
	    	userExists = true
	    }
	}, err => {
		console.log("Error:" + err)
	 }
	);
	if (userExists == true)
	{
		status = {status:"ERROR" , message: "EMail address already exits for this event!"}
		return status
	}

    console.log("Status ok");
    return status
}

/* GET SINGLE USER BY ID */
router.get('/:id', function(req, res, next) {
  User.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE USER */
router.post('/', async function(req, res, next) {
 
	console.log("User Registring:" + util.inspect(req.body))
	
	var userstatus = {status: "OK"}
	userstatus = await verifyUserRegistration(req.body)
	console.log("RETURNED" + userstatus)
	
	if (userstatus.status != "OK")
	{
	    res.json(userstatus);
		return
	}
	
	try { 
	  console.log("Adding user")
	  newUserData = await User.create(req.body);
	  console.log("user created:" + util.inspect(newUserData));
           req.session['userdata'] = { user_id: newUserData._id, event_id: newUserData.user_event_id, user_name: newUserData.user_name };
	   res.json({status: "SUCESS"});
	}
	catch (error)
	{
		res.json({status: "ERROR", message: error});
	}
});

/* UPDATE USER */
router.put('/:id', function(req, res, next) {
  User.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE USER */
router.delete('/:id', function(req, res, next) {
  User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
