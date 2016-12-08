var express  = require('express'),
    path = require('path'),
    compress = require('compression'),
    hbs      = require('hbs'),
    moment   = require('moment'),
    router   = require(__dirname + '/routes').router,
    app      = express(),
    error    = require(__dirname + '/middleware/error'),
    google    = require(__dirname + '/middleware/googleA'),
    WebPageTest    = require(__dirname + '/middleware/webPageTestAPI'),
    request = require('request'),
    _ = require("underscore"),
    fs = require("fs");


var PAGE_AUDIT_DOC_NAME = "audittoolinfo_3@a0842dd";
var PAGE_LOADS = 'pageLoads.json';
var MongoClient = require('mongodb').MongoClient,
test = require('assert');

MongoClient.connect('mongodb://localhost:27017/test', function (err, db) {
  if (err) throw err

  var col = db.collection('listCollectionsExample1');
  // Insert a bunch of documents

    col.find().toArray(function(err, docs) {
       if (err) throw err

       console.log(docs) ;
      db.close();
    });
})

function readJsonFileSync(filepath, encoding){

    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);

    return JSON.parse(file);
}

function writeJsonFileSync(filepath, data, options){

    if (typeof (options) == 'undefined'){
        options = { encoding: 'utf8' };
    }
    fs.writeFileSync(filepath, data, options);
}

function getFile(file){

    var filepath = __dirname + '/' + file;
    return readJsonFileSync(filepath);
}

function saveFile(file, jsonData){

    var filepath = __dirname + '/' + file;
    console.log('Write To...')
    console.log(filepath);
    return writeJsonFileSync(file, JSON.stringify(jsonData));
}


hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('dateFormat', function(context, block) {
    var f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
});

hbs.registerHelper('formatSummary', function(result){
    var argsObj = {},
        template = "";
        if(result) {
         template = hbs.compile(result.format);

          _.each(result.args, function(value, key, list){
            argsObj[value.key] = value.value;
            });
        return new hbs.handlebars.SafeString(template(argsObj));
        }

       return template;
    
});

hbs.registerHelper('isRuleImpactfull', function(rule, options) { 
    var fnTrue=options.fn, fnFalse=options.inverse;
    return rule > 1 ? fnTrue(this) : fnFalse(this);
});


hbs.registerHelper('getPageLoadData', function(url, options){
    var pageLoadData = getFile(PAGE_LOADS);
    var value = {};
    if(url) {
        value = _.findWhere(pageLoadData, { 'CategoryPage': url}); 
    }

    if(!value) {
       return options.fn(this); 
    }

    if(value.hasOwnProperty('CategoryPage')) {

        return options.fn(value);
    }

    
});

hbs.registerHelper('rulePriority', function(rule) { 
    if(rule < 3) {
        return "rule-status bg-info";
    } else if ( rule < 7) {
        return "rule-status bg-warning";
    } else {
        return "rule-status bg-danger";
    }
});

hbs.registerHelper('eachNav', function(options) {
    var ret = ""
    var pages = getFile('pages.json');
    var nav = [];

    if(currentSite) {
        nav = _.where(pages, {'site': currentSite});    
    } else {
      nav = _.where(pages, {'id': "1"});   
    }

   for(var i=0, j= nav.length; i<j; i++) {
     ret = ret + options.fn(nav[i]);
   }

   return ret;
});


hbs.registerHelper('getValue', function(collection, by){
    var value = ""
    if(findProp && by) {
        value = _.findWhere(collection, {'key' : by});  
    }
    if(!value) {
        value = "";
    }
    return value;
});



app.set('view engine', 'html');
app.set('views', __dirname + '/views/pages');
app.engine('html', hbs.__express);

app.use(compress({
    filter: function(req, res) {
        return (/json|text|javascript|css|image\/svg\+xml|application\/x-font-ttf/).test(res.getHeader('Content-Type'));
    },
    level: 9
}));

app.use("/assets", express.static(__dirname + '/public/assets'));

var route = express.Router();


route.get('/index.html', function(req, res){
    res.redirect(301, '/');
});

route.get('/', function(req, res) {
        var basePath = req.baseUrl;
        currentSite = basePath.replace(/[^a-zA-Z ]/g, "");
    console.log('++++');
    console.log('Base');
    console.log('++++');
    res.render('home', {'siteContext': {'host': req.header('host'), 'hostUrl': req.protocol + '://' + req.get('host')}, 'data': {}});
});


var currentSite = "";
var appEndpoints = getFile('pages.json');

appEndpoints.forEach(function(page) {
  app.get(page.route, function(req, res) {
      currentSite = page.site;  
    console.log('=====');
     console.log(page);
    console.log('=====');

      google.getAna(req, res, page.url);

  })
});

//var mozuDocuments = mozuDocumentsAPI.mozuDocuments();

var startWebPageTests = function(pagesLackingTests){
    
 //webPageTest.getLocations();
    var webPageTestsPromises = [];
    var testList = getFile('pages.json');

    _.each(pagesLackingTests, function(value, key, list){
    webPageTestsPromises.push(WebPageTest.api('runTest', value.url, {location: 'Dulles', runs: '5', ignoressl: true, }).then(function(data){
        console.log(data);
        if(data.data.testId) {
            var testItem = _.findWhere(testList, {'route': value.route})
            testItem.testId = data.data.testId;
        }
        // mozuDocuments.createEnitityItem({
        //     'entityListFullName' : 'audittoolinfo_3@a0842dd',
        //     'id' : value.site + '_' + value.id ,
        //     'name' : value.site + '_' + value.id,
        //     'testId' : data.data.testId
        // })    
        }).catch(function(err){
            console.log('Error Running Test');
            console.log(err);
        })
        );
    })
    
    Promise.all(webPageTestsPromises).then(values => {
        saveFile('pages.json', testList);
    })

}

var checkForNewTests = function(){
    var pageList = getFile('pages.json');
    var pagesLackingTests = _.reject(pageList, function(page){ return page.hasOwnProperty('testId') });
    console.log(pagesLackingTests);
     if(pagesLackingTests.length > 0) {
        startWebPageTests(pagesLackingTests);
     }
}

checkForNewTests();

// mozuDocuments.getEnitiyList().then(function(data){
//     var pages = getFile('pages.json');
//     var pagesLackingTests = _.reject(pages, function(item){ return _.findWhere(data.items, {'id': item.site + '_' + item.id})});
//     console.log(pagesLackingTests);
//     if(pagesLackingTests) {
//         startWebPageTests(pagesLackingTests);
//     }

// }).catch(function(error){
//     console.error(error);
//     mozuDocuments.createEnitityList(function(){
//          var pages = getFile('pages.json');
//         startWebPageTests(pagesLackingTests);
//     });
// })

app.use('/', route);


app.use(error.notFound);
app.use(error.serverError);
app.use(google.getAna);




module.exports = app;
