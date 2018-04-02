var express = require('express');
var router = express.Router();
var pgaapi = require('../../api/pgaapi.js')
var util = require( 'util' );

/* GET home page. */
router.get('/managepgaplayers', function(req, res, next) {
  res.render('admin/pgaplayers', { title: 'Admin Pga Players' });
});

/* GET home page. */
router.get('/pgatournaments/:year', async function(req, res, next) {

  res.render('admin/pgatournaments', { title: 'Pga Tournaments', tourn_year: req.params.year });
});

/* GET home page. */
router.get('/tournaments/:year', async function(req, res, next) {

  let tourn_data = [];
  await pgaapi.getAllTournaments(req.params.year).then((results) =>
  {
    tourn_data = results;

  },
    err => { res.json({status:'ERROR', msg: err});
  });
  res.json(tourn_data);
});


router.get('/updateplayers', async function(req, res, next) {

  await pgaapi.getAndUpdateAllPlayers().then((status) => 
  {
    res.json(status);
  }, 
    err => { res.json({status:'ERROR', msg: err});
  });
});


router.get('/updatescores/:event_id/:round', async function(req, res, next) {

  console.log("Updating scores for round:" + req.params.round + ", event: " + req.params.event_id);	
  return await pgaapi.getAndUpdateScores(req.params.event_id,req.params.round).then((ret_status) =>
  {
    console.log("GandUScores:" + ret_status);
    res.json(ret_status);
  },
    err => {
	    console.log("US ERROR:" + util.inspect(err));
	    res.json({status:'ERROR-44', message: err});
    });
});

router.get('/tournamentresults/:id', async function(req, res, next) {

  await pgaapi.getTournamentResults(req.params.id).then((results) =>
  {
    res.json(results);
  },
    err => { res.json({status:'ERROR', msg: err});
  });
});


/* GET home page. *//* GET home page. */
router.get('/manageevents', function(req, res, next) {
  res.render('admin/pgaevents', { title: 'Admin Pga Events' });
});

router.get('/manageresults/:pga_event_id', function(req, res, next) {
  res.render('admin/pgaresults', { title: '2016 Masters', pga_event_id: req.params.pga_event_id });
});

router.get('/managescores/:pga_event_id', function(req, res, next) {
  res.render('admin/teamscores', { title: 'Team Scores', pga_event_id: req.params.pga_event_id });
});


module.exports = router;
