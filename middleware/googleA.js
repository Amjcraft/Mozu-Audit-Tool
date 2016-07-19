var fs = require("fs");

exports.getAna = function(req, res, url) {
var API_URL = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed';
var API_KEY = 'AIzaSyAaVOex8-XP-732ULZJvTpAqbYMHCQxPUg';

// Specify the URL you want PageSpeed results for here:
var URL_TO_GET_RESULTS_FOR = 'http://t16471-s24810.sandbox.mozu.com/';

if(url) {
  URL_TO_GET_RESULTS_FOR = url;
}

var query = API_URL + '?url=' + URL_TO_GET_RESULTS_FOR + '&key=' + API_KEY;
var PAGE_LOADS = 'pageLoads.json';
function readJsonFileSync(filepath, encoding){

    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

function getFile(file){

    var filepath = __dirname + '/' + file;
    console.log(filepath);
    return readJsonFileSync(filepath);
}

 // request module is used to process the yql url and return the results in JSON format
 request(query, function(err, resp, data) {

   var pageLoadData = getFile(PAGE_LOADS);
   res.render('index', {'data': JSON.parse(data), 'pageLoadData' : pageLoadData, 'err': err, 'fullData' : data });
 })
  // pass back the results to client side
};

