var WebPageTestAPI = require('webpagetest');

exports.api = function apiInterface(apiCall, apiParams, apiOptions, callback) {
  var api = new WebPageTestAPI('www.webpagetest.org', 'A.a1e8b49e0eb999c2dbba2af31e723b33');
  if(callback) { 
    api[apiCall].apply(api, apiParams);
    return;
  }
  return new Promise(
      function(resolve, reject) {
         api[apiCall].call(api, apiParams, apiOptions, function(err, data){
          if(err) 
            reject(err);

          resolve(data);
         })
       }
  )
};
