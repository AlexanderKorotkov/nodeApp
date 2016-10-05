var express = require('express');
var app = express();
var services = require('./index');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

var path = require('path');
var fs = require('fs-extra');
var shortid = require('shortid');
var urljoin = require('url-join');
var im = require('imagemagick');

exports.uploadImg = function(req) {
    var shortName = shortid.generate() + path.extname(req.files.file[0].name);
    var avatarPath = path.join(services.constants.ABSOLUTE_UPLOADS_FOLDER_URL, req.params.companyId, shortName);
    var avatarUrl = path.join(req.params.companyId, shortName);
    //var avatarThumbPath = path.join(services.constants.ABSOLUTE_UPLOADS_FOLDER_URL, req.params.companyId,'thumb');
    //var avatarThumbUrl = path.join(req.params.companyId,'thumb', shortName);
    return new Promise(function(resolve/*, reject*/) {
        fs.move(req.files.file[0].path, avatarPath , function (err) {
            if (err) {
                resolve(err)
            } else {
                //if (!fs.existsSync(avatarThumbPath)){
                //    fs.mkdirSync(avatarThumbPath);
                //}
                //im.resize({
                //    srcPath: avatarPath, dstPath: path.join(avatarThumbPath, shortName),
                //    width:100, height:100
                //}, function(err){
                //    if (err) throw err;
                    resolve({
                        imageUrl : urljoin(req.protocol + ':', req.headers.host, avatarUrl),
                        imagePath: avatarPath
                        //imageThumbUrl: urljoin(req.protocol + ':', req.headers.host, avatarThumbUrl),
                        //imageThumbPath: path.join(avatarThumbPath,shortName)
                    })
                //});
            }
        });
    })

};

exports.deleteFile = function (path){
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
