let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let expect = chai.expect;
const fixtures = require("./fixtures/fixture");
chai.use(chaiHttp);


describe('recurrence api endpoint integration tests', function() {

    process.env.SMTP_HOST = 'testhost';
    let app = require('../../app');

    it('should call get group metadata api endpoint and get metadata', () => {
      return chai.request(app)
        .post('/recurrence/groupMetadata')
        .attach('seerDictionaryFile',fixtures.DICTIONARY)
        .attach('seerDataFile',fixtures.TEXTDATA)
        .then( (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.include(fixtures.GROUP_METADATA);
        });
    });

    it('should call get group metadata api endpoint and get Unexpected field error', () => {
      return chai.request(app)
        .post('/recurrence/groupMetadata')
        .attach('seerDictionaryFile',fixtures.DICTIONARY)
        .attach('badfilename',fixtures.TEXTDATA)
        .then( (res) => {
          expect(res).to.have.status(500);
      });
    });

    it('should call get group metadata api endpoint correctly but fail R script', () => {
      return chai.request(app)
        .post('/recurrence/groupMetadata')
        .attach('seerDictionaryFile',fixtures.DICTIONARY)
        .attach('seerDataFile',fixtures.DICTIONARY)
        .then( (res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.deep.include({ errors: [ { msg: 'system error' } ] });
      });
    });

    it('should call get individual metadata api endpoint and get metadata', () => {
      return chai.request(app)
        .post('/recurrence/individualMetadata')
        .attach('seerCSVDataFile',fixtures.CSVDATA)
        .then( (res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.include(fixtures.INDIVIDUAL_METADATA);
        });

    });

    it('should call get group data result with success', () => {
      return chai.request(app)
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
       });
    });

    it('should call get group data result with R script error', () => {
      return chai.request(app)
       .post('/recurrence/groupData')
       .set('accept','application/json')
       .attach('seerDictionaryFile',fixtures.DICTIONARY)
       .attach('seerDataFile',fixtures.TEXTDATA)
       .field('stageVariable','SEER_historic_stage_LRD')
       .field('stageValue','0')
       .field('yearsOfFollowUp','5')
       .field('adjustmentFactor','0.05')
       .attach('canSurvDataFile',fixtures.TEXTDATA)
       .type('form')
       .then( (res) => {
         expect(res).to.have.status(400);
         expect(res.body).to.deep.include({ errors: [ { msg: 'argument of length 0'}]});
       });
    });

    it('should call get group data result with failure missing field', () => {
      return chai.request(app)
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
       });
    });

    it('should call get individual data result with success', () => {
      return chai.request(app)
       .post('/recurrence/individualData')
       .set('accept','application/json')
       .field('strata','yeargroup,agegroup')
       .field('covariates','')
       .field('timeVariable','time')
       .field('eventVariable','status')
       .field('distribution','Weibull')
       .field('stageVariable','agegroup')
       .field('distantStageValue','1')
       .field('adjustmentFactor','1.05')
       .field('yearsOfFollowUp','22')
       .attach('seerCSVDataFile',fixtures.CSVDATA)
       .type('form')
       .then( (res) => {
         expect(res).to.have.status(200);
         expect(res.body).to.be.an('array');
         expect(res.body).to.have.length(88);
       });
    });

    it('should call get individual data result with R script error', () => {
      return chai.request(app)
       .post('/recurrence/individualData')
       .set('accept','application/json')
       .field('strata','yeargroup,agegroup')
       .field('covariates','')
       .field('timeVariable','time')
       .field('eventVariable','status')
       .field('distribution','Weibull')
       .field('stageVariable','agegroup')
       .field('distantStageValue','1')
       .field('adjustmentFactor','1.05')
       .field('yearsOfFollowUp','1')
       .attach('seerCSVDataFile',fixtures.CANSURVVDATA) //incorrect file so it breaks
       .type('form')
       .then( (res) => {
         expect(res).to.have.status(400);
         expect(res.body).to.deep.include({ errors: [ { msg: 'undefined columns selected'}]});
       });
    });

    it('should call get individual data result with missing field', () => {
      return chai.request(app)
       .post('/recurrence/individualData')
       .set('accept','application/json')
       .field('strata','yeargroup,agegroup')
       .field('covariates','')
       .field('timeVariable','time')
       .field('eventVariable','status')
       .field('distribution','Weibull')
       .field('stageVariable','agegroup')
       .field('distantStageValue','1')
       .field('adjustmentFactor','1.05')
       //.field('yearsOfFollowUp','22')
       .attach('seerCSVDataFile',fixtures.CSVDATA)
       .type('form')
       .then( (res) => {
         expect(res).to.have.status(400);
         expect(res.text).to.contain('yearsOfFollowUp');
       });
    });

    //should trigger email but making sure it fails when trying to send email
    it('should call get individual data result for async request', (done) => {
        chai.request(app)
       .post('/recurrence/individualData')
       .set('accept','application/json')
       .field('strata','yeargroup,agegroup')
       .field('covariates','yeargroup,agegroup')
       .field('timeVariable','time')
       .field('eventVariable','status')
       .field('distribution','Weibull')
       .field('stageVariable','agegroup')
       .field('distantStageValue','1')
       .field('adjustmentFactor','1.05')
       .field('yearsOfFollowUp','22')
       .field('email','test12345@nih.gov')
       .attach('seerCSVDataFile',fixtures.CSVDATA)
       .type('form')
       .then( (res) => {
         expect(res).to.have.status(202);
         setInterval( () => done(), 10000);
       });
    });

});