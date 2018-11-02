var util = require('util');
var multer = require('multer');
var emailUtil = require("../utils/recurrenceEmailUtil");
var events = require('events').EventEmitter;
var logger = require('./loggerUtil').logger;

const expressValidator = require('express-validator');

const SEER_DICTIONARY_FIELD_NAME = "seerDictionaryFile";
const SEER_DATA_FIELD_NAME       = "seerDataFile";
const CANSURV_DATA_FIELD_NAME    = "canSurvDataFile";
const SEER_CSV_DATA_FIELD_NAME   = "seerCSVDataFile";

var workerUtil = require('../utils/workerUtil');
var workerListener = new events.EventEmitter();

workerListener.on('recover', (args) => {
	callRecurrenceRisk(args);
});

workerUtil.init(workerListener);

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
      logger.log('info','validation errors. ',errors.array());
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

    if(  (req.body['covariates'] && req.body['covariates'].length > 0)
      || (req.body['strata'] && req.body['strata'].split(',').length > 2)
    ) {
      req.check('email').exists().isEmail();
      req.isResponseByEmail = true;
    }

    req.getValidationResult().then( (valResult) => {

      valResult.throw();

      var input = {
        'requestId': req.requestId,
        'seerCSVDataFile': req.files['seerCSVDataFile'][0]['path'],
        'seerCSVDataFileOriginalName': req.files['seerCSVDataFile'][0]['originalname'],
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
      logger.log('info','validation errors ',errors.array());
      res.status(400).json({ errors: errors.array() });
    });

  });
}

var getRecurrenceRisk = (args) => {
  return new Promise( (resolve,reject) => {
    workerUtil.getRecurrenceTask(args, (err,data) => {
      if(err) {
        logger.log('error','getRecurrenceRisk error: ',err);
        var errors = err.message.split('\n');
        var errorMsg = errors.pop().trim();
        reject(errorMsg);
      } else {
        resolve(data);
      }
    });
  });
}

var callRecurrenceRisk = (args) => {
  workerUtil.callIndividualTask(args, (err,result) => {
	logger.log('info','Callback returned with result and error',result,err);
    emailUtil.sendMail(err,result || { receivers: args.email});
  });
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