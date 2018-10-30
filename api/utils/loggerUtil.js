const winston = require('winston');
const path = require('path');
const logsDir = path.normalize(path.join(__dirname ,'..','logs'));

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
   winston.format.timestamp({
     format: 'YYYY-MM-DD hh:mm:ss A ZZ'
   }),
   winston.format.json()
  ),
  transports: [
    new winston.transports.File({
     filename: path.join(logsDir,'recurrence-error.log'),
     level: 'error',
     maxsize: 5000000 }),
    new winston.transports.File({
      filename: path.join(logsDir,'recurrence-combined.log'),
      timestamp: true,
      maxsize: 5000000
      })
  ]
});

exports.logger=logger;