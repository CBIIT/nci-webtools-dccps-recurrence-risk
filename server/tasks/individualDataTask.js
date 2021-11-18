var R = require("../lib/r-script");
var logger = require('../utils/loggerUtil').logger;

const DEFAULT_WORKER_TIMEOUT = 1000*60*60*2; //2 hours

function doIndividualDataTask(input,cb) {
  logger.log('info','doIndividualDataTask ==> received: ' ,input);
  let fileResult;
  let error;
  let email = input.email;
  let taskInput = Object.assign({},input);
  delete taskInput.email;
  delete taskInput.seerCSVDataFileOriginalName;
  //default attachment
  taskInput.mimeType = 'text/csv';

  logger.log('info','doIndividualDataTask ==> timeout in: ' ,process.env.WORKER_TIMEOUT || DEFAULT_WORKER_TIMEOUT);
  R("R/recurrence.R").data(taskInput)
    .withTimer(process.env.WORKER_TIMEOUT || DEFAULT_WORKER_TIMEOUT)
    .call((err,data) => {

    if(err) {
      let errors = err.toString().split('\n');
      let errorMsg = errors.pop().trim();
      error = new Error(errorMsg);
    } else {
      fileResult = data.pop();
    }

    cb(error,{
      fileResult: fileResult ,
      receivers: email,
      originalInput: input
     });

  });
}

module.exports=doIndividualDataTask