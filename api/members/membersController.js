'use strict';

/**
 * @module MembersController
 */

var Members = require('./membersModel');
var User = require('../session/userModel.js');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var multipart = require('connect-multiparty');
var fs = require('fs-extra');
var path = require('path');

var saveNewMemeber = function (req, res, avatar, companyId){
    var newUser = {profile :_.merge(req.body.member, {avatar: avatar}), companyId:companyId};
    var userData = new User({email : req.body.member.email});
    User.find({
        email : req.body.member.email
    }, function(err, user) {
        if (err) throw err;
        if(_.size(user) > 0){
            if(avatar){
                services.upload.uploadImg(req).then(function(avatar){
                    updateMember(req, res, avatar);
                });
            }else{
                updateMember(req, res, null);
            }
            return false;
        }
        userData.companiesProfile.push(newUser);
        userData.save(function(err) {
            if (err) throw err;
            res.send({
                message:'ok'
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


function updateMember(req, res, avatar){
    User.findById( req.body.memberId , function(err) {
        if (err) throw err;
    }).then(function(user){
        _.each(user.companiesProfile, function(result){
            if(result.companyId === req.params.companyId && result.profile){
                result.profile = req.body.member;
                result.profile.avatar = avatar;
            }
        });
        User.update( {_id:req.body.memberId}, {$set:{companiesProfile : user.companiesProfile}},
            function(err, result){
                if (err) throw err;
                res.send({
                    data: result
                })
            }
        )
    });
}


function addMember(req, res) {
    if(req.files.file){
        services.upload.uploadImg(req).then(function(avatar){
            saveNewMemeber(req, res, avatar, req.params.companyId);
        });
    }else{
        saveNewMemeber(req, res, null, req.params.companyId);
    }


}
router.post('/:companyId/create', services.token.checkToken, services.permissions.isAdmin, multipart(), addMember);


function editMember(req, res) {
    if(_.size(req.files) > 0){
        services.upload.uploadImg(req).then(function(avatar){
            updateMember(req, res, avatar);
        });
    }else{
        updateMember(req, res, null);
    }
}
router.post('/:companyId/update', services.token.checkToken,services.permissions.isAdmin, multipart(), editMember);

function fetchMembers(req, res) {
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
router.get('/:companyId/fetchMembers', services.token.checkToken, fetchMembers);

function removeMember(req, res) {
    User.remove({
         _id: req.body.member.userId
    }, function(err) {
        if (err) throw err;
        if(req.body.member.avatar){
            removeFile(req.body.member.avatar.imagePath);
            removeFile(req.body.member.avatar.imageThumbPath);
        }
        res.send({
            message:'Member was removed'
        });
    });
}
router.post('/:companyId/removeMember', services.token.checkToken, services.permissions.isAdmin, removeMember);


module.exports = router;


