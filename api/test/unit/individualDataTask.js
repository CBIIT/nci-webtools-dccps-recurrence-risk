let chai = require('chai');
let rewire = require('rewire');

let should = chai.should();
let expect = chai.expect;

let task = rewire("../../tasks/individualDataTask");

describe('recurrence individual data task tests', function() {

  it('test run task correctly', (done) => {
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { call: (cb) => cb(null,['your_results']) }}} };

    task.__with__({
      R: mockRscript
    })( () => {
      task({ data: 1 , email: 'test@email.com'}, (err,data) => {
        expect(err).to.be.undefined;
        expect(data.receivers).to.equal('test@email.com');
        expect(data.fileResult).to.equal('your_results');
        expect(data.originalInput).to.contain({ data: 1, email: 'test@email.com'});
        done();
      });

    });

  });

  it('test run task with exception and send error email', (done) => {
    let bigError = new Error('not again!!');
    let mockRscript = (rscriptToRun) => { return { data: (input) => { return { call: (cb) => { cb(bigError,null) }}}} };
    task.__with__({
      R: mockRscript
    })( () => {
      task({ data: 1 , email: 'test@email.com'}, (err,data) => {
        expect(err).not.to.be.undefined;
        expect(err.message).to.contain('not again!!');
        expect(data.receivers).to.equal('test@email.com');
        expect(data.fileResult).to.be.undefined;
        expect(data.originalInput).to.contain({ data: 1, email: 'test@email.com'});
        done();
      });

    });

  });

});