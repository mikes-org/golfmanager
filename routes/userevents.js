var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UserEvent = require('../models/UserEvent.js');
var util = require('util');

/* GET ALL EVENTS */
router.get('/', function(req, res, next) {
  UserEvent.find(function (err, events) {
    if (err) { console.log("ERR" + util.inspect(err));return next(err)};
    res.json(events);
  });
});

/* GET SINGLE EVENT BY ID */
router.get('/:id', function(req, res, next) {
  UserEvent.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET SINGLE EVENT CODE */
router.get('/:event_id', function(req, res, next) {
  UserEvent.findById(req.params.event_id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});


/* SAVE EVENT */
router.post('/', function(req, res, next) {
  console.log("Create UserEvent:" + util.inspect(req.body));
  UserEvent.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* UPDATE EVENT */
router.put('/:id', function(req, res, next) {
  UserEvent.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE EVENT */
router.delete('/:id', function(req, res, next) {
  UserEvent.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
