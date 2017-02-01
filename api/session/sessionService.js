'use strict';

var User = require('../users/userModel');
var services = require('../services/index');
var _ = require('lodash');

exports.signInUser = function (password, email, client_secret){
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

            User.update({_id: user._id}, {$set: {currentCompany : user.currentCompany}},
                function (err, result) {
                    if (err) throw err;
                    // return the information including token as JSON
                    resolve({
                        token: token,
                        user: { email: user.email, _id: user._id, currentCompany: user.currentCompany }

                    });
                }
            );
        });
    });
};

exports.signUpUser = function (email, userData){
    return new Promise(function(resolve, reject) {
        User.findOne({
            email: email
        }, function(err, user) {
            if (err) throw err;
            if (user) {
                reject({reason: 'User exist', message:'Username, Email already exist'});
                return;
            }

            userData.save(function(err) {
                if (err) throw err;
                resolve({message:'User was created'})
            });
        });
    });
};

exports.updatePassword = function (oldPassword, newPassword, userId){
    return new Promise(function(resolve, reject) {
        User.findById( userId , function(err) {
            if (err) throw err;
        }).then(function(user){
            if(user.password !== oldPassword){
                reject({reason: 'Old Password does not match', message:'Old password does not match'});
                return false;
            }
            User.update({_id: user._id}, {$set: {password: newPassword}},
                function (err, result) {
                    if (err) throw err;
                    resolve(result)
                }
            );
        });
    });
};

