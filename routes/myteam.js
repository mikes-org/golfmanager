var express = require('express');
var router = express.Router();
var util = require('util');

/* GET home page. */
router.get('/', function(req, res, next) {
  var userData = req.session['userdata'];
  console.log("Session:" + util.inspect(userData));
  if (userData) 
  {
    res.render('myteam', { title: '2018 Masters', user_id: userData.user_id , event_id: userData.event_id, user_name : userData.user_name });
  }
  else
  {
    res.render('index', { title: '2018 Masters', message: 'Sign in for access'});
  }
});

module.exports = router;
