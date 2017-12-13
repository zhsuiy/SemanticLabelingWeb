var express = require('express');
var router = express.Router();
var global = require('../local/global'),
    tutorials = global.tutorials;

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('tutorial', {
        title: 'Tutorial',
        tutorials: tutorials,
        curTid: 0
    });

});

module.exports = router;
