exports.config = {
  framework: 'jasmine', //Type of Framework used 
  directConnect:true, 
  specs: ['amazon.ts'], //Name of the Specfile
  capabilities: {
    // browserName: 'firefox',
    browserName: 'chrome',
  },
  onPrepare() { 
     //global test set-up goes here 
     require('ts-node').register({ 
      project: require('path').join(__dirname, '../tsconfig.json') // Relative path of tsconfig.json file 
  });
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