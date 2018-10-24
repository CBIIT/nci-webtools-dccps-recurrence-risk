let chai = require('chai');
let sinon = require('sinon');
let rewire = require('rewire');

let should = chai.should();
let expect = chai.expect;

let task = rewire("../../tasks/individualDataTask");

describe('recurrence individual data task tests', function() {

  it('test run task correctly and send email', () => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { call: (cb) => cb(null,['your_results']) }}} };
    let mockEmailUtil = { sendMail: (err,data) => console.log(err,data)};
    let sendMailSpy = sinon.spy(mockEmailUtil,'sendMail');
    let emailData =
      { fileResult: 'your_results',
        receivers: 'test@email.com',
        originalInput: { data: 1, mimeType: 'text/csv' } };

    task.__with__({
      R: mockRscript ,
      emailUtil: mockEmailUtil
    })( () => {
      task({ data: 1 , email: 'test@email.com'}, () => {
        sinon.assert.calledOnce(sendMailSpy);
        sinon.assert.calledWith(sendMailSpy,undefined,emailData);
      });

    });

  });

  it('test run task with exception and send error email', () => {
    let bigError = new Error('not again!!');
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { call: (cb) => { cb(bigError,null) }}}} };
    let mockEmailUtil = { sendMail: (err,data) => console.log(err,data)};
    let sendMailSpy = sinon.spy(mockEmailUtil,'sendMail');
    let emailData =
      { fileResult: undefined,
        receivers: 'test@email.com',
        originalInput: { data: 1, mimeType: 'text/csv' } };

    task.__with__({
      R: mockRscript ,
      emailUtil: mockEmailUtil
    })( () => {
      task({ data: 1 , email: 'test@email.com'}, () => {
        sinon.assert.calledOnce(sendMailSpy);
        sinon.assert.calledWith(sendMailSpy,sinon.match.defined,sinon.match(emailData));
      });

    });

  });

});