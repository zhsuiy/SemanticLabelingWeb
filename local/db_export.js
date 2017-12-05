 var path = require('path');
var fs = require('fs');
var db = require('./database'),
    client = db.client;
var global = require('./global'),
    groupNum = global.groupnum,
    groupPrefix = global.groupname,
    allImagePath = global.allimagepath,
    wordArr = global.wordarr;

var COLON = ':',
    TEST_PREFIX = "test-",
    OUTPUT_FILE = "output.json",
    OUTPUT_FOLDER = "output";

client.on('ready', function () {
    analyze();
});

function analyze() {
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
                    save(json);
                }
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

function save(json) {
    var folder = path.join(__dirname, '..', OUTPUT_FOLDER);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);   
    }

    var file = path.join(__dirname, '..', OUTPUT_FOLDER, OUTPUT_FILE);
    fs.writeFile(file, json, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log('Save output to', file);
    });
}