var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require("underscore");
var logger = require('./loggerUtil').logger;

var writeFile = util.promisify(fs.writeFile);
var readFile = util.promisify(fs.readFile);
var copyFile = util.promisify(fs.copyFile);
var unlinkFile = util.promisify(fs.unlink);
var readdir = util.promisify(fs.readdir);
var statFile = util.promisify(fs.stat);

var workerFarm = require('worker-farm');
var emailWorkers = workerFarm({
       workerOptions               : {env: _.extend({WORKER_TIMEOUT: 1000 * 60 * 60 * 2 }, process.env) } //2 hours and zap it
     , maxCallsPerWorker           : 20 //safe guard against memory leaks
     , maxConcurrentWorkers        : 1  // 1 worker at a time
     , maxConcurrentCallsPerWorker : 1  // 1 tasks per worker
     , maxConcurrentCalls          : 10 // DOS setting, can crash if too many
     , maxCallTime                 : Infinity
     , maxRetries                  : 1
     , autoStart                   : false
}, require.resolve('../tasks/individualDataTask'));

var webWorkers = workerFarm({
       workerOptions               : {env: _.extend({WORKER_TIMEOUT: 1000 * 300}, process.env) } //5 minutes and zap it
     , maxCallsPerWorker           : 20 //safe guard against memory leaks
     , maxConcurrentWorkers        : 1  // 1 web worker at a time
     , maxConcurrentCallsPerWorker : 4  // 4 tasks per worker
     , maxConcurrentCalls          : 20 // DOS setting, can crash if too many
     , maxCallTime                 : Infinity // not using since it will timeout all tasks assigned to worker
     , maxRetries                  : 1
     , autoStart                   : false
}, require.resolve('../tasks/recurrenceDataTask'));

const maxFileAge = process.env.RECURRENCE_FILE_TTL_MINUTES || 15; //default 15 minutes
const fileCleanInterval = process.env.RECURRENCE_FILE_CLEAN_MINUTES || 5; //default 5 minutes
const queueMax = process.env.QUEUE_MAX || 50;
const workingDir = path.normalize(path.join(__dirname ,'..','data'));
const workingDirStaged = path.normalize(path.join(__dirname ,'..','data/staging'));

var queueCount = 0;


var preProcessInput = (data) => {
  if(data.isRecovery) {
    delete data.isRecovery;
	return Promise.resolve(data);
  } else {
    var seerCSVDataFileInput = path.join(workingDirStaged,util.format('%s_data.csv',data.requestId));
	var seerCSVDataFileRequest = path.join(workingDirStaged,util.format('%s_input.json',data.requestId));

    return new Promise( (resolve,reject) => {
      var seerCSVDataFileTemp = data.seerCSVDataFile;
      data.seerCSVDataFile = seerCSVDataFileInput;
      writeFile(seerCSVDataFileRequest, JSON.stringify(data), 'utf8')
      .catch( (err) => logger.log('info','Could not create file request json %s',err))
      .then( () => copyFile(seerCSVDataFileTemp,seerCSVDataFileInput) )
      .catch( (err) => logger.log('info','Could not copy file input csv %s',err) )
      .then( () => resolve(data) );

    });
  }
}

var postProcessInput = (data) => {
  var seerCSVDataFileInput = path.join(workingDirStaged,util.format('%s_data.csv',data.requestId));
  var seerCSVDataFileRequest = path.join(workingDirStaged,util.format('%s_input.json',data.requestId));
  return new Promise( (resolve,reject) => {
   unlinkFile(seerCSVDataFileInput)
    .catch( (err) => logger.log('info','Could not delete file input csv %s',err))
    .then( () => unlinkFile(seerCSVDataFileRequest))
    .catch( (err) => logger.log('info','Could not delete file request json %s',err))
    .then( () => resolve(data))
  });
}

var extension = (element) => {
  var extName = path.extname(element);
  return extName === '.json';
};

var _callIndividualTask = (input,workersHandle,cb) => {
 logger.log('info','Queue count: %s',queueCount);
 if(queueCount < queueMax) {
   queueCount++;
   preProcessInput(input).then( (data) => {
     logger.log('info','resolved pre-process ....');
     workersHandle(data, (err,result) => {
       logger.log('info','Callback returned with result: ', result, err);
       queueCount--;
  	   postProcessInput(data).then( () => cb(err,result) ); });
   });
 } else {
   throw new Error('Application is too busy, try again later.');
 }
}

var _getRecurrenceTask = (input,workersHandle,cb) => {
	workersHandle(input, (err,result) => {
      logger.log('info','Callback returned with result: ', result, err);
 	  cb(err,result);
	});
}

var _end = () => {
  let finished = (name) => logger.log('info','worker name: %s was ended.',name);
  workerFarm.end(emailWorkers,finished('email-worker'));
  workerFarm.end(webWorkers),finished('web-worker');
}

var _init = (listener,readFileHandler) => {
  setInterval( () => {
    readdir(workingDir).then( (files) => {
      files.forEach( (fileName) => {
        statFile(path.join(workingDir,fileName))
        .then( (stats) => {
          let minutes = (new Date().getTime() - new Date(stats.mtime).getTime()) / (1000*60);
          logger.log('info','File %s was last accessed %d minutes',fileName,minutes);
          if(stats.isFile() && minutes > maxFileAge) {
            unlinkFile(path.join(workingDir,fileName))
            .then( () => logger.log('info','fileName: %s was removed successfully',fileName))
            .catch( (err) => logger.log('error','There was an issue removing fileName: %s',fileName,err));
          }
        }).catch((err) => logger.log('error','something went wrong with getting statistics for file %s',fileName,err));
      });
    });
  }, fileCleanInterval * 1000 * 60 );

  readdir(workingDirStaged).then( (files) => {
    files.filter(extension).forEach( (fileName) => {
    readFileHandler(path.join(workingDirStaged,fileName)).then( (data) => {
      try {
        let recoverData = JSON.parse(data);
        recoverData.isRecovery = true;
        listener.emit('recover',recoverData);
      } catch(err) {
        logger.log('error','init error could not find file listed',err);
      }
    });
  });
  });
}

exports.callIndividualTask = (input,cb) => _callIndividualTask(input,emailWorkers,cb);
exports.getRecurrenceTask = (input,cb) => _getRecurrenceTask(input,webWorkers,cb);
exports.init = (listener) => _init(listener,readFile);
exports.end = () => _end();