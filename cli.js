#!/usr/bin/env node

var program = require('commander');

program
    .version('0.0.1')
    .usage('<source> <operation> [options]')
    .option('-d, --documents <n>', 'The max documents to read [1000]', 1000)
    .option('-w, --workers <n>', 'The number of workers [1]', 1);

program
    .command('insert <source>')
    .action(function (source) {
        var db = require('./sources/' + source)();
        db.connect(function (err, conn) {
            var start = new Date();
            db.insert(conn, {
                iterations: parseInt(program.documents),
                workers: parseInt(program.workers)
            }, function (err) {
                if (err) {
                    console.log('\n error \n');
                    console.log(err);
                    console.log('\n\n');
                }
                var end = new Date() - start;
                console.log('\n done in %dms\n', end);
                process.exit();
            });
        });
    });

program
    .command('read <source>')
    .action(function (source) {
        var db = require('./sources/' + source)();
        db.connect(function (err, conn) {
            var start = new Date();
            db.read(conn, {
                documents: parseInt(program.documents),
                workers: parseInt(program.workers)
            }, function (err, result) {
                if (err) {
                    console.log('\n error \n');
                    console.log(err);
                    console.log('\n\n');
                }
                var end = new Date() - start;
                console.log('\n done in %dms\n', end);
                process.exit();
            });
        });
    });

program
    .command('remove <source>')
    .action(function (source, options) {
        var db = require('./sources/' + source)();
        db.connect(function (err, conn) {
            var start = new Date();
            db.remove(conn, function (err, result) {
                if (err) {
                    console.log('\n error \n');
                    console.log(err);
                    console.log('\n\n');
                }
                var end = new Date() - start;
                console.log('\n done in %dms\n', end);
                process.exit();
            });
        });
    });

program
    .command('count <source>')
    .action(function (source, options) {
        var db = require('./sources/' + source)();
        db.connect(function (err, conn) {
            var start = new Date();
            db.count(conn, function (err, result) {
                if (err) {
                    console.log('\n error \n');
                    console.log(err);
                    console.log('\n\n');
                }
                console.log('\n  ' + result + ' documents');
                var end = new Date() - start;
                console.log('\n done in %dms\n', end);
                process.exit();
            });
        });
    });

program
    .command('schema <source>')
    .action(function (source, options) {
        var db = require('./sources/' + source)();
        db.connect(function (err, conn) {
            var start = new Date();
            db.schema(conn, function (err) {
                if (err) {
                    console.log('\n error \n');
                    console.log(err);
                    console.log('\n\n');
                }
                var end = new Date() - start;
                console.log('\n done in %dms\n', end);
                process.exit();
            });
        });
    });

program
    .command('drop <source>')
    .action(function (source, options) {
        var db = require('./sources/' + source)();
        db.connect(function (err, conn) {
            var start = new Date();
            db.drop(conn, function (err, result) {
                if (err) {
                    console.log('\n error \n');
                    console.log(err);
                    console.log('\n\n');
                }
                var end = new Date() - start;
                console.log('\n done in %dms\n', end);
                process.exit();
            });
        });
    });

program
    .parse(process.argv);

if (!program.args.length) program.help();

