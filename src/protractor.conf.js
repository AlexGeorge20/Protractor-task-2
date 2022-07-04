var HtmlReporter = require('protractor-beautiful-reporter');
// import params from './params'
console.log("PROCESSargv in config",process.argv.length),

exports.config = {
  framework: 'jasmine', //Type of Framework used 
  directConnect:true, 
  specs: ['amazon.ts'], //Name of the Specfile
  capabilities:{
    browserName: 'chrome',
  
  },
  // multiCapabilities: [{
  //   browserName: 'firefox',
  // },
  //  { browserName: 'chrome',
  // }],

 

  onPrepare() { 
     //global test set-up goes here 
     require('ts-node').register({ 
      project: require('path').join(__dirname, '../tsconfig.json') // Relative path of tsconfig.json file 
  }),
// Add a screenshot reporter and store screenshots to `/tmp/screenshots`:
    jasmine.getEnv().addReporter(new HtmlReporter({
       baseDirectory: './Reports/screenshots'
    }).getJasmine2Reporter());
 },

  onComplete() { 
    //global test tear-down goes here 
 },  
 jasmineNodeOpts: {
  showColors: true,
  defaultTimeoutInterval: 150000,
  print: function () {},
},
getPageTimeout: 34000,
allScriptsTimeout: 120000,
}