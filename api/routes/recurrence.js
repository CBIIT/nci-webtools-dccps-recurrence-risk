var express = require('express');
var router = express.Router();
var util = require('../utils/recurrenceUtil');

router.post('/groupMetadata',
  [ util.groupMetadataFileUpload, util.parseAndValidateGroupMetadata ], (req, res) => {
  console.log("==> groupMetadata endpoint called");
  var result = util.getGroupMetadata(req.input)
  res.send(result);
});

router.post('/individualMetadata',[ util.individualDataFileUpload, util.parseAndValidateIndividualMetadata ] ,
  (req, res) => {
  console.log("==> individualMetadata endpoint called");
  var result = util.getIndividualMetadata(req.input);
  res.send(result);
});

router.post('/individualData',[ util.individualDataFileUpload, util.resolveWorkingDestination,
  util.parseAndValidateIndividualData ], (req, res) => {
  console.log("==> individualData endpoint called");
  try {

    if(req.input.covariates && req.input.covariates.length > 0) {
      util.callIndividualData(req.input);
      res.status(202).send();
    } else {
      var result = util.getIndividualData(req.input);
      res.download(result.pop());
    }

  } catch(error) {
    console.log(error);
    res.status(400).send({ errors: error.message });
  }
});

router.post('/groupData', [ util.groupDataFileUpload, util.resolveWorkingDestination, util.parseAndValidateGroupData ],
  (req, res) => {
  console.log("==> group Data endpoint called");
  try {
    var result = util.getGroupData(req.input);
    res.download(result.pop());
  } catch(error) {
    console.log(error);
    res.status(400).send({ errors: error.message});
  }
});

module.exports = router;