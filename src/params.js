
let params;
// process.argv.slice(3).forEach(function (arg) {
//     let flag = arg.split('=')[0];
//     let value = arg.split('=')[1];
//     let name = flag.replace('--', '');

//     params[name] = value;
// });
browserparam=process.argv[3];
if(browserparam=='firefox'){
    let params= browserparam
}else if(browserparam=='chrome'){
    let params= browserparam

}
console.log("PARAMS3",params);
export default params;