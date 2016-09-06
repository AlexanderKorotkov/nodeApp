'use strict';

// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Members', new Schema({
    name:String,
    surname:String,
    position:String,
    project:String,
    skype:String,
    email:String,
    phone:String,
    bDay:String,
    imageUrl: String,
    companyId: String
}));
