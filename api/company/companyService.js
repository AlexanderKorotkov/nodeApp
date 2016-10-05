'use strict';

var Company = require('./companyModel');
var _ = require('lodash');

exports.findCompanyByName = function (companyName){
    return new Promise(function(resolve, reject) {
        Company.findOne({
            companyName: companyName
        }, function(err, company) {
            if ( err ){
                reject(err);
                return;
            }
            resolve(company);
        });
    });
};


