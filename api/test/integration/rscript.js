var R = require("../../lib/r-script");
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;

const fixtures = require("./fixtures/fixture");

describe('recurrence rscript tests', function() {

    it('test r script sync', function() {
      var result = R(fixtures.RSYNC).data("hello world", 2).callSync();
      expect(result).to.include.members([ 'oedorlwlh l', 'oldlrhelwo ' ]);
    });

    it('test r script sync with error', function() {
      try {
        var result = R(fixtures.RSYNC).data("", 2).callSync();
      } catch(err) {
        expect(err.message).to.contain('dim(X) must have a positive length');
      }
    });

    it('test r script async', function(done) {
      var attitude = JSON.parse(require("fs").readFileSync(fixtures.RDATAFILE, "utf8"));
      R(fixtures.RASYNC)
        .data({df: attitude, nGroups: 3, fxn: "mean" })
        .call(function(err, data) {
          if (err) {
            done(err.toString());
          }
          expect(data).to.be.an('array');
          expect(data).to.have.length(3);
          done();
        });

    });

    it('test r script async error', function(done) {
      var attitude = JSON.parse(require("fs").readFileSync(fixtures.RDATAFILE, "utf8"));
      R(fixtures.RASYNC)
        .data(null)
        .call(function(err, data) {
          expect(err.toString()).to.contain('no applicable method for \'mutate_\' applied to an object of class "function"');
          done();
        });

    });

    it('test r scrip async timeout before the process completes', function(done) {
      var attitude = JSON.parse(require("fs").readFileSync(fixtures.RDATAFILE, "utf8"));
      R(fixtures.RASYNC)
        .data({df: attitude, nGroups: 3, fxn: "mean" })
        .withTimer(1)
        .call(function(err, data) {
          expect(err.toString()).to.contain('An unknown error occurred.');
          done();
        });

    });

});