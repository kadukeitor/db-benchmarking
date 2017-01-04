#!/usr/bin/env node

var program = require('commander');

program
    .version('0.0.1')
    .usage('<source> <operation> [options]')
    .option('-d, --documents <n>', 'The max documents to process', 1000)
    .option('-w, --workers <n>', 'The number of workers [1]', 1);

var valid = false;

program
    .command('connect <source>')
    .action(function (source, options) {
        var db = require('./sources/' + source)();
        var start = new Date();
        valid = true;
        db.connect(function (err, conn) {
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

program
    .command('write <source>')
    .action(function (source) {
        var db = require('./sources/' + source)();
        valid = true;
        db.connect(function (err, conn) {
            var start = new Date();
            db.write(conn, {
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
        valid = true;
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
        valid = true;
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
        valid = true;
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
        valid = true;
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
        valid = true;
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

if (!program.args.length || !valid) program.help();

