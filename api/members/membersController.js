'use strict';

/**
 * @module MembersController
 */

var Members = require('./membersModel');
var services = require('../services/index');
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var multipart = require('connect-multiparty');
var fs = require('fs-extra');
var path = require('path');

var saveNewMemeber = function (req, res, imageUrl){
    var member = new Members(_.merge(req.body.member, {companyId:req.params.companyId, imageUrl: imageUrl}));
    member.save( function(err, result) {
        if (err) throw err;
        res.send({
            message: 'Company member was created!',
            data: result
        });
    })
};


function updateMember(req, res, imageUrl){
    Members.findById( req.body.memberId , function(err, member) {
        if (err) throw err;
        services.utils.updateDocument(member, Members, req.body.member);
        member.imageUrl = imageUrl;
        member.save(function(err) {
            if (err) throw err;
            res.send({
                data: member
            });
        });
    });
}

/**
 *
 * @description
 *
 * @param req
 * @param res
 */

function addMember(req, res) {
    if(req.files.file){
        services.upload.uploadImg(req).then(function(imageUrl){
            saveNewMemeber(req, res, imageUrl);
        });
    }else{
        saveNewMemeber(req, res, null);
    }


}
router.post('/:companyId/create', services.token.checkToken, multipart(), addMember);


function editMember(req, res) {
    if(req.files){
        services.upload.uploadImg(req).then(function(imageUrl){
            updateMember(req, res, imageUrl);
        });
    }else{
        updateMember(req, res, null);
    }
}
router.post('/:companyId/update', services.token.checkToken, multipart(), editMember);

function fetchMembers(req, res) {
    Members.find({
        companyId : req.params.companyId
    }, function(err, members) {
        if (err) throw err;
        res.send({
            data: members
        });
    });
}
router.get('/:companyId/fetchMembers', services.token.checkToken, fetchMembers);

function removeMember(req, res) {
    Members.remove({
        $and:[ {'companyId' : req.params.companyId}, {_id: req.body.member._id } ]
    }, function(err) {
        if (err) throw err;
        if(req.body.member.imageUrl){
            fs.unlink(path.join(services.constants.PROJECT_ROOT_FOLDER, req.body.member.imageUrl), (err) => {
                if (err) throw err;
                res.send({
                    message:'Member was removed'
                });
            });
        }else{
            res.send({
                message:'Member was removed'
            });
        }

    });
}
router.post('/:companyId/removeMember', services.token.checkToken, removeMember);


module.exports = router;


