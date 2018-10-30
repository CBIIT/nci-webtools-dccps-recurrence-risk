var fs = require('fs');
var path = require('path');
var util = require('util');

var writeFile = util.promisify(fs.writeFile);
var readFile = util.promisify(fs.readFile);
var copyFile = util.promisify(fs.copyFile);
var unlinkFile = util.promisify(fs.unlink);
var readdir = util.promisify(fs.readdir);

var workerFarm = require('worker-farm');
var workers = workerFarm({
       maxCallsPerWorker           : 20 //safe guard against memory leaks
     , maxConcurrentWorkers        : 1  // 1 worker at a time
     , maxConcurrentCallsPerWorker : 2  // 2 tasks per worker
     , maxConcurrentCalls          : 10 // DOS setting, can crash if too many
     , maxCallTime                 : Infinity
     , maxRetries                  : 1
     , autoStart                   : true
}, require.resolve('../tasks/individualDataTask'));

const queueMax = process.env.QUEUE_MAX || 50;
const workingDir = path.normalize(path.join(__dirname ,'..','data'));
var queueCount = 0;


var preProcessInput = (data) => {
  if(data.isRecovery) {
    delete data.isRecovery;
	return Promise.resolve(data);
  } else {
    var seerCSVDataFileInput = path.join(workingDir,util.format('%s_data.csv',data.requestId));
	var seerCSVDataFileRequest = path.join(workingDir,util.format('%s_input.json',data.requestId));

    return new Promise( (resolve,reject) => {
      var seerCSVDataFileTemp = data.seerCSVDataFile;
      data.seerCSVDataFile = seerCSVDataFileInput;
      writeFile(seerCSVDataFileRequest, JSON.stringify(data), 'utf8')
      .catch( (err) => console.log(err))
      .then( () => copyFile(seerCSVDataFileTemp,seerCSVDataFileInput) )
      .catch( (err) => console.log(err) )
      .then( () => resolve(data) );

    });
  }
}

var postProcessInput = (data) => {
  var seerCSVDataFileInput = path.join(workingDir,util.format('%s_data.csv',data.requestId));
  var seerCSVDataFileRequest = path.join(workingDir,util.format('%s_input.json',data.requestId));
  return new Promise( (resolve,reject) => {
   unlinkFile(seerCSVDataFileInput)
    .catch( (err) => console.log(err))
    .then( () => unlinkFile(seerCSVDataFileRequest))
    .catch( (err) => console.log(err))
    .then( () => resolve(data))
  });
}

var extension = (element) => {
  var extName = path.extname(element);
  return extName === '.json';
};


var _callIndividualTask = (input,workersHandle,cb) => {
 console.log('Queue count: %s',queueCount);
 if(queueCount < queueMax) {
   preProcessInput(input).then( (data) => {
     console.log('resolved pre-process ....');
     workersHandle(data, (err,result) => {
       console.log('Callback returned with result: %s \n error: %s', result, err);
       queueCount--;
  	 postProcessInput(data).then( () => cb(err,result) ); });
     queueCount++;
   });
 } else {
   throw new Error('Application is too busy, try again later.');
 }
}

var _init = (listener,readFileHandler) => {
  readdir(workingDir).then( (files) => {
    files.filter(extension).forEach( (fileName) => {
    readFileHandler(path.join(workingDir,fileName)).then( (data) => {
      try {
        let recoverData = JSON.parse(data);
        recoverData.isRecovery = true;
        listener.emit('recover',recoverData);
      } catch(err) {
        console.log(err);
      }
    });
  });
  });
}

exports.callIndividualTask = (input,cb) => _callIndividualTask(input,workers,cb);
exports.init = (listener) => _init(listener,readFile);