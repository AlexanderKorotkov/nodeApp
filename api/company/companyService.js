'use strict';

var Company = require('./companyModel');
var _ = require('lodash');

exports.getUserCompanyList = function (userId){
    return new Promise(function(resolve, reject) {
        Company.find({
            "companyUsers.userId": userId
        }, function(err, companies) {
            if (err) throw err;
            let companiesList = [];
            _.each(companies, (data)=>{
                companiesList.push({companyId: data._id, companyName: data.companyName})
            });
            resolve(companiesList);
        });
    });
};

exports.create = function (companyName, userId){
    var companyData = new Company({companyName:companyName});
    return new Promise(function(resolve, reject) {
        Company.findOne({
            companyName: companyName
        }, function(err, company) {
            if ( err ){
                reject(err);
                return;
            }
            if(_.size(company) > 0){
                reject({reason: 'Company already exist', message:'Company already exist'});
                return false;
            }

            companyData.companyUsers.push({
                role : 'owner',
                userId : userId
            })

            companyData.save(function(err) {
                if (err) throw err;
                resolve({message:'Company was created'})
            });
            resolve(company);
        });
    });
};


