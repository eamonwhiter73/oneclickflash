'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

var net = require('net');
var mySocket;

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

var server = net.createServer(function(c) { //'connection' listener
  mySocket = c;
  console.log('server connected');
  mySocket.on('connect', function() {
    console.log('server connected');
  });
  mySocket.on("data", onData);
});
server.listen(8080, function() { //'listening' listener
  console.log('server bound');
});

var pf = require('policyfile').createServer();

pf.listen(10843, function(){
  console.log(':3 yay')
});

function onConnect()
{
  console.log("Connected to Flash");
}

// When flash sends us data, this method will handle it
function onData(d)
{
  
  
    console.log("Y position of goober(avatar) = " + d);
    var tempD=parseInt(d);
    //var dType=typeof tempD;
    tempD=tempD*2;

    
    //console.log(tempD + "is a " + dType);
    //tempD=tempD+/0;


        //add null byte at end to conform to XMLSocket process. there are other sockets we can use, this is one.
    mySocket.write(tempD+"\0", 'utf8');
  
}

server.addListener("error",function(err){});

// Start server
app.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;