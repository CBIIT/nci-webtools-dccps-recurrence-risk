// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
var browserstack = require('browserstack-local');
const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 180000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],

  'browserstackUser': process.env.BROWSERSTACK_USERNAME,
  'browserstackKey': process.env.BROWSERSTACK_ACCESS_KEY,

  'multiCapabilities':[{
    'build': 'recurrence-browserstack',
    'browserstack.local': true,
    'os' : 'Windows',
    'os_version' : '10',
    'browserName' : 'IE',
    'browser_version' : '11.0',
    'browserstack.selenium_version' : '3.5.2',
    'resolution': '1024x768'
  },{
    'build': 'recurrence-browserstack',
    'browserstack.local': true,
    'os' : 'Windows',
    'os_version' : '10',
    'browserName' : 'Firefox',
    'browser_version' : '60.0',
    'browserstack.geckodriver' : '0.20.1',
    //'browserstack.selenium_version' : '3.5.2'
  },{
    'build': 'recurrence-browserstack',
    'browserstack.local': true,
    'os' : 'Windows',
    'os_version' : '10',
    'browserName' : 'Chrome',
    'browser_version' : '62.0',
    'browserstack.selenium_version' : '3.5.2',
  }],

  //directConnect: true,
  baseUrl: 'http://127.0.0.1:3000',

  // Code to start browserstack local before start of test
  beforeLaunch: function(){
    console.log("Connecting local");
    return new Promise(function(resolve, reject){
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({'key': exports.config['browserstackKey'] }, function(error) {
        if (error) return reject(error);
        console.log('Connected. Now testing...');

        resolve();
      });
    });
  },

    // Code to stop browserstack local after end of test
  afterLaunch: function(){
    return new Promise(function(resolve, reject){
      exports.bs_local.stop(resolve);
    });
  },

  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 180000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};

// Code to support common capabilities
exports.config.multiCapabilities.forEach(function(caps){
  for(var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
});
