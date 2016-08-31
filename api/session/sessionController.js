'use strict';

/**
 * @module SessionController
 */

var User = require('./UserModel');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var validator = require('validator');

function signIn(req, res) {

  if(!req.body.username || !req.body.password){
    services.errorService.handleError(res, "Empty blank", "Please fill all fields", 400);
    return false;
  }

  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      services.errorService.handleError(res, "Invalid user input", "Authentication failed. User not found or wrong password.", 400);
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        services.errorService.handleError(res, "Invalid user input", "Authentication failed. User not found or wrong password.", 400);
      } else {

        // if user is found, password and secret key is right
        // create a token
        var token = services.token.signToken(user, req.body.client_secret);
        if(!token){
          services.errorService.handleError(res, "Invalid secret key", "Invalid secret key", 400);
        }else{
          // return the information including token as JSON
          res.send({
            token: token,
            user: {username: user.username, email: user.email, _id: user._id }
          });
        }
      }
    }
  });
}
router.post('/signIn', signIn);


function signUp(req, res) {

  if(!req.body.username || !req.body.email || !req.body.password){
    services.errorService.handleError(res, "Empty blank", "Please fill all fields", 400);
    return false;
  }
  if(!validator.isEmail(req.body.email)){
    services.errorService.handleError(res, "Invalid email", "Email is invalid", 400);
    return false;
  }
  var userData = new User(req.body);

  User.findOne({
    $or: [ {username: req.body.username }, {email: req.body.email } ]
  }, function(err, user) {
    if (err) throw err;
    if (user) {
      services.errorService.handleError(res, "User exist", "Username or Email already exist", 400);
    } else {
      userData.save(function(err) {
        if (err) throw err;
        res.send({
          message: 'Account was created!'
        });
      });
    }
  });

}
router.post('/signUp', signUp);

module.exports = router;


