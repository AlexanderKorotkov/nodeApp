var express = require('express');
var router = express.Router();
var User = require('../session/userModel');
var services = require('./index');

exports.isAdmin = function(req, res, next) {
    User.findOne({
        _id :req.decoded._id
    }, function(err, user) {
        if (err) throw err;
        if(!user.admin){
            services.errorService.handleError(res, 'Wrong admin','You are not an admin!!!', 401);
        }else{
            next();
        }
    });
};


