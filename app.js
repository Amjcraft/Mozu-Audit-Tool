var express  = require('express'),
    compress = require('compression'),
    hbs      = require('hbs'),
    moment   = require('moment'),
    router   = require(__dirname + '/routes').router,
    app      = express(),
    error    = require(__dirname + '/middleware/error');
    google    = require(__dirname + '/middleware/googleA');
    request = require('request');
    _ = require("underscore"),
    fs = require("fs");



var PAGE_LOADS = 'pageLoads.json';
function readJsonFileSync(filepath, encoding){

    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

function getFile(file){

    var filepath = __dirname + '/middleware/' + file;
    console.log(filepath);
    return readJsonFileSync(filepath);
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
  var pages = getFile('pages.json');
  var ret = "";

  for(var i=0, j=pages.length; i<j; i++) {
    ret = ret + options.fn(pages[i]);
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

if (app.get('env') === 'development'){
    app.use(express.static(__dirname + '/public', {maxAge: 86400000}));
}

var route = express.Router();

route.get('/index.html', function(req, res){
    res.redirect(301, '/');
});

var appEndpoints = getFile('pages.json');
appEndpoints.forEach(function(page) {
  app.get(page.route, function(req, res) {
    google.getAna(req, res, page.url);
  });
});


app.use('/', route);

app.use(error.notFound);
app.use(error.serverError);
app.use(google.getAna);




module.exports = app;
