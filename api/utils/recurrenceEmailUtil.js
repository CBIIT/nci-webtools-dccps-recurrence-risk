const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('express-handlebars');
const nodemailerExpressHandlebars = require('nodemailer-express-handlebars');
const hbs = require('handlebars');
const fs = require('fs');
var logger = require('./loggerUtil').logger;

const readFile = path => fs.readFileSync(path, 'utf-8').toString();
const emailTemplate = readFile(__dirname + '/recurrenceEmail.handlebars');

// const viewEngine = handlebars.create({ partialsDir: __dirname });

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mailfwd.nih.gov',
    port: process.env.SMTP_PORT || 25,
    secure: false,
    "tls":{
      // do not fail on invalid certs
      "rejectUnauthorized": false
  }
});

/*
transporter.use('compile',
  nodemailerExpressHandlebars({
  viewEngine: viewEngine,
  viewPath: path.resolve(__dirname)
}))
*/

module.exports.sendMail = (error,data) => {
  const message = hbs.compile(emailTemplate)({
    ...data,
    hasError: (error) ? true : false,
    errorMsg: (error) ? error.message : '',
    data: data.originalInput
  });
  logger.log('info', 'TEST', data)

  let mailOptions = {
    from: '"Recurrence Risk Tool " <do.not.reply@nih.gov>', // sender address
    to: data.receivers,
    subject: 'Recurrence Risk Tool Results', // Subject line
    html: message,
/*    template: 'recurrenceEmail',
    context: {
      hasError: (error) ? true : false,
      errorMsg: (error) ? error.message : '',
      data: data.originalInput
    }
    */
  };

  if(!error) {
    mailOptions.attachments = [{
      filename: 'results.csv',
      path: data.fileResult
    }];
  }

  logger.log('info','About to send email: %s',data.fileResult);
  // send mail with defined transport object
  //[todo] return promise or callback here instead of eating up the result/error
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.log('error','Message not sent.',error);
    }  else {
      logger.log('info','Message sent.', info.messageId);
    }
  });
}