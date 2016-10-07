'use strict';

var User = require('../users/userModel');
var services = require('../services/index');
var _ = require('lodash');

exports.signInUser = function (password, email, client_secret, companyId){
    return new Promise(function(resolve, reject) {
        User.findOne({
            email: email
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                reject({reason: 'Invalid user', message:'Authentication failed. User, Email or Company Name not found'});
                return;
            }
            // check if password matches
            if (user.password !== password) {
                reject({reason: 'Invalid user password', message:'Authentication failed. User not found or wrong password'});
                return;
            }

            // if user is found, password and secret key is right
            // create a token

            var token = services.token.signToken({_id: user._id}, client_secret);
            if(!token){
                reject({reason: 'Invalid secret key', message:'Invalid secret key'});
                return;
            }
            // return the information including token as JSON
            resolve({
                token: token,
                user: { email: user.email, _id: user._id, admin: user.admin, companyId: companyId },
                companyId: user.companyId
            });
        });
    });
};

exports.signUpUser = function (email, userData, companyData){
    return new Promise(function(resolve, reject) {
        User.findOne({
            email: email
        }, function(err, user) {
            if (err) throw err;
            if (user) {
                reject({reason: 'User exist', message:'Username, Email or Company Name already exist'});
                return;
            }
            companyData.save(function(err, result) {
                if (err) throw err;
                userData.companiesProfile.push({companyId : result._id});
                userData.admin = true;
                userData.save(function(err) {
                    if (err) throw err;
                    resolve({message:'Company was created'})
                });
            });
        });
    });
};

