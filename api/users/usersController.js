'use strict';

/**
 * @module UsersController
 */

var User = require('./userModel.js');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var multipart = require('connect-multiparty');
var fs = require('fs-extra');
var path = require('path');

var saveNewUser = function (req, res, avatar, companyId){
    var newUser = {profile :_.merge(req.body.user, {avatar: avatar}), companyId:companyId};
    var userData = new User({email : req.body.user.email});
    User.find({
        email : req.body.user.email
    }, function(err, user) {
        if (err) throw err;
        if(_.size(user) > 0){
            services.errorService.handleError(res, "User exist", " Email already exist", 400);
            return false;
        }
        userData.companiesProfile.push(newUser);
        userData.save(function(err) {
            if (err) throw err;
            res.send({
                message:'User was created'
            });
        });
    });
};

var removeFile = function (path){
    fs.exists(path, function(exists) {
        if(exists) {
            fs.unlink(path, function(err){
                if (err) throw err;
            });
        } else {
            console.log('File not found, so not deleting.');
        }
    });
};


function updateUser(req, res, avatar){
    User.findById( req.body.userId , function(err) {
        if (err) throw err;
    }).then(function(user){
        _.each(user.companiesProfile, function(result){
            if(result.companyId === req.params.companyId && result.profile){
                result.profile = req.body.user;
                if(avatar){
                    removeFile(result.profile.avatar.imagePath);
                    //removeFile(result.profile.avatar.imageThumbPath);
                    result.profile.avatar = avatar;
                }
            }
        });

        User.update( {_id:req.body.userId}, {$set:{companiesProfile : user.companiesProfile}},
            function(err, result){
                if (err) throw err;
                res.send({
                    data: result
                })
            }
        )
    });
}


function addUser(req, res) {
    if(req.files.file){
        services.upload.uploadImg(req).then(function(avatar){
            saveNewUser(req, res, avatar, req.params.companyId);
        });
    }else{
        saveNewUser(req, res, null, req.params.companyId);
    }


}
router.post('/:companyId/create', services.token.checkToken, services.permissions.isAdmin, multipart(), addUser);


function editUser(req, res) {
    if(_.size(req.files) > 0){
        services.upload.uploadImg(req).then(function(avatar){
            updateUser(req, res, avatar);
        });
    }else{
        updateUser(req, res, null);
    }
}
router.post('/:companyId/update', services.token.checkToken,services.permissions.isAdmin, multipart(), editUser);

function fetchUsers(req, res) {
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
        res.send({
            data: profilesList
        });
    });
}
router.get('/:companyId/fetchUsers', services.token.checkToken, fetchUsers);

function removeUser(req, res) {
    User.remove({
         _id: req.body.user.userId
    }, function(err) {
        if (err) throw err;
        if(req.body.user.avatar){
            removeFile(req.body.user.avatar.imagePath);
            //removeFile(req.body.user.avatar.imageThumbPath);
        }
        res.send({
            message:'User was removed'
        });
    });
}
router.post('/:companyId/removeUser', services.token.checkToken, services.permissions.isAdmin, removeUser);


module.exports = router;


