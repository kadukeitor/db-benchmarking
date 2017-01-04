var async = require('async');
var faker = require('faker');
var MultiProgress = require("multi-progress");
var multi = new MultiProgress(process.stderr);

module.exports = function (params) {

    var config = require('../config/redis.json');
    var redis = require('redis');

    function connect(callback) {
        var db = new redis.createClient({host: config.host, port: config.port});
        callback(null, db)
    }

    function schema(db, callback) {
        return callback(null);
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
                    db.set(config.prefix + index + '-' + count, JSON.stringify({
                        name: faker.name.findName(),
                        username: faker.internet.userName(),
                        email: faker.internet.email(),
                        phone: faker.phone.phoneNumber()
                    }), function (err, result) {
                        count++;
                        bars[index].tick(1);
                        callback(err, result);
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
            db.keys(config.prefix + '*', function (err, result) {
                async.each(result, function (item, callback) {
                    db.get(item, callback);
                }, function (err) {
                    bars[index].tick(1);
                    callback(err);
                });
            });
        }, function (err) {
            callback(err)
        });
    }

    function remove(db, callback) {
        db.keys(config.prefix + '*', function (err, rows) {
            async.each(rows, function (row, callback) {
                db.del(row, callback);
            }, function (err) {
                callback(err);
            });
        });
    }

    function count(db, callback) {
        db.keys(config.prefix + '*', function (err, result) {
            callback(err, result.length);
        });
    }

    function drop(db, callback) {
        db.send_command('FLUSHDB', function (err, result) {
            callback(err)
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

}
;