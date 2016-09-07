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
var path = require('path');
var fs = require('fs-extra');
var shortid = require('shortid');

function addMember(req, res) {
    //console.log(req.headers)
    var shortName = shortid.generate() + path.extname(req.files.file[0].name);
    var uploadsFolder = path.join(services.constants.ABSOLUTE_UPLOADS_FOLDER_URL, req.params.companyId, shortName);
    fs.move(req.files.file[0].path, uploadsFolder , function (err) {
        if (err) throw err;
        var imageUrl = path.join(req.headers.host,services.constants.LOCAL_UPLOADS_FOLDER_URL, req.params.companyId, shortName);
        var member = new Members(_.merge(req.body.member, {companyId:req.params.companyId, imageUrl: imageUrl}));
         member.save( function(err, result) {
             if (err) throw err;
             res.send({
                 message: 'Company members was created!',
                 data: result
             });
         })
    });
}
router.post('/:companyId/create', services.token.checkToken, multipart(), addMember);

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
        fs.unlink(path.join(services.constants.PROJECT_ROOT_FOLDER, req.body.member.imageUrl), (err) => {
            if (err) throw err;
            res.send({
                message:'Member was removed'
            });
        });
    });
}
router.post('/:companyId/removeMember', services.token.checkToken, removeMember);


module.exports = router;


