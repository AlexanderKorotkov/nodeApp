'use strict';

var User = require('./userModel');
var services = require('../services/index');
var _ = require('lodash');

exports.signInUser = function (password, email, client_secret, companyId){
    return new Promise(function(resolve, reject) {
        User.findOne({
            email: email
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                reject({reason: 'Invalid user', message:'Authentication failed. User, Email or Company Name not found'});
                return;
            }
            // check if password matches
            if (user.password !== password) {
                reject({reason: 'Invalid user password', message:'Authentication failed. User not found or wrong password'});
                return;
            }

            // if user is found, password and secret key is right
            // create a token

            var token = services.token.signToken({_id: user._id}, client_secret);
            if(!token){
                reject({reason: 'Invalid secret key', message:'Invalid secret key'});
                return;
            }
            // return the information including token as JSON
            resolve({
                token: token,
                user: { email: user.email, _id: user._id, admin: user.admin, companyId: companyId },
                companyId: user.companyId
            });
        });
    });
};

exports.signUpUser = function (req, email, userData, companyData){
    return new Promise(function(resolve, reject) {
        User.findOne({
            email: email
        }, function(err, user) {
            if (err) throw err;
            if (user) {
                reject({reason: 'User exist', message:'Username, Email or Company Name already exist'});
                return;
            }
            companyData.save(function(err, result) {
                if (err) throw err;
                userData.companiesProfile.push({companyId : result._id});
                userData.admin = true;
                userData.save(function(err) {
                    if (err) throw err;
                    resolve({message:'Company was created'})
                });
            });
        });
    });
};

exports.updateUserCompanyProfile = function(user, company){
    return new Promise(function(resolve, reject) {
        user.companiesProfile.push(company);
        User.update({_id: user._id}, {$set: {companiesProfile: user.companiesProfile}},
            function (err, result) {
                if (err) throw err;
                resolve(result)
            }
        )
    });
};

exports.saveNewUser = function (company, userData, email, companyId){
    return new Promise(function(resolve, reject) {
        User.findOne({
            email: email
        }, function(err, user) {
            if (err) throw err;
            if(_.size(user) > 0){
                var isCompanyExist = _.find(user.companiesProfile, function(s){
                    return s.companyId === companyId
                });
                console.log(isCompanyExist)
                if(isCompanyExist){
                    reject({reason: 'User exist', message:'Email already exist'});
                    services.upload.deleteFile(company.profile.avatar.imagePath);
                    services.upload.deleteFile(company.profile.avatar.imageThumbPath);
                    return;
                }
                exports.updateUserCompanyProfile(user, company).then(function(result){
                    resolve(result)
                })
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

exports.updateUser = function (userInfo, userId, companyId, avatar){
    return new Promise(function(resolve, reject) {
        User.findById( userId , function(err) {
            if (err) throw err;
        }).then(function(user){
            _.each(user.companiesProfile, function(result){
                if(result.companyId === companyId && result.profile){
                    if(avatar){
                        services.upload.deleteFile(result.profile.avatar.imagePath);
                        services.upload.deleteFile(result.profile.avatar.imageThumbPath);
                        result.profile.avatar = avatar;
                    }
                    result.profile = userInfo;
                }
            });

            User.update( {_id: userId}, {$set:{companiesProfile : user.companiesProfile}},
                function(err, data){
                    if (err) throw err;
                    resolve(data)
                }
            )
        });
    });
};

exports.fetchUsers = function (companyId){
    return new Promise(function(resolve, reject) {
        User.find({
            "companiesProfile.companyId": companyId
        }, function(err, user) {
            if (err) throw err;
            var profilesList = [];
            _.each(user, function(data){
                _.each(data.companiesProfile, function(result){
                    if(result.companyId === companyId && result.profile){
                        var userProfile =_.merge({userId: data._id},result.profile);
                        profilesList.push(userProfile);
                    }
                })
            });
            resolve(profilesList)
        });
    });
};

exports.removeUser = function (userId, avatar){
    return new Promise(function(resolve, reject) {
        User.remove({
            _id: userId
        }, function(err) {
            if (err) throw err;
            if(avatar !== 'null'){
                console.log(123)
                services.upload.deleteFile(avatar.imagePath);
                services.upload.deleteFile(avatar.imageThumbPath);
            }
            resolve();
        });
    });
};




