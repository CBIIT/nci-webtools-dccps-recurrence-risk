var _ = require("underscore"),
    child_process = require("child_process");
var logger = require('../../utils/loggerUtil').logger;

function init(path) {
  var obj = new R(path);
  _.bindAll(obj, "data", "withTimer","call", "callSync");
  return obj;
}

function R(path) {
  this.d = {};
  this.path = path;
  this.timeout = Infinity;
  this.options = {
    env: _.extend({DIRNAME: __dirname}, process.env),
    encoding: "utf8"
  };
  this.idCounter = 0;
  this.args = ["--vanilla", __dirname + "/R/launch.R"];
}

R.prototype.data = function() {
  for (var i = 0; i < arguments.length; i++) {
    this.d[++this.idCounter] = arguments[i];
  }
  return this;
};

R.prototype.withTimer = function(_timeout) {
  this.timeout = _timeout || Infinity;
  return this;
}

R.prototype.call = function(_opts, _callback) {
  var callback = _callback || _opts;
  var opts = _.isFunction(_opts) ? {} : _opts;
  this.options.env.input = JSON.stringify([this.d, this.path, opts]);
  var child = child_process.spawn("Rscript", this.args, this.options);

  var dataBuff = '';
  var errorBuff = '';

  child.stderr.setEncoding('utf8');
  child.stdout.setEncoding('utf8');
  child.stderr.on("data", (err) => errorBuff += err);
  child.stdout.on("data", (data) => dataBuff += data);
  child.on("close", (code,signal) => {
    if(errorBuff || code || signal) {
      logger.log('error',`child process closed with error: ${errorBuff} code: ${code} or signal: ${signal}`);
      callback(errorBuff || `child process closed with error: ${errorBuff} code: ${code} or signal: ${signal}`);
    } else {
      try {
        callback(null,JSON.parse(dataBuff));
      } catch(err) {
        logger.log('error','close child stdout issue',err);
        callback(err);
      }
    }
  });

  if(this.timeout !== Infinity) {
    setTimeout( () => child.kill('SIGTERM') , this.timeout) ;
  }
};

R.prototype.callSync = function(_opts) {
  var opts = _opts || {};
  this.options.env.input = JSON.stringify([this.d, this.path, opts]);
  var child = child_process.spawnSync("Rscript", this.args, this.options);
  if (child.stderr) {
    throw new Error(child.stderr);
  }

  try {
    return(JSON.parse(child.stdout));
  } catch(err) {
    throw new Error(err);
  }
};

module.exports = init;
