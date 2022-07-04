var HtmlReporter = require('protractor-beautiful-reporter');
// import params from './params'
console.log("PROCESSargv in config",process.argv.length);

var fs = require('fs');
function rmDir (dirPath) {
  try { var files = fs.readdirSync(dirPath); }
  catch(e) { return; }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
  fs.rmdirSync(dirPath);
}; 

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
       baseDirectory: './Reports/screenshots',
       cleanDestination: true
    }).getJasmine2Reporter());
   // delete prev reports files
    rmDir('./Reports/screenshots')
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