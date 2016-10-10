'use strict';

/**
 * @module UsersController
 */

var User = require('./userModel');
var usersService = require('./usersService');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var multipart = require('connect-multiparty');

function addUser(req, res) {
    var userData = new User({email : req.body.user.email});
    var user = req.body.user;
    var email = req.body.user.email;
    var companyId = req.params.companyId;
    var files = req.files;

    if(_.size(files) > 0){
        var protocol = req.protocol;
        var host = req.headers.host;
        services.upload.uploadImg(files.file[0], companyId, protocol, host).then(function(avatar){
            var company = {profile :_.merge(user, {avatar: avatar}), companyId:companyId};
            usersService.saveNewUser(company, userData,email, companyId).then(function(result){
                res.send({
                    data: result
                })
            },function(err){
                services.errorService.handleError(res, err.reason, err.message, 400);
            });
        });
    }else{
        var company = {profile :_.merge(user, {avatar: null}), companyId:companyId};
        usersService.saveNewUser(company, userData,email, companyId).then(function(result){

            services.email.sendPassword(result);

            res.send({
                message:'User was created'
            })
        },function(err){
            services.errorService.handleError(res, err.reason, err.message, 400);
        });
    }
}
router.post('/:companyId/create', services.token.checkToken, services.permissions.isAdmin, multipart(), addUser);


function editUser(req, res) {
    var user = req.body.user;
    var companyId = req.params.companyId;
    var userId = req.body.userId;
    var files = req.files;

    if(_.size(files) > 0){
        var protocol = req.protocol;
        var host = req.headers.host;
        services.upload.uploadImg(files.file[0], companyId, protocol, host).then(function(avatar){
            usersService.updateUser(user, userId, companyId, avatar).then(function(result){
                res.send({
                    data:result
                });
            });
        });
    }else{
        usersService.updateUser(user, userId, companyId, null).then(function(result){
            res.send({
                data:result
            });
        });
    }
}
router.post('/:companyId/update', services.token.checkToken,services.permissions.isAdmin, multipart(), editUser);

function fetchUsers(req, res) {
    var companyId = req.params.companyId;
    usersService.fetchUsers(companyId).then(function(result){
        res.send({
            data:result
        });
    });
}
router.get('/:companyId/fetchUsers', services.token.checkToken, fetchUsers);

function removeUserFromCompany(req, res) {
    var companyId = req.params.companyId;
    var userId = req.body.user.userId;
    var avatar = req.body.user.avatar;
    usersService.updateUser({}, userId, companyId, avatar).then(function(result){
        res.send({
            data:result
        });
    });
}
router.post('/:companyId/removeUser', services.token.checkToken, services.permissions.isAdmin, removeUserFromCompany);


function deleteUser(req, res) {
    var userId = req.body.user.userId;
    var avatar = req.body.user.avatar;
    usersService.deleteUser(userId, avatar).then(function(result){
        res.send({
            data:result
        });
    });
}
router.post('/:companyId/deleteUser', services.token.checkToken, services.permissions.isAdmin, deleteUser);

module.exports = router;


