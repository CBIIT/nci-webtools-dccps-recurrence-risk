let chai = require('chai');
let sinon = require('sinon');
let rewire = require('rewire');

let should = chai.should();
let expect = chai.expect;

let util = rewire("../../utils/recurrenceUtil");

describe('recurrence utility test', function() {

  it('should test callRecurrenceRisk successfully', () => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { callSync: () => ['your_results'] }}} };
    let farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    let cbSpy = sinon.spy();
    let workerMock = (args,cb) => { cbSpy(null,'done'); };

    util.__with__({
      R: mockRscript,
      workerFarm: farmMock,
      workers: workerMock
    })( () => {
      util.callRecurrenceRisk({ covariate: 1.23});
      sinon.assert.calledOnce(cbSpy);
      sinon.assert.calledWith(cbSpy,null,'done');

    });

  });

  it('should test callRecurrenceRisk with error', () => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { callSync: () => ['your_results'] }}} };
    let farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    let cbSpy = sinon.spy();
    let workerMock = (args,cb) => { cbSpy('error','done'); };

    util.__with__({
      R: mockRscript,
      workerFarm: farmMock,
      workers: workerMock
    })( () => {
      util.callRecurrenceRisk({ covariate: 1.23});
      sinon.assert.calledOnce(cbSpy);
      sinon.assert.calledWith(cbSpy,'error','done');

    });

  });

  it('should test callRecurrenceRisk with error due to server busy', () => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { callSync: () => ['your_results'] }}} };
    let farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    let cbSpy = sinon.spy();
    let workerMock = (args,cb) => { cbSpy('error','done'); };

    util.__with__({
      R: mockRscript,
      workerFarm: farmMock,
      workers: workerMock,
      queueMax: -1
    })( () => {
      try {
        util.callRecurrenceRisk({ covariate: 1.23});
      } catch(error) {
        expect(error.message).to.contain('too busy, try again later');
      }

      //should have been called due to error
      sinon.assert.notCalled(cbSpy);
    });
  });

  it('should test getRecurrenceRisk successfully', () => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { callSync: () => ['your_results'] }}} };
    let farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    let workerMock = (args,cb) => { cb(null,'done'); };

    util.__with__({
      R: mockRscript,
      workerFarm: farmMock,
      workers: workerMock
    })( () => {
      var result = util.getRecurrenceRisk({ covariate: 1.23});
      expect(result).to.contain('your_results');
    });

  });

  it('should test getRecurrenceRisk with exception', () => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { callSync: () => { throw Error('uh oh!!')} }}} };
    let farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    let workerMock = (args,cb) => { cb(null,'done'); };

    util.__with__({
      R: mockRscript,
      workerFarm: farmMock,
      workers: workerMock
    })( () => {
      try {
        util.getRecurrenceRisk({ covariate: 1.23});
      } catch(error) {
        expect(error.message).to.contain('uh oh!!');
      }
    });

  });
});