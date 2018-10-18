var R = require("../lib/r-script");
var emailUtil = require("../utils/recurrenceEmailUtil");

function doIndividualDataTask(input,cb) {
  console.log('doIndividualDataTask ==> received: ' ,input);
  var fileResult;
  var error;
  var email = input.email;
  delete input.email;
  //default attachment
  input.mimeType = 'text/csv';

  try {
    fileResult = R("R/recurrence.R").data(input).callSync();
    fileResult = fileResult.pop();
  } catch(err) {
    console.log('doIndividualDataTask ==> error: ',err);
    var errors = err.split('\n');
    var errorMsg = errors.pop().trim();
    error = new Error(errorMsg.replace(/[‘’]/g,''));
  }

  emailUtil.sendMail(error,{
    fileResult: fileResult ,
    receivers: email,
    originalInput: input
    });
  cb(null,'done');
}

module.exports=doIndividualDataTask