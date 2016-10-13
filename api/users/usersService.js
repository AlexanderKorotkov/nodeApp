'use strict';

var User = require('./userModel');
var services = require('../services/index');
var _ = require('lodash');
var shortid = require('shortid');


exports.updateUserCompanyProfile = function(user){
    return new Promise(function(resolve, reject) {
        User.update({_id: user._id}, {$set: {companiesProfile: user.companiesProfile}},
            function (err, result) {
                if (err) throw err;
                resolve(result)
            }
        );
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
                    return s.companyInfo.companyId === companyId;
                });
                if(isCompanyExist){
                    exports.updateUser(company.profile, user._id, companyId, company.profile.avatar).then(function(result){
                        resolve(result)
                    })
                }else{
                    user.companiesProfile.push(company);
                    exports.updateUserCompanyProfile(user).then(function(result){
                        resolve(result)
                    })
                }
            }else{
                userData.password = shortid.generate();
                userData.companiesProfile.push(company);
                userData.save(function(err, user) {
                    if (err) throw err;
                    resolve(user)
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
                if(result.companyInfo.companyId === companyId){
                    if(avatar){
                        if(result.profile.avatar){
                            services.upload.deleteFile(result.profile.avatar.imagePath);
                            services.upload.deleteFile(result.profile.avatar.imageThumbPath);
                        }
                        userInfo.avatar = avatar;
                    }
                    if(_.size(userInfo) > 0){
                        result.profile = userInfo;
                    }else{
                        user.companiesProfile.splice(user.companiesProfile.indexOf(result), 1);
                    }

                }
            });
            exports.updateUserCompanyProfile(user).then(function(result){
                resolve(result)
            });
        });
    });
};

exports.fetchUsers = function (companyId){
    return new Promise(function(resolve, reject) {
        User.find({
            "companiesProfile.companyInfo.companyId": companyId
        }, function(err, user) {
            if (err) throw err;
            var profilesList = [];
            _.each(user, function(data){
                _.each(data.companiesProfile, function(result){
                    if(result.companyInfo.companyId === companyId && result.profile){
                        var userProfile =_.merge({userId: data._id},result.profile);
                        profilesList.push(userProfile);
                    }
                })
            });
            resolve(profilesList)
        });
    });
};

exports.deleteUser = function (userId, avatar){
    return new Promise(function(resolve, reject) {
        User.remove({
            _id: userId
        }, function(err) {
            if (err) throw err;
            if(avatar !== 'null'){
                services.upload.deleteFile(avatar.imagePath);
                services.upload.deleteFile(avatar.imageThumbPath);
            }
            resolve();
        });
    });
};

exports.getUserCompanyList = function (userId){
    return new Promise(function(resolve, reject) {
        User.findOne({
            _id: userId
        }, function(err, user) {
            if (err) throw err;
            resolve(user);
        });
    });
};
exports.selectCompany = function (userId, companyInfo){
    return new Promise(function(resolve, reject) {
        User.findOne({
            _id: userId
        }, function(err, user) {
            if (err) throw err;
            var isAdmin = _.find(user.companiesProfile,function(result){
                if(result.companyInfo.companyId === companyInfo.companyId){
                    return result.isAdmin
                }
            });

            if(isAdmin){
                companyInfo.isAdmin = true;
            }else{
                companyInfo.isAdmin = false
            }
            User.update({_id: user._id}, {$set: {currentCompany: companyInfo}},
                function (err, result) {
                    if (err) throw err;
                    resolve(companyInfo)
                }
            );
        });
    });
};




