var express = require('express');
var router = express.Router();
var Event = require('../models/Event.js');
var util = require('util');
var User = require('../models/User.js');


/* GET home page. */
router.get('/', function(req, res, next) {
    req.session['userdata'] = null;
	res.render('signin', { title: '2018 Masters', event_id: '5aa9776eb055e7406804f358' });
});

/* GET home page. */
router.post('/verifyuser', async function(req, res, next) {
  let status = {status: "OK", message: "success"};
    console.log("REG getting event id:" + util.inspect(req.body));
    let eventId = "not set";
    await User.find({user_event_id: req.body.event_id, user_email: req.body.user_email, user_password: req.body.user_pwd }).exec().then((data) => {
            console.log("Got User:" + util.inspect(data));
            if (data.length == 0)
            {
                status = {status:"ERROR", message:"Invalud username/password"};
            }
	    else
	    {
               req.session['userdata'] = { user_id: data[0]._id, event_id: req.body.event_id, user_name: data[0].user_name };		    
            }
    }, err => { console.log("Error getting reg code:" + req.params.reg_code);
    }); 	
  res.json(status);
});

/* GET home page. */
router.get('/:reg_code', async function(req, res, next) {
    console.log("REG getting event id:" + req.params.reg_code);
    let eventId = "not set";
    await Event.find({event_code: req.params.reg_code}).exec().then((data) => {
            console.log("Got Event:" + util.inspect(data));
            if (data.length > 0)
            {
              eventId = data[0]._id;
            }
            console.log("d:" + eventId);
    }, err => { console.log("Error getting reg code:" + req.params.reg_code);
    });
  console.log("Registering for event:" + eventId);
  res.render('signin', { title: '2018 Masters', event_id:eventId });
});

module.exports = router;
