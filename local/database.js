// redis dataset
var redis = require('redis'),
    DB_HOST = 'x.x.x.x',
    DB_PORT = 9999,
    DB_PWD = 'pass',
    client = redis.createClient(DB_PORT, DB_HOST);

var global = require('./global'),
    groupNum = global.groupnum,
    groupPrefix = global.groupname,
    allImagePath = global.allimagepath,
    wordArr = global.wordarr,
    words = wordArr.map(v => v.toLowerCase());

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var GROUPS = 'groups',
    WORKERS = 'workers',
    WORKER_GROUP_PREFIX = "worker-group"
    COLON = ':',
    GROUP_MAX_LABEL_COUNT = 3;

client.auth(DB_PWD, function () {
    console.log('DB auth successed.');
});

client.on('ready', function () {
    console.log('DB ready.');
});

client.on('connect', function () {
    console.log('DB connected.');
});

client.on('error', function (err) {
    console.log('DB error: ' + err);
});

function submitWorker(workerId, groupId, accuracy, isBadData) {
    var multi = client.multi()
        .zadd(WORKERS, accuracy, workerId)
        .set(WORKER_GROUP_PREFIX + COLON + workerId, groupId);
    if (!isBadData) {
        multi.rpush(groupId, workerId);
    }
    multi.exec(function (err, replies) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('DB multi got ' + replies.length + ' replies');
        replies.forEach(function (reply, index) {
            console.log('DB reply ' + index + COLON + reply.toString());
        });
    });
}

function submitResults(workerId, groupId, labelResults, callback) {
    var multi = client.multi();
    multi.zincrby(GROUPS, 1, groupId);
    labelResults.forEach(item => {
        var imageId = item.imageId;
        // console.log('imageId: ', imageId);
        multi.rpush(imageId, workerId);
        item.labels.forEach(label => {
            multi.rpush(imageId + COLON + label, workerId);
            multi.rpush(workerId + COLON + imageId, label);
        });
    });

    multi.exec(function (err, replies) {
        if (err) {
            console.log(err);
            callback(false);
            return;
        }
        console.log('DB multi got ' + replies.length + ' replies');
        replies.forEach(function (reply, index) {
            console.log('DB reply ' + index + COLON + reply.toString());
        });
        callback(true);

    });
}

function filterCount({key, value}) {
    return value < GROUP_MAX_LABEL_COUNT;
}

function images(callback) {
    console.log('DB get groups count');
    client.zrange(GROUPS, 0, -1, 'withscores', function (err, members) {

        if (err) {
            callback("", []);
            return;
        }

        var data = _.chunk(members, 2);
        //convert string number to integer
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop) && obj[prop] !== null && !isNaN(obj[prop])) {
                    obj[prop] = +obj[prop];
                }
            }
        }
        //convert to pairs
        data = _.fromPairs(data);
        //convert to key-value array
        data = _.transform(data, function (result, value, key) {
            result.push({ key, value });
        }, []);
        // console.log(JSON.stringify(data, null, '  '));

        var candidateGroups = [];
        data.filter(filterCount).forEach(item => {
            candidateGroups.push(item.key);
        });
        // console.log(candidateGroups);

        //get random group
        if (candidateGroups.length <= 0) {
            // callback("", []);            
            // return;   
            console.log("Upgrade group max label count to", GROUP_MAX_LABEL_COUNT);
            GROUP_MAX_LABEL_COUNT++;
            data.filter(filterCount).forEach(item => {
                candidateGroups.push(item.key);
            });
        }
        var selectedGroupId = _.sample(candidateGroups);
        console.log('Random group id: ', selectedGroupId);
        //get file urls in the group folder
        var images = [];
        var folder = path.join(__dirname, '..', 'public', 'images', selectedGroupId);
        fs.readdir(folder, function (err, files) {

            if (err) {
                callback(groupId, []);
                return;
            }

            //shuffle files
            _.shuffle(files).forEach(file => {
                var url = path.join('images', selectedGroupId, file);
                images.push(url);
            });

            // console.log(images);
            callback(selectedGroupId, images);
        });
    });
}

module.exports = {
    submitResults,
    submitWorker,
    images,
    client,
    groupNum
}