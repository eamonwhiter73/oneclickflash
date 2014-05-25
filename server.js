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



io.configure(function() {
  io.set('transports', ['websocket','xhr-polling','flashsocket']);
  io.set('flash policy port', 10843);
});

var contestants = [];
var contestantsinter = [];
var contestantsexp = [];
var scoreforsend;

io.sockets.on('connection', function (socket) {
  
  socket.on('message', function (data) {
    scoreforsend = Number(data);
    console.log("Transfered:" + " " + scoreforsend);
  });

  socket.on('requestscore', function(){
    socket.emit('sendscore', scoreforsend);
  });

  /*socket.emit('listContestantsInitClient', contestants);
  socket.emit('listContestantsInitInterClient', contestantsinter);
  socket.emit('listContestantsInitExpClient', contestantsexp);*/

  socket.on('listContestantsInit', function() {

    socket.emit('turnonmysql');

    var queryString1 = 'SELECT * FROM scores';
     
    connection.query(queryString1, function(err, rows, fields) {
        if (err) throw err;
     
        for (var i in rows) {
            contestants[i] = rows[i];
        }
    });

    socket.emit('onContestantsListed', contestants);
    socket.emit('turnoffmysql');
  });

  socket.on('listContestantsInitInter', function() {

    socket.emit('turnonmysql');

    var queryString2 = 'SELECT * FROM scoresinter';
     
    connection.query(queryString2, function(err, rows, fields) {
        if (err) throw err;
     
        for (var i in rows) {
            contestantsinter[i] = rows[i];
        }
    });

    socket.emit('onContestantsListedInter', contestantsinter);
    socket.emit('turnoffmysql');
  });

  socket.on('listContestantsInitExp', function() {

      socket.emit('turnonmysql');

      var queryString2 = 'SELECT * FROM scoresexp';
       
      connection.query(queryString2, function(err, rows, fields) {
          if (err) throw err;
       
          for (var i in rows) {
              contestantsexp[i] = rows[i];
          }
      });

      socket.emit('onContestantsListedExp', contestantsexp);
      socket.emit('turnoffmysql');
  });

  socket.on('turnonmysql', function(){
    connection.connect();
  });

  socket.on('turnoffmysql', function(){
    connection.end();
  });

  /*socket.on('sendingloc', function(data) {
    url = data;
    console.log(data);
  })*/

  /*var contestantstore = {id: "hello", display_name: "test", score: 1337};
  contestants.push(contestantstore);
  connection.query('INSERT INTO scores SET ?', contestantstore);*/

  socket.on('createContestant', function(data) {
    var contestantstore = {id: null, display_name: null, score: null};

    socket.emit('turnonmysql');
    /*ids.push(data.id);
    names.push(data.display_name);
    scores.push(score);*/
    contestantstore.id = data.id;
    contestantstore.display_name = data.display_name;
    contestantstore.score = data.score;

    contestants.push(contestantstore);
    connection.query('INSERT INTO scores SET ?', contestantstore);
    socket.emit('onContestantCreated', data);
    socket.emit('turnoffmysql');
  });

  socket.on('createContestantInter', function(data) {
    var contestantstore = {id: null, display_name: null, score: null};

    socket.emit('turnonmysql');
    /*ids.push(data.id);
    names.push(data.display_name);
    scores.push(score);*/
    contestantstore.id = data.id
    contestantstore.display_name = data.display_name;
    contestantstore.score = data.score;

    contestantsinter.push(contestantstore);
    connection.query('INSERT INTO scoresinter SET ?', contestantstore);
    socket.broadcast.emit('onContestantCreatedInter', data);
    socket.emit('turnoffmysql');
  });

  socket.on('createContestantExp', function(data) {
    var contestantstore = {id: null, display_name: null, score: null};

    socket.emit('turnonmysql');
    /*ids.push(data.id);
    names.push(data.display_name);
    scores.push(score);*/
    contestantstore.id = data.id
    contestantstore.display_name = data.display_name;
    contestantstore.score = data.score;

    contestantsexp.push(contestantstore);
    connection.query('INSERT INTO scoresexp SET ?', contestantstore);
    socket.broadcast.emit('onContestantCreatedExp', data);
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