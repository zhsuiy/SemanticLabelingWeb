var express = require('express');
var path = require('path');
var db = require('../local/database');
var router = express.Router();

var TEST_PREFIX = "test-";
var ACCURACY_THRESHOLD = 0.6

/* GET users listing. */
router.post('/', function(req, res, next) {
  var data = req.body;

  var workerId = data.workerId;
  var groupId = data.groupId;
  var array = JSON.parse(data.results);
  
  var accuracy, labelResults;
  [accuracy, labelResults] = getAccuracy(array);
  db.submitWorker(workerId, groupId, accuracy);
  if (accuracy >= ACCURACY_THRESHOLD) {
    db.submitResults(workerId, groupId, labelResults, function (result) {
      res.send(result ? 'SUBMIT SUCCEED' : 'SUBMIT FAILED');
    });
  } else {
    console.log('Accuracy did not pass threshold, label results will not be submitted to db');
    res.send('ACCURACY TOO LOW');
  }
});

/* Get accuracy for label results. */
function getAccuracy(array) {
  var totalTestCount = 0;
  var correctCount = 0;

  var labelResults = [];
  for (var item of array) {
    var imageId = path.basename(item.id, path.extname(item.id));
    // console.log(imageId);
    var labels = item.labels.map(v => v.toLowerCase());
    // console.log(labels);

    var obj = {};    
    obj.imageId = imageId;
    obj.labels = labels;
    if (!imageId.startsWith(TEST_PREFIX)) {
      labelResults.push(obj);
      continue;
    }

    totalTestCount++;
    var keyword = imageId.split("-").pop(-1).toLowerCase();
    console.log('Test keyword: ', keyword);
    if (labels.includes(keyword)) {
      console.log('Found test keyword!');
      correctCount++;
    }
  }

  if (totalTestCount === 0) 
  {
    console.log('Test image not exists!');
    return [0, []];
  }

  var accuracy = correctCount / totalTestCount;

  console.log('[%d / %d]: %f', correctCount, totalTestCount, accuracy.toFixed(5));
  return [accuracy, labelResults];
}

module.exports = router;
