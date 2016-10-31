var fs = require("fs"),
    request = require('request'),
    _ = require("underscore");
//var mozuDocumentsAPI = require(__dirname + '/mozuDocuments');
var WebPageTest = require(__dirname + '/webPageTestAPI');
var path = require('path'); 

exports.getAna = function(req, res, url) {
var API_URL = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed';
var API_KEY = 'AIzaSyAaVOex8-XP-732ULZJvTpAqbYMHCQxPUg';
//var mozuDocuments = mozuDocumentsAPI.mozuDocuments();
// Specify the URL you want PageSpeed results for here:
var URL_TO_GET_RESULTS_FOR = 'http://t16471-s24810.sandbox.mozu.com/';

if(url) {
  URL_TO_GET_RESULTS_FOR = url;
}

var query = API_URL + '?url=' + URL_TO_GET_RESULTS_FOR + '&key=' + API_KEY;
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
    var filepath = __dirname + '/../' + file;
    return readJsonFileSync(filepath);
}

function writeJsonFileSync(filepath, data, options){

    if (typeof (options) == 'undefined'){
        options = { encoding: 'utf8' };
    }
    fs.writeFileSync(filepath, data, options);
}

function saveFile(file, jsonData){

    var filepath = __dirname + '/' + file;
    console.log('Write To...')
    console.log(filepath);
    return writeJsonFileSync(file, JSON.stringify(jsonData));
}

// function getWebTestData(){
//     var item = _.findWhere(PAGES, {'url': url});

//     if(item){
//       mozuDocuments.getWebTestID({'id': item.site + '_' + item.id}).then(function (entityItem) {
//         WebPageTest.api('getTestStatus', entityItem.testId).then(function(statusData){
        
//             if(statusData.data.statusCode == 200) {
//               dataPromises.push(WebPageTest.api('getTestResults', statusData.data.testId, {requests: false}));
//               renderUI();    
//             }

//       }).catch(function(err){
//         console.log(err);
//       })
        
//     })
//  }
//  }



function getWebTestData(){
  console.log('GetData');
    var item = _.findWhere(PAGES, {'url': url});
    if(item){
      if (fs.existsSync(item.site + '_' + item.id + '.json')) {
        console.log('exisits')
          var promise = new Promise(
            function(resolve, reject) {
                var file = getFile(item.site + '_' + item.id + '.json');
                if(file) {
                  resolve(file);
                  return
                }
                reject(err);
           })
          dataPromises.push(promise);
          renderUI();
          
      } else {
        console.log('nope')
        WebPageTest.api('getTestStatus', item.testId).then(function(statusData){
          dataPromises.push(WebPageTest.api('getTestResults', statusData.data.testId, {requests: false, pagespeed: false,  domains: false, breakdown:false }));
          renderUI();
        }).catch(function(err){
          renderUI();
        })

      }

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
    var currentSite = basePath.replace(/[^a-zA-Z ]/g, ""),
    googleData = JSON.parse(values[0]),
    speedData = values[1];
    var item = _.findWhere(PAGES, {'url': url});

    if(speedData.data) {
      console.log('Save')
      saveFile(item.site + '_' + item.id + '.json', speedData.data);
      speedData = values[1].data;
    }
    
    if(!speedData) {
      speedData = {'testingCompelte': false, 'loadingStatus': 'Web Page Testing In Progess'};
      
    }

    console.log(speedData);
   
    res.render('index', {'data': googleData, 'speedData' : speedData, 'siteContext': {'host': req.header('host'), 'hostUrl': req.protocol + '://' + req.get('host')}});
  });
}

getGoogleTestData();
getWebTestData();



 // request module is used to process the yql url and return the results in JSON format
 
  // pass back the results to client side
};

