var R = require("../lib/r-script");
var util = require('util');
var multer = require('multer');

const expressValidator = require('express-validator');

const SEER_DICTIONARY_FIELD_NAME = "seerDictionaryFile";
const SEER_DATA_FIELD_NAME       = "seerDataFile";
const CANSURV_DATA_FIELD_NAME    = "canSurvDataFile";
const SEER_CSV_DATA_FIELD_NAME   = "seerCSVDataFile";

var workerFarm = require('worker-farm');
var workers = workerFarm({
       maxCallsPerWorker           : 20 //safe guard against memory leaks
     , maxConcurrentWorkers        : 1  // 1 worker at a time
     , maxConcurrentCallsPerWorker : 1  // one task per worker
     , maxConcurrentCalls          : 10 // DOS setting, can crash if too many
     , maxCallTime                 : Infinity
     , maxRetries                  : 1
     , autoStart                   : true
}, require.resolve('../tasks/individualDataTask'));

const queueMax = process.env.QUEUE_MAX || 50;
var queueCount = 0;

var upload = multer({storage: multer.diskStorage({
   filename: (req, file, cb) => {
     var extension = "";
     var type = "none";

     if( file.fieldname == SEER_DICTIONARY_FIELD_NAME ) {
       extension = "dic";
       type = "dictionary";
     } else if (file.fieldname == SEER_DATA_FIELD_NAME) {
       extension = "txt";
       type = "data";
     } else if (file.fieldname == CANSURV_DATA_FIELD_NAME ||
       file.fieldname == SEER_CSV_DATA_FIELD_NAME ) {
       extension = "csv";
       type = "data";
     }

     var _filename = util.format('%s_%s.%s',req.requestId,type,extension);
     cb(null,_filename);
   }
 })
});

exports.groupMetadataFileUpload = upload.fields([
  { name: SEER_DICTIONARY_FIELD_NAME, maxCount: 1 },
  { name: SEER_DATA_FIELD_NAME, maxCount: 1 }
]);

exports.groupDataFileUpload = upload.fields([
  {name: SEER_DICTIONARY_FIELD_NAME, maxCount: 1},
  {name: SEER_DATA_FIELD_NAME, maxCount: 1},
  {name: CANSURV_DATA_FIELD_NAME, maxCount: 1 }
]);

exports.individualDataFileUpload = upload.fields([
  { name: SEER_CSV_DATA_FIELD_NAME, maxCount: 1 }
]);

exports.resolveWorkingDestination = (req,res,next) => {
  upload.storage.getDestination(req,null, (err,directory) => {
    if (err) return next(err);
    req.workingDirectory = directory;
    next();
  });
}

exports.parseAndValidateGroupMetadata= (req, res, next) => {
  var input = {
    'requestId': req.requestId,
    'seerDictionaryFile': req.files['seerDictionaryFile'][0]['path'],
    'seerDataFile': req.files['seerDataFile'][0]['path']
  };

  req.input = input;
  next();
}

exports.parseAndValidateIndividualMetadata= (req, res, next) => {
  var input = {
    'requestId': req.requestId,
    'seerCSVDataFile': req.files['seerCSVDataFile'][0]['path']
  };

  req.input = input;
  next();
}

exports.parseAndValidateGroupData= (req, res, next) => {

 expressValidator()(req,res, () => {

    req.check('stageVariable').exists();
    req.check('stageValue').exists();
    req.check('adjustmentFactor').exists().isFloat();
    req.check('yearsOfFollowUp').exists().isFloat();

    req.getValidationResult().then( (valResult) => {

      valResult.throw();

      var input = {
        'requestId': req.requestId,
        'seerDictionaryFile': req.files['seerDictionaryFile'][0]['path'],
        'seerDataFile': req.files['seerDataFile'][0]['path'],
        'canSurvDataFile': req.files['canSurvDataFile'][0]['path'],
        'stageVariable': req.body['stageVariable'],
        'stageValue': req.body['stageValue'],
        'adjustmentFactor': req.body['adjustmentFactor'],
        'yearsOfFollowUp': req.body['yearsOfFollowUp'],
        'workingDirectory': req.workingDirectory,
        'mimeType': req.headers['accept']
      };

      req.input = input;
      next();

    }).catch( (errors) => {
      console.log(errors.array());
      res.status(400).json({ errors: errors.array() });
    });


  });
}

exports.parseAndValidateIndividualData= (req, res, next) => {

  expressValidator()(req,res, () => {

    req.check('strata').exists();
    req.check('covariates').exists();
    req.check('timeVariable').exists();
    req.check('eventVariable').exists();
    req.check('distribution').exists();
    req.check('stageVariable').exists();
    req.check('distantStageValue').exists();
    req.check('adjustmentFactor').exists().isFloat();
    req.check('yearsOfFollowUp').exists().isFloat();

    if(req.body['covariates'] && req.body['covariates'].length > 0) {
      req.check('email').exists().isEmail();
    }

    req.getValidationResult().then( (valResult) => {

      valResult.throw();
      var input = {
        'requestId': req.requestId,
        'seerCSVDataFile': req.files['seerCSVDataFile'][0]['path'],
        'strata': req.body['strata'],
        'covariates': req.body['covariates'],
        'timeVariable': req.body['timeVariable'],
        'eventVariable': req.body['eventVariable'],
        'distribution': req.body['distribution'],
        'stageVariable': req.body['stageVariable'],
        'distantStageValue': req.body['distantStageValue'],
        'adjustmentFactor': req.body['adjustmentFactor'],
        'yearsOfFollowUp': req.body['yearsOfFollowUp'],
        'email': req.body['email'],
        'workingDirectory': req.workingDirectory,
        'mimeType': req.headers['accept']
      };
      req.input = input;
      next();
    }).catch( (errors) => {
      console.log(errors.array());
      res.status(400).json({ errors: errors.array() });
    });

  });
}

var getRecurrenceRisk = (args) => {
  delete args.email;
  return new Promise( (resolve,reject) => {
    R("R/recurrence.R").data(args).call((err,data) => {
      if(err) {
        var errors = err.toString().split('\n');
        var errorMsg = errors.pop().trim();
        reject(errorMsg);
      } else {
        resolve(data);
      }
    });
  });
}

var callRecurrenceRisk = (args) => {
  console.log('Queue count: %s',queueCount);
  if(queueCount < queueMax) {
    workers(args, (err,result) => {
      console.log('Callback returned with result: %s \n error: %s',result,err);
      queueCount--;
    });
    queueCount++;
  } else {
    throw new Error('Application is too busy, try again later.');
  }
}

exports.getIndividualMetadata= (args) => {
  args['method'] = 'handleIndividualMetadata';
  return getRecurrenceRisk(args);
}

exports.getGroupMetadata= (args) => {
  args['method'] = 'handleGroupMetadata';
  return getRecurrenceRisk(args);
}

exports.getGroupData= (args) => {
  args['method'] = 'handleRecurrenceRiskGroup';
  return getRecurrenceRisk(args);
};

exports.getIndividualData= (args) => {
  args['method'] = 'handleRecurrenceRiskIndividual';
  return getRecurrenceRisk(args);
};

exports.callIndividualData= (args) => {
  args['method'] = 'handleRecurrenceRiskIndividual';
  return callRecurrenceRisk(args);
}

exports.getRecurrenceRisk = getRecurrenceRisk;
exports.callRecurrenceRisk = callRecurrenceRisk;