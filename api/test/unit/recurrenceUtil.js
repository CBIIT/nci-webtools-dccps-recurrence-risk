let chai = require('chai');
let sinon = require('sinon');
let rewire = require('rewire');

let should = chai.should();
let expect = chai.expect;

let util = rewire("../../utils/recurrenceUtil");

describe('recurrence utility test', function() {

  it('should test callRecurrenceRisk successfully', (done) => {
    let mockEmailUtil = { sendMail: (err,data) => console.log(err,data)};
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { callSync: () => ['your_results'] }}} };
    let sendEmailSpy = sinon.spy(mockEmailUtil,'sendMail');
    let mockWorkerUtil = {
      init: () => console.log('init') ,
      callIndividualTask: (args,cb) => cb(null,{ originalInput: {covariate: 1.23}, receivers: 'test@email.com' })
     };

    util.__with__({
      R: mockRscript,
      emailUtil: mockEmailUtil,
      workerUtil: mockWorkerUtil
    })( () => {
      util.callRecurrenceRisk({ covariate: 1.23});
      sinon.assert.calledOnce(sendEmailSpy);
      sinon.assert.calledWith(sendEmailSpy,null, { originalInput: {covariate: 1.23} ,receivers: 'test@email.com'});
      done();
    });

  });

  it('should test callRecurrenceRisk with error', (done) => {
    let mockEmailUtil = { sendMail: (err,data) => console.log(err,data)};
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { callSync: () => ['your_results'] }}} };
    let mockWorkerUtil = {
          init: () => console.log('init') ,
          callIndividualTask: (args,cb) => cb('error','done')
         };
    let sendEmailSpy = sinon.spy(mockEmailUtil,'sendMail');

    util.__with__({
      R: mockRscript,
      workerUtil: mockWorkerUtil,
      emailUtil: mockEmailUtil
    })( () => {
      util.callRecurrenceRisk({ covariate: 1.23});
      sinon.assert.calledOnce(sendEmailSpy);
      sinon.assert.calledWith(sendEmailSpy,'error','done');
      done();
    });

  });

  it('should test callRecurrenceRisk with error due to server busy', (done) => {
    let mockEmailUtil = { sendMail: (err,data) => console.log(err,data)};
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { callSync: () => ['your_results'] }}} };
    let mockWorkerUtil = {
              init: () => console.log('init') ,
              callIndividualTask: (args,cb) => { throw Error('too busy, try again later') }
             };
    let sendEmailSpy = sinon.spy(mockEmailUtil,'sendMail');

    util.__with__({
      R: mockRscript,
      workerUtil: mockWorkerUtil,
      emailUtil: mockEmailUtil
    })( () => {
      try {
        util.callRecurrenceRisk({ covariate: 1.23});
      } catch(error) {
        expect(error.message).to.contain('too busy, try again later');
        sinon.assert.notCalled(sendEmailSpy);
        done();
      }

    });
  });

  it('should test getRecurrenceRisk successfully', (done) => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { call: (cb) => cb(null,['your_results']) }}} };
    let farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    let workerMock = (args,cb) => { cb(null,'done'); };

    util.__with__({
      R: mockRscript,
      workerFarm: farmMock,
      workers: workerMock
    })( () => {
      util.getRecurrenceRisk({ covariate: 1.23})
        .then( (data) => {
        expect(data).to.contain('your_results');
        done();
      });

    });

  });

  it('should test getRecurrenceRisk with exception', (done) => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { call: (cb) => { cb('uh oh!!\noops')} }}} };
    let farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    let workerMock = (args,cb) => { cb(null,'done'); };

    util.__with__({
      R: mockRscript,
      workerFarm: farmMock,
      workers: workerMock
    })( () => {
        util.getRecurrenceRisk({ covariate: 1.23}).catch( (err) => {
          expect(err).to.contain('oops');
          done();
        });
    });

  });
});