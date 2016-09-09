#!/usr/bin/env node

/**
 * Module dependencies.
 */

var _ = require('lodash');
var http = require('http');
var app = require('./api/app');
var logger = require('log4js').getLogger('server');

// this adds 'finally' on promises that we sometimes need, like for cleanup of temp files etc..
require('promise.prototype.finally');

/**
 * Get port from environment and store in Express.
 */

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 9000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

/**
 * Create HTTP server.
 */
var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write("Welcome to Node.js on OpenShift!\n\n");
  response.end("Thanks for visiting us! \n");
});

//var server = app.listen(server_port, server_ip_address);
server.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address
      + ", server_port " + server_port);
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger.debug('Listening on ' + bind);
}
