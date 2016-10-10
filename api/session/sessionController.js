'use strict';

/**
 * @module SessionController
 */
var Company = require('../company/companyModel.js');
var User = require('./../users/userModel');
var sessionService = require('./sessionService');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var validator = require('validator');
var _ = require('lodash');
var companyService = require('../company/companyService');

function signIn(req, res) {

  if(!req.body.email || !req.body.password || !req.body.companyName){
    services.errorService.handleError(res, "Empty blank", "Please fill all fields", 400);
    return false;
  }

  var companyName = req.body.companyName.toLowerCase();
  var email = req.body.email;
  var password = req.body.password;
  var client_secret = req.body.client_secret;

  companyService.findCompanyByName(companyName).then(function(isCompanyExist){
    if (!isCompanyExist) {
      services.errorService.handleError(res, 'Invalid company', 'You do not have access to this company', 400);
      return false
    }
    // find the user
    sessionService.signInUser(password, email, client_secret, isCompanyExist._id).then(function(result){
      res.send(result);
    },function(err){
      services.errorService.handleError(res, err.reason, err.message, 400);
    });
  });
}
router.post('/signIn', signIn);

function updatePassword(req, res) {

  var oldPassword = req.body.passwordData.oldPassword;
  var newPassword = req.body.passwordData.newPassword;
  var repeatPassword = req.body.passwordData.repeatPassword;
  var userId = req.body.userId;

  if(newPassword !== repeatPassword){
    services.errorService.handleError(res, "Passwords do not match", "Passwords do not match", 400);
    return false;
  }

  sessionService.updatePassword(oldPassword, newPassword, userId).then(function(){

    res.send({
      message: 'Password was changed'
    });
  },function(err){
    services.errorService.handleError(res, err.reason, err.message, 400);
  });
}
router.post('/updatePassword', services.token.checkToken, updatePassword);


function signUp(req, res) {

  if(!req.body.email || !req.body.password || !req.body.companyName){
    services.errorService.handleError(res, 'Empty blank', 'Please fill all fields', 400);
    return false;
  }
  if(!validator.isEmail(req.body.email)){
    services.errorService.handleError(res, 'Invalid email', 'Email is invalid', 400);
    return false;
  }

  var companyName = req.body.companyName.toLowerCase();
  var email = req.body.email;
  var userData = new User(req.body);
  var companyData = new Company({companyName: companyName});

  sessionService.signUpUser(email, userData, companyData).then(function(result){
    res.send(result);
  },function(err){
    services.errorService.handleError(res, err.reason, err.message, 400);
  });
}
router.post('/signUp', signUp);

module.exports = router;


