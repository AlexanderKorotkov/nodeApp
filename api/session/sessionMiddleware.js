// get an instance of the router for api routes
var jwt  = require('jsonwebtoken'); // used to create, sign, and verify tokens
var express = require('express');
var app = express();
var conf = require('../conf');
var services = require('../services/index');

exports.checkToken = function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
  services.token.verifyToken(token).then(function(result){
    if(result.name === 'TokenExpiredError'){
      services.errorService.handleError(res, 'invalid Token','Failed to authenticate token.', 400);
    }else{
      req.decoded = result;
      next();
    }
  });
  } else {
     //if there is no token
     //return an error
    return services.errorService.handleError(res, 'No token provided','No token provided.', 403);
  }
};

