const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('express-handlebars');
const nodemailerExpressHandlebars = require('nodemailer-express-handlebars');
const viewEngine = handlebars.create({});

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mailfwd.nih.gov',
    port: process.env.SMTP_PORT || 25,
    secure: false
});

transporter.use('compile',
  nodemailerExpressHandlebars({
  viewEngine: viewEngine,
  viewPath: path.resolve(__dirname)
}));


let mailOptions = {
  from: '"Recurrence Risk Tool " <do.not.reply@nih.gov>', // sender address
  to: '', // list of receivers
  subject: 'Recurrence Risk Tool Results', // Subject line
  template: 'recurrenceEmail',
  context: {
  }
};

module.exports.sendMail = (error,data) => {
  mailOptions.to = data.receivers;
  mailOptions.context = {
    hasError: (error) ? true : false,
    errorMsg: (error) ? error.message : '',
    data: data.originalInput
  }

  if(!error) {
    mailOptions.attachments = [{
      filename: 'results.csv',
      path: data.fileResult
    }];
  }

  console.log(' about to send email: ',data.fileResult);
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      throw error;
    }
    console.log('Message sent: %s', info.messageId);
  });
}