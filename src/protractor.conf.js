var HtmlReporter = require('protractor-beautiful-reporter');


const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
 const browser=argv.browser
console.log("browserNameconfg YARG V",browser);
// if (argv.ships > 3 && argv.distance < 53.5) {
//   console.log('Plunder more riffiwobbles!',argv)
// } else {
//   console.log('Retreat from the xupptumblers!')
// }
// console.log('cccc',argv.ships);


//---------------------------remove report files
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
//------------------------------------
exports.config = {
  
  framework: 'jasmine', //Type of Framework used 
  directConnect:true, 
  specs: ['amazon.ts'], //Name of the Specfile
  capabilities:{
    browserName: `${browser}`,
    // browserName: 'chrome',
  chromeOptions: {
    // args: ["--headless"]
  }
  
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

// npm run test -- --browser=chrome --domain=in