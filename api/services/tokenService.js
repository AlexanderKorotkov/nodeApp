var express = require('express');
var app = express();
var services = require('./index');
var jwt    = require('jsonwebtoken');

app.set('superSecret', services.conf.secret);

exports.signToken = function(user, secret) {
    if(secret !== app.get('superSecret')){
        return false;
    }else{
        return  jwt.sign(user, app.get('superSecret'), {
            expiresIn: '24h' // expires in 24 hours
        });
    }
};

exports.verifyToken = function(token) {
  return new Promise(function(resolve/*, reject*/) {
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
     if (err) {
       resolve(err)
     } else {
       resolve(decoded)
    }
    });
  })
};

exports.checkToken = function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['authorization'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        services.token.verifyToken(token).then(function(result){
            if(result.name === 'TokenExpiredError'){
                services.errorService.handleError(res, 'invalid Token','Failed to authenticate token.', 403);
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
