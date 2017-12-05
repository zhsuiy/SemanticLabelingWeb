var db = require('./database'),
    client = db.client
    GROUP_NUM = db.groupNum;

var GROUPS = 'groups',
    GROUP_PREFIX = 'group-';

client.on('ready', function () {
    init();
});

function init() {
    for (var i = 0; i < GROUP_NUM; i++) {
        client.zadd(GROUPS, 0, GROUP_PREFIX + i);
    }
    console.log('DB init groups label count succeed.');
}