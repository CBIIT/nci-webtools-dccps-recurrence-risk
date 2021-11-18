let chai = require('chai');
let sinon = require('sinon');
let rewire = require('rewire');

let should = chai.should();
let expect = chai.expect;
let events = require('events').EventEmitter;
let util = rewire("../../utils/workerUtil");

describe('worker utility test', function() {

  it('should call init with successfully', (done) => {
    var readdirMock = () => Promise.resolve(['input.json']);
    var readfileMock = () => Promise.resolve('{"key":"value"}');
    let listener = new events.EventEmitter();

    util.__with__({
      readFile: readfileMock,
      readdir: readdirMock
    })( () => {
      util.init(listener);
      listener.on('recover',(data)=> {
        expect(data).to.contain({ key: 'value', isRecovery: true});
        done();
      });
    });
  });

  it('should call callIndividualTask with success', (done) => {
    var farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    var workerMock = (args,cb) => { cb(null,'done') };

    util.__with__({
      workerFarm: farmMock,
      emailWorkers: workerMock,
    })( () => {
      util.callIndividualTask({stageVariable: 'coding'}, (err,result) => {
        expect(result).to.equal('done');
        done();
      });

    });
  });

  it('should call getRecurrenceTask with success', (done) => {
    var farmMock = (options,task) => { return (args,cb) => { cb(null,'done'); } };
    var workerMock = (args,cb) => { cb(null,'done') };
    util.__with__({
      workerFarm: farmMock,
      webWorkers: workerMock
    })( () => {
      util.getRecurrenceTask({stageVariable: 'var'}, (err,result) => {
        expect(result).to.equal('done');
        done();
      });
    });
  });

});