'use strict';

/**
 * @module SessionController
 */
var Company = require('../company/index');
var User = require('./userModel');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var validator = require('validator');

function signIn(req, res) {

  if(!req.body.username || !req.body.password || !req.body.companyName){
    services.errorService.handleError(res, "Empty blank", "Please fill all fields", 400);
    return false;
  }
  req.body.username = req.body.username.toLowerCase();
  req.body.companyName = req.body.companyName.toLowerCase();
  // find the user
  User.findOne({
    $and: [ {username: req.body.username }, {companyName: req.body.companyName } ]
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      services.errorService.handleError(res, "Invalid user", "Authentication failed. User, Email or Company Name not found", 400);
    } else if (user) {

      // check if password matches
      if (user.password !== req.body.password) {
        services.errorService.handleError(res, "Invalid user password", "Authentication failed. User not found or wrong password.", 400);
      } else {

        // if user is found, password and secret key is right
        // create a token

        var token = services.token.signToken({_id: user._id}, req.body.client_secret);
        if(!token){
          services.errorService.handleError(res, "Invalid secret key", "Invalid secret key", 400);
        }else{
          // return the information including token as JSON
          res.send({
            token: token,
            user: {username: user.username, email: user.email, _id: user._id, admin: user.admin },
            companyId: user.companyId
          });
        }
      }
    }
  });
}
router.post('/signIn', signIn);


function signUp(req, res) {

  if(!req.body.username || !req.body.email || !req.body.password || !req.body.companyName){
    services.errorService.handleError(res, "Empty blank", "Please fill all fields", 400);
    return false;
  }
  if(!validator.isEmail(req.body.email)){
    services.errorService.handleError(res, "Invalid email", "Email is invalid", 400);
    return false;
  }
  req.body.username = req.body.username.toLowerCase();
  req.body.companyName = req.body.companyName.toLowerCase();

  var userData = new User(req.body);

  var companyData = new Company.model({companyName: req.body.companyName});

  User.findOne({
    $or: [ {username: req.body.username }, {email: req.body.email }, {companyName: req.body.companyName } ]
  }, function(err, user) {
    if (err) throw err;
    if (user) {
      services.errorService.handleError(res, "User exist", "Username, Email or Company Name already exist", 400);
    } else {
      companyData.save(function(err, result) {
        if (err) throw err;
        userData.companyId = result._id;
        userData.save(function(err) {
          if (err) throw err;
          res.send({
            message:'ok'
          });
        });
      });
    }
  });

}
router.post('/signUp', signUp);

module.exports = router;


