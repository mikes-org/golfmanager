var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var PgaPlayer = require('../models/PgaPlayer.js');
var util = require( 'util' );


/* GET ALL PGAPLAYERS */
router.get('/', async function(req, res, next) {
  data = await PgaPlayer.find().sort({player_world_rank: 'ascending' }).exec(); 
  res.json(data);
});


/* GET SINGLE PGAPLAYER BY ID */
router.get('/:id', function(req, res, next) {
  PgaPlayer.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE PGAPLAYER */
router.post('/', async function(req, res, next) {
 
  PgaPlayer.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* UPDATE PGAPLAYER */
router.put('/:id', function(req, res, next) {
  PgaPlayer.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE PGAPLAYER */
router.delete('/:id', function(req, res, next) {
  PgaPlayer.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
