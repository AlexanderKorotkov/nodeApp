'use strict';

let Company = require('./companyModel');
let User = require('../users/userModel');
let _ = require('lodash');
let shortid = require('shortid');


exports.createCompany = (companyName, userId) => {
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

exports.fetchCompanyWorkers = (companyId, userId) =>{
    return new Promise(function(resolve, reject) {
        Company.findOne({
            _id: companyId, "companyUsers.userId": userId
        }, function(err, company) {
            if (err) throw err;
            if (!company) return  reject({reason: 'Companies do not exist', message:'Oops nothing to show'});
            resolve(company.companyWorkers);
        });
    });
};

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

           let isWorkerExist =  _.find(company.companyWorkers,(result) =>{
                if(result.email === worker.email){
                    return result;
                }
            });

           if(isWorkerExist){
              return reject({reason: 'Worker email exist', message:'Worker with this email already exist'});
           }

           worker._id = shortid.generate();

            Company.update({_id: currentCompany.companyId}, {$push: {companyWorkers: worker}},
                function (err, result) {
                    if (err) throw err;
                    resolve(result)
                }
            );
        });
    });

};

exports.deleteWorker = function (companyId, worker){
    return new Promise(function(resolve, reject) {
        Company.findOne({
            _id: companyId
        }, function(err, company) {
            if (err) throw err;
            _.each(company.companyWorkers, (result) =>{
                if(result && result._id === worker._id){
                    company.companyWorkers.splice(company.companyWorkers.indexOf(result), 1);
                }
            });
            Company.update({_id: companyId}, {$set: {companyWorkers: company.companyWorkers}},
                function (err, result) {
                    if (err) throw err;
                    resolve(result)
                }
            );
        });
    });
};

exports.updateWorker = function (companyId, worker){
    return new Promise(function(resolve, reject) {
        Company.findOne({
            _id: companyId
        }, function(err, company) {
            if (err) throw err;
            _.each(company.companyWorkers, (result) =>{
                if(result && result._id === worker._id){
                    company.companyWorkers.splice(company.companyWorkers.indexOf(result), 1);
                    company.companyWorkers.push(worker);
                }
            });
            Company.update({_id: companyId}, {$set: {companyWorkers: company.companyWorkers}},
                function (err, result) {
                    if (err) throw err;
                    resolve(result)
                }
            );
        });
    });
};



