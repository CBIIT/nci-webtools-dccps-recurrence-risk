var R = require("../lib/r-script");
var emailUtil = require("../utils/recurrenceEmailUtil");

function doIndividualDataTask(input,cb) {
  console.log('doIndividualDataTask ==> received: ' ,input);
  let fileResult;
  let error;
  let email = input.email;
  delete input.email;
  //default attachment
  input.mimeType = 'text/csv';

  R("R/recurrence.R").data(input).call((err,data) => {
    if(err) {
      let errors = err.toString().split('\n');
      let errorMsg = errors.pop().trim();
      error = new Error(errorMsg.replace(/[‘’]/g,''));
    } else {
      fileResult = data.pop();
    }
    //[todo] what happens if this fails?
    emailUtil.sendMail(error,{
      fileResult: fileResult ,
      receivers: email,
      originalInput: input
      });

    cb(null,'done');
  });
}

module.exports=doIndividualDataTask