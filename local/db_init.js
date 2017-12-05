var db = require('./database'),
    client = db.client
    GROUP_NUM = db.groupNum;

var GROUPS = 'groups',
    GROUP_PREFIX = 'group-';

function initGroups() {
    client.on('ready', function () {
        for (var i = 0; i < GROUP_NUM; i++) {
            client.zadd(GROUPS, 0, GROUP_PREFIX + i);
        }
        console.log('DB init groups label count succeed.');
    });
}

function clearData() {
    client.on('ready', function () {
        client.flushdb(function (err, reply) {
            console.log('DB flush.');
        });
    });
}

module.exports = {
    initGroups,
    clearData
}

require('make-runnable');