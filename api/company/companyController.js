'use strict';

/**
 * @module SessionController
 */
var Company = require('./companyModel');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var validator = require('validator');
var _ = require('lodash');
var companyService = require('./companyService');


function create(req, res) {

  var companyName = req.body.companyData.companyName;
  var companyNameRepeat = req.body.companyData.companyNameRepeat;
  var userId = req.body.userId;

    if(!companyName){
        services.errorService.handleError(res, "Company name is empty", "Company name is empty", 400);
        return false;
    }

  if(companyName !== companyNameRepeat){
    services.errorService.handleError(res, "Companies names do not match", "Companies names do not match", 400);
    return false;
  }

  companyService.create(companyName, userId).then(function(){
    res.send({
      message: 'Company was created'
    });
  },function(err){
    services.errorService.handleError(res, err.reason, err.message, 400);
  });
}
router.post('/create', services.token.checkToken, create);

function getUserCompanyList(req, res) {

    var userId = req.params.userId;
    companyService.getUserCompanyList(userId).then(function(result){
        res.send(
            result
        );
    });
}
router.get('/:userId/getUserCompanyList', services.token.checkToken, getUserCompanyList);


module.exports = router;


