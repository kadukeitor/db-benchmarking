var async = require('async');
var faker = require('faker');
var MultiProgress = require("multi-progress");
var multi = new MultiProgress(process.stderr);


module.exports = function (params) {

    var MongoClient = require('mongodb').MongoClient;

    var config = require('../config/mongodb.json');
    const uri = config.uri;
    const collection = config.collection;

    function connect(callback) {
        MongoClient.connect(uri, function (err, db) {
            callback(err, db);
        })
    }

    function schema(db, callback) {
        callback(null);
    }

    function write(db, params, callback) {
        var iterations = params.iterations;
        var workers = params.workers;
        var bars = [];
        console.log('\n writing ' + iterations * workers + ' docs with ' + workers + ' worker(s)\n');
        async.eachOf(new Array(workers), function (value, index, callback) {
            bars[index] = multi.newBar('  worker ' + (index + 1) + ' [:bar] :elapsed :percent :etas', {
                width: 20,
                total: iterations
            });
            var count = 0;
            async.whilst(
                function () {
                    return count < iterations;
                },
                function (callback) {
                    db.collection(collection).insertOne({
                        name: faker.name.findName(),
                        username: faker.internet.userName(),
                        email: faker.internet.email(),
                        phone: faker.phone.phoneNumber()
                    }, function (err) {
                        count++;
                        bars[index].tick(1);
                        callback(err);
                    });
                },
                function (err) {
                    return callback(err)
                }
            );
        }, function (err) {
            callback(err)
        });
    }

    function read(db, params, callback) {
        var documents = params.documents;
        var workers = params.workers;
        var bars = [];
        console.log('\n reading ' + documents + ' docs with ' + workers + ' worker(s)\n');
        async.eachOf(new Array(workers), function (value, index, callback) {
            bars[index] = multi.newBar('  worker ' + (index + 1) + ' [:bar] :elapsed :percent :etas', {
                width: 20,
                total: 1
            });
            db.collection(collection).find().limit(documents).toArray(function (err, docs) {
                bars[index].tick(1);
                callback(err, docs);
            });
        }, function (err) {
            callback(err)
        });
    }

    function remove(db, callback) {
        db.collection(collection).deleteMany({}, function (err) {
            return callback(err)
        });
    }

    function count(db, callback) {
        db.collection(collection).count({}, function (err, result) {
            return callback(err, result)
        });
    }

    function drop(db, callback) {
        db.collection(collection).deleteMany({}, function (err) {
            return callback(err)
        });
    }

    return {
        connect: connect,
        schema: schema,
        write: write,
        read: read,
        remove: remove,
        count: count,
        drop: drop
    }

};