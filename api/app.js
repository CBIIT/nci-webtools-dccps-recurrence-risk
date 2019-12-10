var express = require('express');
var helmet = require('helmet');
var cors = require('cors');
var mkdirp = require('mkdirp');


var logger = require('./utils/loggerUtil').logger;
var indexRouter = require('./routes/index');
var recurrenceRouter = require('./routes/recurrence');

const uuid = require('uuid/v1');


var app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'))

app.use( (req,res,next) => {
  req.requestId = uuid();
  next();
});

app.get('/', (req,res) => res.sendFile('index.html',{ root: __dirname + "/public" } ));
// app.use('/recurrence', recurrenceRouter); // use locally
app.use(recurrenceRouter);

app.get('/ping', (req, res) => {
  res.send('true');
});

mkdirp('../../logs/', function (err) {
  if (err) console.error(err)
  else console.log('log folder created')
});
mkdirp('../../data/staging/', function (err) {
  if (err) console.error(err)
  else console.log('data folder created')
});
mkdirp('./public/', function (err) {
  if (err) console.error(err)
  else console.log('public folder created')
});


app.use(function (err, req, res, next) {
  logger.log('error',err);
  res.status(500).send({errors: [ {
    msg:'An unexpected error occured. Please ensure the input file(s) is in the correct format and/or correct parameters were chosen.'} ]});
});

app.listen(process.env.PORT || 4000);

module.exports = app;