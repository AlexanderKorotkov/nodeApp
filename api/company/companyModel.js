'use strict';

// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Company', new Schema({
    companyName: String,
    companyLogo: String,
    companyUsers: [{
        role: String,
        userId: String
    }],
    companyWorkers : []
}));
