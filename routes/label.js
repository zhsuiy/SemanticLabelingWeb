var express = require('express');
var router = express.Router();
var fs = require('fs');
var uuid = require('uuid/v1');
var db = require('../local/database');
var global = require('../local/global'),
    words = global.wordarr;

/* GET label page. */
router.get('/', function (req, res, next) {
    // console.log("get:" + words.length);
    var workerId = uuid();
    console.log('uuid: ', workerId);
    db.images(function (groupId, images) {
        // console.log(images);
        if (groupId == "") {
            res.send('All image labelings has been done. Thanks for paticipating!');
        } else {
            res.render('label', {
                title: 'Label images',
                images: images,
                words: words,
                workerId: workerId,
                groupId: groupId,
            });
        }
    });
});

module.exports = router;
