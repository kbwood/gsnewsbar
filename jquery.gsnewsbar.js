/* http://keith-wood.name/gsnewsbar.html
   Google Search Newsbar for jQuery v1.1.0.
   See http://www.google.com/uds/solutions/newsbar/reference.html.
   Written by Keith Wood (kbwood{at}iinet.com.au) November 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

/* Display a Google Search Newsbar.
   Attach it with options like:
   $('div selector').gsnewsbar({search: ['jquery']});
*/

(function($) { // Hide scope, no $ conflict

/* GSNewsbar manager. */
function GSNewsbar() {
	this._defaults = {
		horizontal: true, // True for horizontal display, false for vertical
		verticalCompressed: false, // True for compressed layout when vertical, false for expanded
		title: '', // Title for the bar
		search: 'jquery', // Single or list of search terms
		manyResults: false, // True for many results, false for only a few
		cycleTime: this.cycleManual, // Time between cycles of the search terms
		cycleMode: this.cycleLinear, // Mode of cycling through the search terms
		linkTarget: this.targetSelf, // Control where the news links open
		currentResult: '' // jQuery selector, jQuery object, or element for 
			// additional info for current entry when horizontal
	};
}

$.extend(GSNewsbar.prototype, {
	/* Class name added to elements to indicate already configured with GSNewsbar. */
	markerClassName: 'hasGSNewsbar',
	/* Name of the data property for instance settings. */
	propertyName: 'gsnewsbar',

	/* Cycle times. */
	cycleVShort: 3000,
	cycleShort: 10000,
	cycleMedium: 15000, // Default
	cycleLong: 30000,
	cycleManual: 3000000,
	/* Cycle modes. */
	cycleRandom: 1,
	cycleLinear: 2, // Default
	/* Link targets. */
	targetSelf: '_self',
	targetBlank: '_blank',
	targetTop: '_top',
	targetParent: '_parent',

	/* Override the default settings for all GSNewsbar instances.
	   @param  options  (object) the new settings to use as defaults
	   @return  (GSNewsbar) this object */
	setDefaults: function(options) {
		$.extend(this._defaults, options || {});
		return this;
	},

	/* Attach the newsbar widget to a div.
	   @param  target   (element) the control to affect
	   @param  options  (object) the custom options for this instance */
	_attachPlugin: function(target, options) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = {options: $.extend({}, this._defaults, options), target: target};
		target.addClass(this.markerClassName).data(this.propertyName, inst);
		this._optionPlugin(target, options);
	},

	/* Retrieve or reconfigure the settings for a control.
	   @param  target   (element) the control to affect
	   @param  options  (object) the new options for this instance or
	                    (string) an individual property name
	   @param  value    (any) the individual property value (omit if options
	                    is an object or to retrieve the value of a setting)
	   @return  (any) if retrieving a value */
	_optionPlugin: function(target, options, value) {
		target = $(target);
		var inst = target.data(this.propertyName);
		if (!options || (typeof options == 'string' && value == null)) { // Get option
			var name = options;
			options = (inst || {}).options;
			return (options && name ? options[name] : options);
		}

		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		options = options || {};
		if (typeof options == 'string') {
			var name = options;
			options = {};
			options[name] = value;
		}
		$.extend(inst.options, options);
		this._updateGSNewsbar(target[0], inst);
	},

	/* Redisplay the newsbar with an updated display.
	   @param  target  (element) the affected division
	   @param  inst    (object) the instance settings */
	_updateGSNewsbar: function(target, inst) {
		var getElement = function(selector) {
			var element = inst.options[selector];
			element = (element ? (element.jQuery ? element : $(element)) : null);
			return (element && element.length ? element[0] : null);
		};
		var search = inst.options.search;
		search = ($.isArray(search) ? search : [search]);
		inst.newsbar = new GSnewsBar(target,
			{largeResultSet: inst.options.manyResults, horizontal: inst.options.horizontal,
			resultStyle: (inst.options.verticalCompressed ? 2 : 1),
			title: inst.options.title, linkTarget: inst.options.linkTarget,
			currentResult: getElement('currentResult'),
			autoExecuteList: {executeList: search, cycleTime: inst.options.cycleTime,
				cycleMode: inst.options.cycleMode}});
	},

	/* Perform a new seacrh in the newsbar.
	   @param  target  (element) the affected division
	   @param  search  (string) the new search terms */
	_searchPlugin: function(target, search) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			$.extend(inst.options, {search: search});
			inst.newsbar.execute(search);
		}
	},

	/* Remove the plugin functionality from a control.
	   @param  target  (element) the control to affect */
	_destroyPlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).empty().removeData(this.propertyName);
	}
});

// The list of commands that return values and don't permit chaining
var getters = [];

/* Determine whether a command is a getter and doesn't permit chaining.
   @param  command    (string, optional) the command to run
   @param  otherArgs  ([], optional) any other arguments for the command
   @return  true if the command is a getter, false if not */
function isNotChained(command, otherArgs) {
	if (command == 'option' && (otherArgs.length == 0 ||
			(otherArgs.length == 1 && typeof otherArgs[0] == 'string'))) {
		return true;
	}
	return $.inArray(command, getters) > -1;
}

/* Attach the GSNewsbar functionality to a jQuery selection.
   @param  options  (object) the new settings to use for these instances (optional) or
                    (string) the command to run (optional)
   @return  (jQuery) for chaining further calls or
            (any) getter value */
$.fn.gsnewsbar = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (isNotChained(options, otherArgs)) {
		return plugin['_' + options + 'Plugin'].apply(plugin, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			if (!plugin['_' + options + 'Plugin']) {
				throw 'Unknown command: ' + options;
			}
			plugin['_' + options + 'Plugin'].apply(plugin, [this].concat(otherArgs));
		}
		else {
			plugin._attachPlugin(this, options || {});
		}
	});
};

// Add required external files - note: key must be set before loading this module
if ($('script[src*="www.google.com/uds/api?file=uds.js"]').length == 0) {
	if (!$.googleSearchKey) {
		throw 'Missing Google Search Key';
	}
	document.write('<script type="text/javascript" src="http://www.google.com/uds/' +
		'api?file=uds.js&v=1.0&key=' + $.googleSearchKey + '"></script>\n' +
		'<link type="text/css" href="http://www.google.com/uds/css/gsearch.css" rel="stylesheet"/>\n');
}
document.write('<script type="text/javascript" src="http://www.google.com/uds/' +
	'solutions/newsbar/gsnewsbar.js"></script>\n' +
	'<link type="text/css" href="http://www.google.com/uds/solutions/newsbar/gsnewsbar.css" ' +
	'rel="stylesheet"/>\n');
      
/* Initialise the GSNewsbar functionality. */
var plugin = $.gsnewsbar = new GSNewsbar(); // Singleton instance

})(jQuery);
