var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var util = require( 'util' );
var TeamPlayer = require('../models/TeamPlayer.js');

/* GET ALL TEAMPLAYERS */
router.get('/', function(req, res, next) {
  TeamPlayer.find(function (err, products) {
    if (err) return next(err);
    res.json(products);
  });
});

/* GET SINGLE USERS TEAMPLAYER */
router.get('/:team_user_id/:team_event_id', async function(req, res, next) {
	
  console.log("Getting TeamPlayer." + req.params.team_user_id + " Event:"+ req.params.team_event_id);
  
  let data2 = await TeamPlayer.find({team_user_id: req.params.team_user_id ,team_event_id: req.params.team_event_id}).exec();
  res.json(data2);

});


/* GET SINGLE TEAMPLAYER BY ID */
router.get('/:id', function(req, res, next) {
  TeamPlayer.findById(req.params.id, function (err, post) {
    var retVal = {round1:[], round2: [], round3: [], round4: []};
    console.log("TeamPlayer." + util.inspect(post));
    post.forEach(teamPlayer => 
    {
    });
    if (err) return next(err);
    console.log("TeamPlayer:" +  util.inspect(retVal));
    res.json(retVal);
  });
});

/* SAVE TEAMPLAYER */
router.post('/', function(req, res, next) {
  TeamPlayer.create(req.body.round1, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* UPDATE TEAMPLAYER */
router.put('/:id', function(req, res, next) {
  TeamPlayer.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE TEAMPLAYER */
router.delete('/:id', function(req, res, next) {
  TeamPlayer.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
