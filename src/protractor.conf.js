var HtmlReporter = require('protractor-beautiful-reporter');
// const { parsedObj } = require('simple-argv-parser');
// console.log("SIMPLE argv",parsedObj);
// import * as yargs from 'yargs'
// const argv=yargs.argv;
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

console.log("YARG V",argv);
//=====================================
// var argv = require( 'argv' );
// var args = argv.option( options ).run();
//   console.log("ARGVPKG",args);

// argv.type( 'squared', function( value ) {
//   value = parseFloat( value );
//   console.log("val",value * value);
//   return value * value;
// });

// argv.option({
//   name: 'square',
//   short: 's',
//   type: 'squared'
// });
//==============
console.log("PROCESSargv in config",process.argv.length);
console.log("PROCESSargv in config3&4",process.argv[3]);
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