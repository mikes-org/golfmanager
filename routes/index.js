var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '2018 Masters',event_id: 'b404a8d5-5e33-4417-ae20-5d4d147042ee' });
});

module.exports = router;
