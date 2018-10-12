var express = require('express');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var recurrenceRouter = require('./routes/recurrence');
const uuid = require('uuid/v1');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use( (req,res,next) => {
  req.requestId = uuid();
  next();
});

app.use('/', indexRouter);
app.use('/recurrence', recurrenceRouter);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  console.error(err);
  res.status(500).send({message: "system error"});
});

module.exports = app;