var express = require('express');
var app = express();
var services = require('./index');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

var path = require('path');
var fs = require('fs-extra');
var shortid = require('shortid');
var urljoin = require('url-join');


exports.uploadImg = function(req) {
    var shortName = shortid.generate() + path.extname(req.files.file[0].name);
    var uploadsFolder = path.join(services.constants.ABSOLUTE_UPLOADS_FOLDER_URL, req.params.companyId, shortName);
    return new Promise(function(resolve/*, reject*/) {
        fs.move(req.files.file[0].path, uploadsFolder , function (err) {
            if (err) {
                resolve(err)
            } else {
                resolve(urljoin(req.protocol + ':', req.headers.host,services.constants.LOCAL_UPLOADS_FOLDER_URL, req.params.companyId, shortName))
            }
        });
    })

};
