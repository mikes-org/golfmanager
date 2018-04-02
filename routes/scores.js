var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Score = require('../models/Score.js');
var PgaPlayer = require('../models/PgaPlayer.js');
var util = require('util');

/* GET ALL SCORES */
router.get('/', function(req, res, next) {
  Score.find(function (err, scores) {
    if (err) return next(err);
    res.json(scores);
  });
});

/* GET SINGLE SCORE BY ID */
router.get('/:event_id', async function(req, res, next) {
    console.log("Getting scores for event:" + req.params.event_id);
    scoreData = await Score.find({event_id: req.params.event_id}).exec();
    retData = [];
    console.log("Data:" + util.inspect(scoreData));
    for (n=0;n< scoreData.length;n++)
    {
       playerScore = JSON.parse(JSON.stringify(scoreData[n]));
       console.log("Score:" + playerScore);
       _players = await PgaPlayer.find({player_id: scoreData[n].player_id}).exec();
       if (_players.length > 0)
       {
         console.log("PGA:" + util.inspect(_players[0]));
         playerScore.player_name =  _players[0].player_last_name + ', ' + _players[0].player_first_name;
       }
       console.log("ns:" + util.inspect(playerScore));
       retData.push(playerScore);
    }
    res.json(retData);
});

/* GET SINGLE SCORE CODE */
router.get('/:event_id:/:player_id', function(req, res, next) {
  Score.find({ event_id: req.params.event_id, player_id: req.params.player_id}, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});


/* SAVE SCORE */
router.post('/', function(req, res, next) {
  Score.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* UPDATE SCORE */
router.put('/:id', function(req, res, next) {
  Score.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE SCORE */
router.delete('/:id', function(req, res, next) {
  Score.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
