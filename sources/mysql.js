var async = require('async');
var faker = require('faker');
var MultiProgress = require("multi-progress");
var multi = new MultiProgress(process.stderr);

module.exports = function (params) {

    var config = require('../config/mysql.json');
    var mysql = require('mysql');

    const table = config.table;

    function connect(callback) {
        var db = mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        });
        db.connect(function (err) {
            callback(err, db)
        });
    }

    function schema(db, callback) {
        db.query('CREATE TABLE IF NOT EXISTS ' + table + ' ( name TEXT , username TEXT, email TEXT, phone TEXT )',
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
                    db.query('INSERT INTO ' + table + ' (name, username, email, phone) VALUES (?, ?, ?, ?)', [
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
            db.query('SELECT * FROM ' + table + ' LIMIT ' + documents, function (err, result) {
                bars[index].tick(1);
                callback(err);
            });
        }, function (err) {
            callback(err)
        });
    }

    function remove(db, callback) {
        db.query('DELETE FROM ' + table, function (err) {
            return callback(err)
        });
    }

    function count(db, callback) {
        db.query('SELECT COUNT(*) as count FROM ' + table, function (err, result) {
            return callback(err, parseInt(result[0].count))
        });
    }

    function drop(db, callback) {
        db.query('DROP TABLE ' + table, function (err) {
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