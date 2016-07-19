/**
 * Helper dateFormat
 */
var moment = require('moment');
var _ = require("underscore");

module.exports.register = function (Handlebars, options)  {
	var asdf =_;
    Handlebars.registerHelper('dateFormat', function(context, block) {
        var f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
        return moment(context).format(f);
    });

   /* Handlebars.registerHelper('isRuleImpactfull', function(rule, options) { 
	    var fnTrue=options.fn, fnFalse=options.inverse;
	    return rule > 1 ? fnTrue() : fnFalse();
	});

	Handlebars.registerHelper('getValue', function(collection, by){
		var value = ""
		if(findProp && by) {
			value = _.findWhere(collection, {'key' : by});  
		}
		if(!value) {
			value = ""
		}
		return value;
	});

	Handlebars.registerHelper('formatSummary', function(result){
		var argsObj = {},
			template = Handlebars.compile(result.format);

		$.each(result.args, function(index, value){
			argsObj[value.key] = value.value;
		})


		return new Handlebars.handlebars.SafeString(template(argsObj));
	});
	*/
};
