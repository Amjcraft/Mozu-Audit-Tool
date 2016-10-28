var fs = require("fs");
var mozuDocumentsAPI = require(__dirname + '/mozuDocuments');
var WebPageTest = require(__dirname + '/webPageTestAPI');

exports.getAna = function(req, res, url) {
var API_URL = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed';
var API_KEY = 'AIzaSyAaVOex8-XP-732ULZJvTpAqbYMHCQxPUg';
var mozuDocuments = mozuDocumentsAPI.mozuDocuments();
// Specify the URL you want PageSpeed results for here:
var URL_TO_GET_RESULTS_FOR = 'http://t16471-s24810.sandbox.mozu.com/';

if(url) {
  URL_TO_GET_RESULTS_FOR = url;
}

var query = API_URL + '?url=' + URL_TO_GET_RESULTS_FOR + '&key=' + API_KEY;
var PAGE_LOADS = 'pageLoads.json';
var PAGES = getFile('pages.json');
var dataPromises = [];

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

  function getWebTestData(){
    var item = _.findWhere(PAGES, {'url': url});

    if(item){
      mozuDocuments.getWebTestID({'id': item.site + '_' + item.id}).then(function (entityItem) {
        WebPageTest.api('getTestStatus', entityItem.testId).then(function(statusData){
        
            if(statusData.data.statusCode == 200) {
              dataPromises.push(WebPageTest.api('getTestResults', statusData.data.testId, {requests: false}));
              renderUI();    
            }

      }).catch(function(err){
        console.log(err);
      })
        
    })
 }
 }   
function getGoogleTestData() {
    var promise = new Promise(
      function(resolve, reject) {
        request(query, function(err, resp, data) {
          if(err) {
            reject(err);
          }
           resolve(data);
        })
     //res.render('index', {'data': JSON.parse(data), 'pageLoadData' : pageLoadData, 'err': err, 'fullData' : data });
     })
    dataPromises.push(promise);
}
 function renderUI(){
   Promise.all(dataPromises).then(values => {
    var basePath = req.baseUrl;
    var currentSite = basePath.replace(/[^a-zA-Z ]/g, "");
   
    res.render('index', {'data': JSON.parse(values[0]), 'speedData' : values[1].data, 'siteContext': {'host': req.header('host'), 'hostUrl': req.protocol + '://' + req.get('host')}});
  });
   
 }
 getGoogleTestData();
 getWebTestData();



 // request module is used to process the yql url and return the results in JSON format
 
  // pass back the results to client side
};

