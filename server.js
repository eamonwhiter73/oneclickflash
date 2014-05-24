'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : null,
  database: 'mysql'
});

connection.connect();

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

// Populate empty DB with sample data
//require('./lib/config/dummydata');

// Passport Configuration
var passport = require('./lib/config/passport');

// Setup Express
var app = express();
require('./lib/config/express')(app);
require('./lib/routes')(app);

var server = require('http').createServer(app),
    io = require('socket.io').listen(server);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

var contestants = [];
var score;
var contestantstore = {username: null, score: null};

io.configure(function() {
  io.set('transports', ['websocket','xhr-polling','flashsocket']);
  io.set('flash policy port', 10843);
});

io.sockets.on('connection', function (socket) {
  
  socket.on('message', function (data) {
    console.log(data);
    score = Number(data);
    console.log("Transfered:" + " " + score);
    socket.broadcast.emit('sendscore', score);
  })

  socket.on('score', function() {
    socket.emit(score);
  })
  
  socket.on('listContestants', function(data) {
    socket.emit('onContestantsListed', contestants);
  });

  socket.on('turnonmysql', function(){
    connection.connect();
  });

  socket.on('turnoffmysql', function(){
    connection.end();
  });

  socket.on('createContestant', function(data) {
    socket.emit('turnonmysql');
    contestants.push(data);
    contestantstore.username = data.display_name;
    contestantstore.score = score;
    connection.query('INSERT INTO scores SET ?', contestantstore);
    socket.broadcast.emit('onContestantCreated', data);
    socket.emit('turnoffmysql');
  });

  socket.on('updateContestant', function(data){
    contestants.forEach(function(person){
      if (person.id === data.id) {
        person.display_name = data.display_name;
        person.score = data.score;
      }
    });
    socket.broadcast.emit('onContestantUpdated', data);
  });

  socket.on('deleteContestant', function(data){
    contestants = contestants.filter(function(person) {
      return person.id !== data.id;
    });
    socket.broadcast.emit('onContestantDeleted', data);
  });
});

// Expose app
exports = module.exports = app;