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
    if(req.files.file){
        services.upload.uploadImg(req).then(function(avatar){
            usersService.saveNewUser(req, res, avatar, req.params.companyId).then(function(result){
                res.send({
                    data: result
                })
            });
        });
    }else{
        usersService.saveNewUser(req, res, null, req.params.companyId).then(function(){
            res.send({
                message:'User was created'
            });
        });
    }
}
router.post('/:companyId/create', services.token.checkToken, services.permissions.isAdmin, multipart(), addUser);


function editUser(req, res) {
    if(_.size(req.files) > 0){
        services.upload.uploadImg(req).then(function(avatar){
            usersService.updateUser(req, res, avatar).then(function(result){
                res.send({
                    data:result
                });
            });
        });
    }else{
        usersService.updateUser(req, res, null).then(function(result){
            res.send({
                data:result
            });
        });
    }
}
router.post('/:companyId/update', services.token.checkToken,services.permissions.isAdmin, multipart(), editUser);

function fetchUsers(req, res) {
    usersService.fetchUsers(req, res).then(function(result){
        res.send({
            data:result
        });
    });
}
router.get('/:companyId/fetchUsers', services.token.checkToken, fetchUsers);

function removeUser(req, res) {
    usersService.removeUser(req, res).then(function(result){
        res.send({
            message:'User was removed'
        });
    });
}
router.post('/:companyId/removeUser', services.token.checkToken, services.permissions.isAdmin, removeUser);


module.exports = router;


