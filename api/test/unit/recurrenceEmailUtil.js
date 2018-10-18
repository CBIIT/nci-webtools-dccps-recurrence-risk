let chai = require('chai');
let sinon = require('sinon');
let rewire = require('rewire');

let should = chai.should();
let expect = chai.expect;

var emailUtil = rewire("../../utils/recurrenceEmailUtil");

describe('recurrence email util tests', function() {


    it('test send email correctly', () => {
      let mockTransporter = { sendMail: (ops,cb) => cb(null,{ messageId:'messageid' } ) };
      let sendMailSpy = sinon.spy(mockTransporter,'sendMail');
      emailUtil.__with__({
        transporter: mockTransporter
      })( () => {
        emailUtil.sendMail(null,{ originalIInput : {} , fileResult: 'result.csv'});
        sinon.assert.calledOnce(sendMailSpy);
      });

    });

    it('test send email and transport throws error', () => {
       let mockTransporter = { sendMail: (ops,cb) => cb(new Error('Uh oh!!'),null ) };
       let sendMailSpy = sinon.spy(mockTransporter,'sendMail');
       emailUtil.__with__({
         transporter: mockTransporter
       })( () => {
         try {
         emailUtil.sendMail(null,{ originalIInput : {} , fileResult: 'result.csv'})
         } catch(e) {
           expect(e.message).to.contain('Uh oh!!');
           sinon.assert.calledOnce(sendMailSpy);
         }

       });

    });

    it('test send email with calculation errors', () => {
      let mockTransporter = { sendMail: (ops,cb) => cb(null,{ messageId: 'messageid'} ) };
      let sendMailSpy = sinon.spy(mockTransporter,'sendMail');
      emailUtil.__with__({
        transporter: mockTransporter
      })( () => {
        try {
          emailUtil.sendMail('error!!!',{ originalIInput : {} , fileResult: 'result.csv'})
        } catch(e) {
          fail();
        }
        sinon.assert.calledOnce(sendMailSpy);
      });
    });

});