var express = require('express');
var router = express.Router();
var util = require('util');

/* GET home page. */
router.get('/editteam/:event_id/:user_id', function(req, res, next) {
  console.log("Editing Team:" + util.inspect(req.params.user_id));
  res.render('admin/editteam', { title: '2018 Masters', user_id: req.params.user_id , event_id: req.params.event_id });
});

module.exports = router;
