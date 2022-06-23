exports.config = {
  framework: 'jasmine', //Type of Framework used 
  directConnect:true, 
  specs: ['spec.js'], //Name of the Specfile
  onPrepare() { 
     //global test set-up goes here 
     require('ts-node').register({ 
      project: require('path').join(__dirname, './tsconfig.json') // Relative path of tsconfig.json file 
  });
},
  onComplete() { 
    //global test tear-down goes here 
 }  
}