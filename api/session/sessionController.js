'use strict';

/**
 * @module SessionController
 */
var Company = require('../company/companyModel.js');
var User = require('./../users/userModel');
var usersService = require('./../users/usersService');
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
  req.body.companyName = req.body.companyName.toLowerCase();

  companyService.findCompanyByName(req.body.companyName).then(function(isCompanyExist){
    if (!isCompanyExist) {
      services.errorService.handleError(res, "Invalid company", "You don't have access to this company", 400);
      return false
    }
    // find the user
    usersService.signInUser(req, res, isCompanyExist._id).then(function(result){
      res.send(result);
    });
  });
}
router.post('/signIn', signIn);


function signUp(req, res) {

  if(!req.body.email || !req.body.password || !req.body.companyName){
    services.errorService.handleError(res, "Empty blank", "Please fill all fields", 400);
    return false;
  }
  if(!validator.isEmail(req.body.email)){
    services.errorService.handleError(res, "Invalid email", "Email is invalid", 400);
    return false;
  }

  req.body.companyName = req.body.companyName.toLowerCase();
  var userData = new User(req.body);
  var companyData = new Company({companyName: req.body.companyName});

  usersService.signUpUser(req, res, userData, companyData).then(function(result){
    res.send(result);
  });
}
router.post('/signUp', signUp);

module.exports = router;


