var express = require('express');
var router = express.Router();
var util = require('../utils/recurrenceUtil');
var logger = require('../utils/loggerUtil').logger;

router.post('/groupMetadata',
  [ util.groupMetadataFileUpload, util.parseAndValidateGroupMetadata ], (req, res, next) => {
  logger.log('info',"==> groupMetadata endpoint called");
  util.getGroupMetadata(req.input)
  .then( (result) => {
    res.send(result);
    next(); }).catch( (err) => next(err) );
});

router.post('/individualMetadata',[ util.individualDataFileUpload, util.parseAndValidateIndividualMetadata ] ,
  (req, res, next) => {
  logger.log('info',"==> individualMetadata endpoint called");
  util.getIndividualMetadata(req.input)
  .then( (result) => {
    res.send(result);
    next(); }).catch( (err) => next(err) );
});

router.post('/individualData',[ util.individualDataFileUpload, util.resolveWorkingDestination,
  util.parseAndValidateIndividualData ], (req, res, next) => {
  logger.log('info',"==> individualData endpoint called");

  if(req.isResponseByEmail) {
    util.callIndividualData(req.input);
    res.status(202).send();
    next();
  } else {
    util.getIndividualData(req.input)
    .then( (result) => res.download(result.pop()) )
    .catch( (err) => {
      res.status(400).send({ errors: [{ msg: err}] });
      next();
    });
  }
});

router.post('/groupData', [ util.groupDataFileUpload, util.resolveWorkingDestination, util.parseAndValidateGroupData ],
  (req, res, next) => {
  logger.log('info',"==> group Data endpoint called");
  util.getGroupData(req.input)
  .then( (result) => res.download(result.pop()) )
  .catch( (err) => {
    res.status(400).send({ errors: [{ msg: err}] });
    next();
  });
});

module.exports = router;