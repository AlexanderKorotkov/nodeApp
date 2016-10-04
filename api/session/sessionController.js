'use strict';

/**
 * @module SessionController
 */
var Company = require('../company/companyModel.js');
var User = require('./../users/userModel');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var validator = require('validator');
var _ = require('lodash');

function signIn(req, res) {

  if(!req.body.email || !req.body.password || !req.body.companyName){
    services.errorService.handleError(res, "Empty blank", "Please fill all fields", 400);
    return false;
  }
  req.body.companyName = req.body.companyName.toLowerCase();

  var isCompanyExist;
  Company.findOne({
    companyName: req.body.companyName
  }, function(err, company) {
    if (err) throw err;
    isCompanyExist = company;
  });

  // find the user
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      services.errorService.handleError(res, "Invalid user", "Authentication failed. User, Email or Company Name not found", 400);
      return false;
    }
    // check if password matches
    if (user.password !== req.body.password) {
      services.errorService.handleError(res, "Invalid user password", "Authentication failed. User not found or wrong password.", 400);
      return false;
    }

    if (!isCompanyExist) {
      services.errorService.handleError(res, "Invalid company", "You don't have access to this company", 400);
      return false
    }
      // if user is found, password and secret key is right
      // create a token

    var token = services.token.signToken({_id: user._id}, req.body.client_secret);
    if(!token){
      services.errorService.handleError(res, "Invalid secret key", "Invalid secret key", 400);
    }else{
      // return the information including token as JSON
      res.send({
        token: token,
        user: { email: user.email, _id: user._id, admin: user.admin, companyId: isCompanyExist._id },
        companyId: user.companyId
      });
    }
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

  User.findOne({
    email: req.body.email
  }, function(err, user) {

    if (err) throw err;
    if (user) {
      services.errorService.handleError(res, "User exist", "Username, Email or Company Name already exist", 400);
    } else {
      companyData.save(function(err, result) {
        if (err) throw err;
        userData.companiesProfile.push({companyId : result._id});
        userData.admin = true;
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


