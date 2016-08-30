'use strict';

/**
 * @module ChartController
 */

var Chart = require('./chartModel');
var services = require('../services/index');
//var middleware = require('./sessionMiddleware');
var express = require('express');
var router = express.Router();
var _ = require('lodash');

function create(req, res) {
    var newChart = new Chart({
        username : req.body.user.username,
        userId : req.body.user.id,
        message : req.body.message
    });
    newChart.save(function(err, result) {
        if (err) throw err;
        Chart.findOne({
            _id : result._id
        }, function(err, chart) {
            if (err) throw err;
            res.send({
                data: chart
            });
        });
    });

}
router.post('/create', services.token.checkToken, create);

function fetchCharts(req, res) {
    Chart.find({
        userId : req.params.userId
    }, function(err, charts) {
        if (err) throw err;
        var data = [];
        _.each(charts, function(chart){
            data.push({message : chart.message, id: chart.id, username:chart.username});
        });

        res.send({
            data: data
        });
    });
}
router.get('/:userId/fetchCharts', services.token.checkToken, fetchCharts);

function removeChart(req, res) {
    Chart.remove({
        $and:[ {userId : req.params.userId }, {_id: req.body.id } ]
    }, function(err, chart) {
        if (err) throw err;
        res.send({
            message:'Item was removed'
        });
    });
}
router.post('/:userId/removeChart', services.token.checkToken, removeChart);


module.exports = router;


