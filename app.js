var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mastersdb')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

var pgaplayers = require('./routes/pgaplayers');
var userdata = require('./routes/userdata');
var events = require('./routes/events');
var scores = require('./routes/scores');
var teams = require('./routes/teams');
var teamplayers = require('./routes/teamplayers');

var index = require('./routes/index');
var admin_index = require('./routes/admin/index');
var users = require('./routes/users');
var admin_pgadata = require('./routes/admin/pgadata');

var register = require('./routes/register');
var signin = require('./routes/signin');
var myteam = require('./routes/myteam');
var standings = require('./routes/standings');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.cookieParser('123SEC999'));
//app.use(express.cookieSession());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
}))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/events', events);
app.use('/scores', scores);
app.use('/teams', teams);
app.use('/teamplayers', teamplayers);
app.use('/register', register);
app.use('/signin', signin);
app.use('/myteam', myteam);
app.use('/standings', standings);

app.use('/pgaplayers', pgaplayers);
app.use('/userdata', userdata);
app.use('/admin/', admin_index);
app.use('/admin', admin_pgadata);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
