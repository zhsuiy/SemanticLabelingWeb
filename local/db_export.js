 var path = require('path');
var fs = require('fs');
var db = require('./database'),
    client = db.client;

var global = require('./global'),
    groupNum = global.groupnum,
    groupPrefix = global.groupname,
    allImagePath = global.allimagepath,
    wordArr = global.wordarr;

var WORKERS = 'workers',
    COLON = ':',
    TEST_PREFIX = "test-",
    OUTPUT_FILE = "output.json",
    OUTPUT_FOLDER = "output";
var OUTPUT_WORKER_FILE = "output_worker.json",
    OUTPUT_GROUP_FILE = "output_group.json",
    OUTPUT_LABEL = "output_label.json";

function exportWorkers() {
    client.on('ready', function () {        
        console.log('Export worker accuracy...');
        client.zrange(WORKERS, 0, -1, 'withscores', function (err, members) {
            if (err) {
                console.log(err);
                return;
            }
            var total = {};
            for (var i = 0; i < members.length; i += 2) {
                var workerId = members[i];
                var accuracy = parseFloat(members[i + 1]);
                total[workerId] = accuracy;
            }
            var json = JSON.stringify(total, null, ' ');
            save(json, OUTPUT_WORKER_FILE);
        });
    });
}

function exportGroups() {
    client.on('ready', function () {        
        console.log('Export group worker...');
        var multi = client.multi();
        for (var i = 0; i < groupNum; i++) {
            multi.lrange(groupPrefix + i, 0, -1);
        }
        multi.exec(function (err, replies) {
            if (err) {
                console.log(err);
                return;
            }
            var total = {};
            replies.forEach(function (reply, index) {
                total[groupPrefix + index] = reply;
            });
            var json = JSON.stringify(total, null, ' ');
            save(json, OUTPUT_GROUP_FILE);
        });
    }); 
}


function exportLabels() {
    client.on('ready', function () {        
        console.log('Export image lables...');
       
        var folder = path.join(__dirname, allImagePath);
        var words = wordArr.map(v => v.toLowerCase());
        words.push("none");

        var total = {};
        fs.readdir(folder, (err, files) => {            
            var process = 0;
            files.forEach((file, index) => {                
                var imageId = path.basename(file, path.extname(file));
                total[imageId] = {};
                client.lrange(imageId, 0, -1, (err, reply) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    getImageLabelResultPerWorker(imageId, words, reply, image => {
                        total[imageId] = image;
                        process++;
                        if (process === files.length) {
                            var json = JSON.stringify(total , null, ' ');
                            // console.log(json);
                            save(json, OUTPUT_LABEL);
                        }
                    });
                });
                
            });


        });
    }); 
}

function getImageLabelResultPerWorker(imageId, words, workers, callback) {
    var image = {};
    var multi = client.multi();
    workers.forEach(workerId => {
        multi.lrange(workerId + COLON + imageId, 0, -1);        
        var initLables = {};
        words.forEach(word => {
            initLables[word] = 0;
        });
        image[workerId] = initLables;
    });
    multi.exec((err, rpy) => {
        if (err) {
            console.log(err);
            return;
        }
        rpy.forEach((labels, idx) => {
            var workerId = workers[idx];
            labels.forEach(label => {
                image[workerId][label] = 1;
            });
        });
        callback(image);
    });
}


function exportFrequence() {
    client.on('ready', function () {
        console.log('Begin to analyze...');
        var folder = path.join(__dirname, allImagePath);
        var words = wordArr.map(v => v.toLowerCase());
        words.push("none");
        fs.readdir(folder, function (err, files) {
            var total = [];
            files.forEach((file, index) => {
                analyzeOneImage(file, words, function (obj) {
                    total.push(obj);
                    if (index === files.length - 1) {
                        console.log('Finish analyzing...');
                        // console.log(JSON.stringify(total, null, ' '));
                        var json = JSON.stringify(total, null, ' ');
                        save(json, OUTPUT_FILE);
                    }
                });
            });
        });
    });
}

function analyzeOneImage(file, words, callback) {
    var imageId = path.basename(file, path.extname(file));
    // console.log(imageId);
    if (!imageId.startsWith(TEST_PREFIX)) {
        var freqs = {};
        words.forEach((word, index) => {
            analyzeWordFrequency(imageId, word, function (freq) {
                freqs[word] = freq;
                if (index === words.length - 1) {
                    var obj = {};
                    obj[imageId] = freqs;
                    callback(obj);
                }
            });
        });
    }
}

function analyzeWordFrequency(imageId, word, callback) {
    var multi = client.multi()
        .llen(imageId + COLON + word)
        .llen(imageId)
        .exec(function (err, replies) {
            var wordCnt = 0, totalCnt = 0;
            replies.forEach(function (reply, index) {
                if (index === 0) {
                    wordCnt = reply;
                } else {
                    totalCnt = reply;
                }
            });
            var freq = 0;
            if (totalCnt !== 0) {
                freq = wordCnt / totalCnt;
            }
            callback(freq);
        });
}

function save(json, filename) {
    var folder = path.join(__dirname, '..', OUTPUT_FOLDER);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);   
    }

    var file = path.join(__dirname, '..', OUTPUT_FOLDER, filename);
    fs.writeFile(file, json, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('Save output to', file);
    });
}


module.exports = {
    exportWorkers,
    exportGroups,
    exportLabels,
    exportFrequence
};

require('make-runnable');