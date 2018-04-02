var express = require('express');
var router = express.Router();
var Event = require('../models/Event.js');
var util = require('util');

/* GET home page. */
router.get('/:event_id', async function(req, res, next) {
    //console.log("REG getting event id:" + req.params.event_id);
    //let eventId = "not set";
    //await Event.find({event_code: req.params.reg_code}).exec().then((data) => {
    //	    console.log("Got Event:" + util.inspect(data));
    //	    if (data.length > 0)
    //        {
    //	      eventId = data[0]._id;
    //	    }
    //	    console.log("d:" + eventId);
    //}, err => { console.log("Error getting reg code:" + req.params.reg_code);
    //});
  console.log("Registering for event:" + req.params.event_id);
  res.render('register', { title: 'Registration', event_id:req.params.event_id });
});

module.exports = router;
