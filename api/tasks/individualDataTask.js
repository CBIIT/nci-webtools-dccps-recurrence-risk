var R = require("../lib/r-script");

function doIndividualDataTask(input,cb) {
  console.log('doIndividualDataTask ==> received: ' ,input);
  let fileResult;
  let error;
  let email = input.email;
  let taskInput = Object.assign({},input);
  delete taskInput.email;
  delete taskInput.seerCSVDataFileOriginalName;
  //default attachment
  taskInput.mimeType = 'text/csv';

  R("R/recurrence.R").data(taskInput).call((err,data) => {

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