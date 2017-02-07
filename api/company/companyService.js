'use strict';

let Company = require('./companyModel');
let User = require('../users/userModel');
let _ = require('lodash');

exports.getUserCompanyList = userId =>{
    return new Promise(function(resolve, reject) {
        Company.find({
            "companyUsers.userId": userId
        }, (err, companies) => {
            if (err) throw err;
            let companiesList = [];
            _.each(companies, (data)=>{
                companiesList.push({companyId: data._id, companyName: data.companyName})
            });
            resolve(companiesList);
        });
    });
};

exports.selectCompany = (userId, companyInfo) =>{
    return new Promise((resolve, reject) => {
        Company.findOne({
            "companyUsers.userId": userId
        }, (err, company) => {
            if (err) throw err;
            let user = _.find(company.companyUsers,(result) =>{
                if(result.userId === userId){
                    return result.role
                }
            });

            User.update({_id: userId}, {$set: {currentCompany: companyInfo, role: user.role}},
                function (err, result) {
                    if (err) throw err;
                    resolve({data:{currentCompany: companyInfo, role: user.role}})
                }
            );
        });
    });
};

exports.addWorker = (worker, currentCompany) =>{
    return new Promise((resolve, reject) => {
        Company.findOne({
            _id: currentCompany.companyId
        },  (err, company) => {
            if (err) throw err;

            _.each(company.companyWorkers,(result) =>{
                if(result.email === worker.email){
                    reject({reason: 'Worker email exist', message:'Worker with this email already exist'});
                }
            });

            Company.update({_id: currentCompany.companyId}, {$push: {companyWorkers: worker}},
                function (err, result) {
                    if (err) throw err;
                    resolve(result)
                }
            );
        });
    });

};

exports.fetchCompanyWorkers = companyId =>{
    return new Promise(function(resolve, reject) {
        Company.findOne({
            _id: companyId
        }, function(err, company) {
            if (err) throw err;
            resolve(company.companyWorkers);
        });
    });
};

exports.create = (companyName, userId) => {
    var companyData = new Company({companyName:companyName});
    return new Promise((resolve, reject) => {
        Company.findOne({
            companyName: companyName
        }, (err, company) => {
            if ( err ){
                reject(err);
                return;
            }
            if(_.size(company) > 0){
                reject({reason: 'Company already exist', message:'Company already exist'});
                return false;
            }

            companyData.companyUsers.push({
                role : 'admin',
                userId : userId
            });

            companyData.save((err) => {
                if (err) throw err;
                resolve({message:'Company was created'})
            });
            resolve(company);
        });
    });
};


