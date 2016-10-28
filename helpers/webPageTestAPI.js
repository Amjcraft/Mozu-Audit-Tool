var fs = require("fs");
var WebPageTest = require('webpagetest');
exports.WPT = function(url) {

return WebPageTest(url);

var WebPageTest = function(url) {
	this.url = url || 'http://t16471-s24810.sandbox.mozu.com/';
	this.apiKey = url || 'A.a1e8b49e0eb999c2dbba2af31e723b33';
};

WebPageTest.prototype = function() {
	var _self = this,
		wpt = new WebPageTest(_self.url, _self.apiKey);
	//TO-DO Use to limit check for Mozu specific URL
	var hasVaildURL(url) {
		if(url) {
	  		return true;
		}
		return false;
	}

	var requestWebPageTest = function(url, callback) {
		URL_TO_GET_RESULTS_FOR = url;
		if(hasVaildURL(URL_TO_GET_RESULTS_FOR)) {
			wpt.runTest(URL_TO_GET_RESULTS_FOR, {location: 'SanJose_IE9'}, function(err, data) {
	  			console.log(err || data);
	  			callback(data);
			});
		}
		return console.log('Invalid requestWebPageTest')
	}

	var testStatus = function(testId, callback) {
			wpt.getTestStatus(testId, function(err, data) {
			  console.log(err || data);
			  callback(data);
			});
	}

	var testResults = function(testId, callback) {
			wpt.getTestStatus(testId, function(err, data) {
			  //TO-DO: is TestComplete
			  if(data) {
				  console.log(err || data);
				  callback(data);
			  }
			});
	}

	tempTestPage.getLocations(function(err, data) {
	  console.log(err || data);
	});


	tempTestPage.getTestStatus('121025_PT_N8K', function(err, data) {
	  console.log(err || data);
	});

	tempTestPage.getTestResults('121025_PT_N8K', function(err, data) {
	  console.log(err || data);
	});

	 return {
		 requestWebPageTest: function(url, callback){
		 	
		 }
		 
	 }
	}
};


