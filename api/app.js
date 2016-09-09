var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var conf = require('./conf');
var session = require('./session/index');
var members = require('./members/index');

var app = express();
var mongoose    = require('mongoose');

// uncomment after placing your favicon in /public
//www.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose.connect(conf.database); // connect to database
mongoose.Promise = global.Promise;

var router = express.Router();
router.use('/session', session.controller);
router.use('/members', members.controller);

app.use('/api', router);

app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '..', '.tmp')));
app.use('/bower_components',express.static(path.join(__dirname, '..', './bower_components')));
app.use(express.static(path.join(__dirname, '..', 'www')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.get('/', function (req, res) {
  res.status('200').send('Service is up');
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
