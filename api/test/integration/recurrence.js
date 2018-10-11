let assert = require('assert');

let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../../app');
let should = chai.should();
let expect = chai.expect;

const fixtures = require("./fixtures/fixture");

chai.use(chaiHttp);

describe('recurrence api endpoint', function() {

    beforeEach( () => { });

    it('should call get group metadata api endpoint and get metadata', function(done) {
      chai.request(app)
        .post('/recurrence/groupMetadata')
        .attach('seerDictionaryFile',fixtures.DICTIONARY)
        .attach('seerDataFile',fixtures.TEXTDATA)
        .then( (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.include(fixtures.GROUP_METADATA);
          done();
        }).
        catch( (err) => {
          done(err);
        });

    });

    it('should call get group metadata api endpoint and get Unexpected field error', function(done) {
          chai.request(app)
            .post('/recurrence/groupMetadata')
            .attach('seerDictionaryFile',fixtures.DICTIONARY)
            .attach('badfilename',fixtures.TEXTDATA)
            .then( (res) => {
              expect(res).to.have.status(500);
              done();
            }).
            catch( (err) => {
              done(err);
            });

        });

    it('should call get individual metadata api endpoint and get metadata', function(done) {
      chai.request(app)
        .post('/recurrence/individualMetadata')
        .attach('seerCSVDataFile',fixtures.CSVDATA)
        .then( (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.include(fixtures.INDIVIDUAL_METADATA);
          done();
        }).
        catch( (err) => {
          done(err);
        });

    });

    it('should call get group data result with success', function(done) {
      chai.request(app)
       .post('/recurrence/groupData')
       .set('accept','application/json')
       .attach('seerDictionaryFile',fixtures.DICTIONARY)
       .attach('seerDataFile',fixtures.TEXTDATA)
       .attach('canSurvDataFile',fixtures.CANSURVVDATA)
       .field('stageVariable','SEER_historic_stage_LRD')
       .field('stageValue','0')
       .field('yearsOfFollowUp','5')
       .field('adjustmentFactor','0.05')
       .then( (res) => {
         expect(res).to.have.status(200);
         expect(res.body).to.be.an('array');
         expect(res.body).to.have.length(120);
         done();
       }).
       catch( (err) => {
         done(err);
       });
    });

    it('should call get group data result with failure missing field', function(done) {
      chai.request(app)
       .post('/recurrence/groupData')
       .set('accept','application/json')
       .attach('seerDictionaryFile',fixtures.DICTIONARY)
       .attach('seerDataFile',fixtures.TEXTDATA)
       .attach('canSurvDataFile',fixtures.CANSURVVDATA)
       .field('stageVariable','SEER_historic_stage_LRD')
       .field('yearsOfFollowUp','5')
       .field('adjustmentFactor','0.05')
       .then( (res) => {
         expect(res).to.have.status(400);
         expect(res.text).to.contain('stageValue');
         done();
       }).
       catch( (err) => {
         done(err);
       });
    });
});