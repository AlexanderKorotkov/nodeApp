var express = require('express');
var app = express();
var services = require('./index');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

var path = require('path');
var fs = require('fs-extra');
var shortid = require('shortid');
var urljoin = require('url-join');
var im = require('imagemagick');

exports.uploadImg = function(file, companyId, protocol, host) {
    var shortName = shortid.generate() + path.extname(file.name);
    var avatarPath = path.join(services.constants.ABSOLUTE_UPLOADS_FOLDER_URL, companyId, shortName);
    var avatarUrl = path.join(companyId, shortName);
    var avatarThumbPath = path.join(services.constants.ABSOLUTE_UPLOADS_FOLDER_URL, companyId,'thumb');
    var avatarThumbUrl = path.join(companyId,'thumb', shortName);
    return new Promise(function(resolve/*, reject*/) {
        fs.move(file.path, avatarPath , function (err) {

            if (err) {
                resolve(err)
            } else {
                if (!fs.existsSync(avatarThumbPath)){
                    fs.mkdirSync(avatarThumbPath);
                }
                im.resize({
                    srcPath: avatarPath, dstPath: path.join(avatarThumbPath, shortName),
                    width:100, height:100
                }, function(err){
                    if (err) throw err;
                resolve({
                    imageUrl: urljoin(protocol + ':', host, avatarUrl),
                    imagePath: avatarPath,
                    imageThumbUrl: urljoin(protocol + ':', host, avatarThumbUrl),
                    imageThumbPath: path.join(avatarThumbPath,shortName)
                });
                });
            }
        });
    })

};

exports.deleteFile = function (path){
    fs.exists(path, function(exists) {
        if(exists) {
            fs.unlink(path, function(err){
                if (err) throw err;
                console.log(1)
            });
        } else {
            console.log('File not found, so not deleting.');
        }
    });
};
