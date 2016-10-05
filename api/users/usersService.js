'use strict';

var User = require('./userModel');
var services = require('../services/index');
var _ = require('lodash');

exports.signInUser = function (req, res, companyId){
    return new Promise(function(resolve, reject) {
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

            // if user is found, password and secret key is right
            // create a token

            var token = services.token.signToken({_id: user._id}, req.body.client_secret);
            if(!token){
                services.errorService.handleError(res, "Invalid secret key", "Invalid secret key", 400);
            }else{
                // return the information including token as JSON
                resolve({
                    token: token,
                    user: { email: user.email, _id: user._id, admin: user.admin, companyId: companyId },
                    companyId: user.companyId
                });
            }
        });
    });
};

exports.signUpUser = function (req, res, userData, companyData){
    return new Promise(function(resolve, reject) {
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
                        resolve({message:'Company was created'})
                    });
                });
            }
        });
    });
};

exports.saveNewUser = function (req, res, avatar, companyId){
    var company = {profile :_.merge(req.body.user, {avatar: avatar}), companyId:companyId};
    var userData = new User({email : req.body.user.email});
    return new Promise(function(resolve, reject) {
        User.findOne({
            email : req.body.user.email
        }, function(err, user) {
            if (err) throw err;
            if(_.size(user) > 0){
                var isCompanyExist = _.find(user.companiesProfile, function(s){
                    return s.companyId === companyId
                });
                if(isCompanyExist){
                    services.errorService.handleError(res, "User exist", " Email already exist", 400);
                    return false;
                }
                user.companiesProfile.push(company);
                User.update( {_id: user._id}, {$set:{companiesProfile : user.companiesProfile}},
                    function(err, result){
                        if (err) throw err;
                        resolve(result)
                    }
                )
            }else{
                userData.companiesProfile.push(company);
                userData.save(function(err) {
                    if (err) throw err;
                    resolve()
                });
            }
        });
    });
};

exports.updateUser = function (req, res, avatar){
    return new Promise(function(resolve, reject) {
        User.findById( req.body.userId , function(err) {
            if (err) throw err;
        }).then(function(user){
            _.each(user.companiesProfile, function(result){
                if(result.companyId === req.params.companyId && result.profile){
                    result.profile = req.body.user;
                    if(avatar){
                        services.upload.deleteFile(result.profile.avatar.imagePath);
                        //services.upload.deleteFile(result.profile.avatar.imageThumbPath);
                        result.profile.avatar = avatar;
                    }
                }
            });

            User.update( {_id:req.body.userId}, {$set:{companiesProfile : user.companiesProfile}},
                function(err, result){
                    if (err) throw err;
                    resolve(result)
                }
            )
        });
    });
};

exports.fetchUsers = function (req, res){
    return new Promise(function(resolve, reject) {
        User.find({
            "companiesProfile.companyId": req.params.companyId
        }, function(err, user) {
            if (err) throw err;
            var profilesList = [];
            _.each(user, function(data){
                _.each(data.companiesProfile, function(result){
                    if(result.companyId === req.params.companyId && result.profile){
                        var userProfile =_.merge({userId: data._id},result.profile);
                        profilesList.push(userProfile);
                    }
                })
            });
            resolve(profilesList)
        });
    });
};

exports.removeUser = function (req, res){
    return new Promise(function(resolve, reject) {
        User.remove({
            _id: req.body.user.userId
        }, function(err) {
            if (err) throw err;
            if(req.body.user.avatar){
                services.upload.deleteFile(req.body.user.avatar.imagePath);
                //services.upload.deleteFile(req.body.user.avatar.imageThumbPath);
            }
            resolve();
        });
    });
};




