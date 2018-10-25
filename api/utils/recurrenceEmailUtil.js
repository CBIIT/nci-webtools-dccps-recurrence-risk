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

module.exports.sendMail = (error,data) => {

  let mailOptions = {
    from: '"Recurrence Risk Tool " <do.not.reply@nih.gov>', // sender address
    to: data.receivers,
    subject: 'Recurrence Risk Tool Results', // Subject line
    template: 'recurrenceEmail',
    context: {
      hasError: (error) ? true : false,
      errorMsg: (error) ? error.message : '',
      data: data.originalInput
    }
  };

  if(!error) {
    mailOptions.attachments = [{
      filename: 'results.csv',
      path: data.fileResult
    }];
  }

  console.log(' about to send email: ',data.fileResult);
  // send mail with defined transport object
  //[todo] return promise or callback here instead of eating up the result/error
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Message not sent: %s',error);
    }  else {
      console.log('Message sent: %s', info.messageId);
    }
  });
}