var express = require('express');
var app = express();
var services = require('./index');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

app.set('superSecret', services.conf.secret);

exports.signToken = function(user, secret) {
    if(secret !== app.get('superSecret')){
        return false;
    }else{
        return  jwt.sign(user, app.get('superSecret'), {
            expiresIn: '60m' // expires in 24 hours
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
