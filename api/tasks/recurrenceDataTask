var R = require("../lib/r-script");
var logger = require('../utils/loggerUtil').logger;

const DEFAULT_WORKER_TIMEOUT = 1000*120; //2 minutes

function doRecurrenceDataTask(input,cb) {

  logger.log('info','doRecurrenceDataTask ==> received: ' ,input );
  let fileResult;
  let error;
  let taskInput = Object.assign({},input);
  delete taskInput.email;
  delete taskInput.seerCSVDataFileOriginalName;

  logger.log('info','doRecurrenceDataTask ==> timeout in: ' ,process.env.WORKER_TIMEOUT || DEFAULT_WORKER_TIMEOUT);
  R("R/recurrence.R").data(taskInput)
   .withTimer(process.env.WORKER_TIMEOUT || DEFAULT_WORKER_TIMEOUT)
   .call((err,data) => {
    if(err) {
      let errors = err.toString().split('\n');
      let errorMsg = errors.pop().trim();
      error = new Error(errorMsg);
    } else {
      fileResult = data;
    }
    cb(error,fileResult);
  });
}

module.exports=doRecurrenceDataTask