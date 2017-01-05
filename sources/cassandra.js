var async = require('async');
var faker = require('faker');
var MultiProgress = require("multi-progress");
var multi = new MultiProgress(process.stderr);

module.exports = function (params) {

    var config = require('../config/cassandra.json');
    var cassandra = require('cassandra-driver');

    const servers = config.servers;
    const authProvider = new cassandra.auth.PlainTextAuthProvider(config.username, config.password);
    const keyspace = config.keyspace;
    const table = config.table;

    function connect(callback) {
        var db = new cassandra.Client({contactPoints: servers, keyspace: keyspace, authProvider: authProvider});
        callback(null, db)
    }

    function schema(db, callback) {
        db.execute('CREATE TABLE IF NOT EXISTS ' + table + ' ( name text primary key, username text, email text, phone text )',
            function (err) {
                return callback(err)
            }
        );
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
                    db.execute('INSERT INTO ' + table + ' (name, username, email, phone) VALUES (?, ?, ?, ?)', [
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
            db.execute('SELECT * FROM ' + table + ' LIMIT ' + documents, function (err, result) {
                bars[index].tick(1);
                callback(err, result);
            });
        }, function (err) {
            callback(err)
        });
    }

    function remove(db, callback) {
        db.execute('TRUNCATE ' + table, function (err) {
            return callback(err)
        });
    }

    function count(db, callback) {
        db.execute('SELECT COUNT(*) FROM ' + table, function (err, result) {
            return callback(err, result ? parseInt(result.first().count) : 0)
        });
    }

    function drop(db, callback) {
        db.execute('DROP TABLE ' + table, function (err) {
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

}
;