var async = require('async');
var faker = require('faker');
var MultiProgress = require("multi-progress");
var multi = new MultiProgress(process.stderr);

module.exports = function (params) {

    var config = require('../config/sqlite.json');
    var sqlite3 = require('sqlite3').verbose();

    const table = config.table;

    function connect(callback) {
        var db = new sqlite3.Database(config.file);
        callback(null, db)
    }

    function schema(db, callback) {
        db.run('CREATE TABLE IF NOT EXISTS ' + table + ' ( name TEXT , username TEXT, email TEXT, phone TEXT )',
            function (err) {
                return callback(err)
            }
        );
    }

    function insert(db, params, callback) {
        var iterations = params.iterations;
        var workers = params.workers;
        var bars = [];
        console.log('\n inserting ' + iterations * workers + ' docs with ' + workers + ' worker(s)\n');
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
                    db.run('INSERT INTO ' + table + ' (name, username, email, phone) VALUES (?, ?, ?, ?)', [
                        faker.name.findName(),
                        faker.internet.userName(),
                        faker.internet.email(),
                        faker.phone.phoneNumber()
                    ], function (err, result) {
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
            db.all('SELECT * FROM ' + table + ' LIMIT ' + documents, function (err, result) {
                bars[index].tick(1);
                callback(err);
            });
        }, function (err) {
            callback(err)
        });
    }

    function remove(db, callback) {
        db.run('DELETE FROM ' + table, function (err) {
            return callback(err)
        });
    }

    function count(db, callback) {
        db.get('SELECT COUNT(*) as count FROM ' + table, function (err, result) {
            return callback(err, parseInt(result.count))
        });
    }

    function drop(db, callback) {
        db.run('DROP TABLE ' + table, function (err) {
            return callback(err)
        });
    }

    return {
        connect: connect,
        schema: schema,
        insert: insert,
        read: read,
        remove: remove,
        count: count,
        drop: drop
    }

}
;