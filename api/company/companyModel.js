'use strict';

// get an instance of mongoose and mongoose.Schema
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = mongoose.model('Company', new Schema({
    companyName: String,
    companyLogo: String,
    companyUsers: [{
        role: String,
        userId: String
    }],
    companyWorkers : Array
}));
