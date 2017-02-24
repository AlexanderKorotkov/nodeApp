'use strict';

/**
 * @module SessionController
 */
let Company = require('./companyModel');
let services = require('../services/index');
let express = require('express');
let router = express.Router();
let validator = require('validator');
let _ = require('lodash');
let companyService = require('./companyService');
let multipart = require('connect-multiparty');


function createCompany(req, res) {

    let companyName = req.body.companyData.companyName;
    let companyNameRepeat = req.body.companyData.companyNameRepeat;
    let userId = req.body.userId;

    if(!companyName){
        services.errorService.handleError(res, "Company name is empty", "Company name is empty", 400);
        return false;
    }

    if(companyName !== companyNameRepeat){
        services.errorService.handleError(res, "Companies names do not match", "Companies names do not match", 400);
        return false;
    }

    companyService.createCompany(companyName, userId).then(() => {
        res.send({
          message: 'Company was created'
        });
    },(err) => {
        services.errorService.handleError(res, err.reason, err.message, 400);
    });
}
router.post('/create', services.token.checkToken, createCompany);

function fetchCompanyWorkers(req, res) {

    let companyId = req.params.companyId;
    let userId = req.params.userId;
    companyService.fetchCompanyWorkers(companyId, userId).then((result) => {
        res.send({
            data:result
        });
    }).catch((err) => {
        return services.errorService.handleError(res, err.reason, err.message, 400);
    });
}
router.get('/:companyId/:userId/fetchWorkers', services.token.checkToken, fetchCompanyWorkers);

function getUserCompanyList(req, res) {

    let userId = req.params.userId;
    companyService.getUserCompanyList(userId).then((result) => {
        res.send(
            result
        );
    });
}
router.get('/:userId/getUserCompanyList', services.token.checkToken, getUserCompanyList);

function selectCompany(req, res) {
    let userId = req.body.userId;
    let companyInfo = req.body.companyInfo;
    companyService.selectCompany(userId, companyInfo).then((result) => {
        res.send(
            result
        );
    });
}
router.post('/selectCompany', services.token.checkToken, selectCompany);

function addWorker(req, res) {

    let worker = req.body.worker;
    let company = req.body.company;
    let file = req.files;

    if(_.size(file) > 0){
        let protocol = req.protocol;
        let host = req.headers.host;
        worker = JSON.parse(worker);
        company = JSON.parse(company);
        services.upload.uploadImg(file.file, company.companyId, protocol, host).then((avatar) => {
            addWorkerHandler(avatar);
        });
    }else{
        addWorkerHandler();
    }
    function addWorkerHandler(avatar) {
        companyService.addWorker(worker, company, avatar).then((result) => {
            res.send({
                data:result
            });
        }).catch((err) => {
            return services.errorService.handleError(res, err.reason, err.message, 400);
        });
    }

}
router.post('/addWorker', services.token.checkToken, services.permissions.isAdmin, multipart(), addWorker);


function updateWorker(req, res) {
    let companyId = req.params.companyId;
    let worker = req.body.worker;
    let file = req.files;

    if(_.size(file) > 0){
        let protocol = req.protocol;
        let host = req.headers.host;
        worker = JSON.parse(worker);
        services.upload.uploadImg(file.file, companyId, protocol, host).then((avatar) => {
            updateWorkerHandler(avatar);
        });
    }else{
        updateWorkerHandler();
    }

    function updateWorkerHandler(avatar) {
        companyService.updateWorker(companyId, worker, avatar).then((result) => {
            res.send({
                data:result
            });
        }).catch((error) => {
            console.log(error)
        });
    }

}
router.post('/:companyId/workerEdit', services.token.checkToken, services.permissions.isAdmin, multipart(), updateWorker);

function deleteWorker(req, res) {
    let companyId = req.params.companyId;
    let worker = req.body.worker;

    companyService.deleteWorker( companyId, worker).then((result) => {
        res.send({
            data:result
        });
    }).catch((error) => {
        console.log(error)
    });
}
router.post('/:companyId/deleteWorker', services.token.checkToken, services.permissions.isAdmin, deleteWorker);


module.exports = router;


