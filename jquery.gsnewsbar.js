/* http://keith-wood.name/gsnewsbar.html
   Google Search Newsbar for jQuery v1.0.0.
   See http://www.google.com/uds/solutions/newsbar/reference.html.
   Written by Keith Wood (kbwood@virginbroadband.com.au) November 2008.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
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

var PROP_NAME = 'gsnewsbar';

$.extend(GSNewsbar.prototype, {
	/* Class name added to elements to indicate already configured with GSNewsbar. */
	markerClassName: 'hasGSNewsbar',

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
	   @param  options  (object) the new settings to use as defaults */
	setDefaults: function(options) {
		extendRemove(this._defaults, options || {});
		return this;
	},

	/* Attach the newsbar widget to a div.
	   @param  target   (element) the affected division
	   @param  options  (object) the new instance settings */
	_attachGSNewsbar: function(target, options) {
		target = $(target);
		if (target.is('.' + this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName);
		var inst = {target: target};
		inst.options = $.extend({}, options);
		$.data(target[0], PROP_NAME, inst);
		this._updateGSNewsbar(target, inst);
	},

	/* Reconfigure the settings for a newsbar div.
	   @param  target   (element) the affected division
	   @param  options  (object) the new/changed instance settings */
	_changeGSNewsbar: function(target, options) {
		var inst = $.data(target, PROP_NAME);
		if (inst) {
			extendRemove(inst.options, options || {});
			$.data(target, PROP_NAME, inst);
			this._updateGSNewsbar($(target), inst);
		}
	},

	/* Perform a new seacrh in the newsbar.
	   @param  target  (element) the affected division
	   @param  search  (string) the new search terms */
	_searchGSNewsbar: function(target, search) {
		var inst = $.data(target, PROP_NAME);
		if (inst) {
			extendRemove(inst.options, {search: search});
			$.data(target, PROP_NAME, inst);
			inst.newsbar.execute(search);
		}
	},

	/* Redisplay the newsbar with an updated display.
	   @param  target  (object) the jQuery object for the affected division
	   @param  inst    (object) the instance settings */
	_updateGSNewsbar: function(target, inst) {
		var getElement = function(selector) {
			var element = $.gsnewsbar._get(inst, selector);
			element = (element ? (element.jQuery ? element : $(element)) : null);
			return (element && element.length ? element[0] : null);
		};
		var search = this._get(inst, 'search');
		search = (isArray(search) ? search : [search]);
		inst.newsbar = new GSnewsBar(target[0],
			{largeResultSet: this._get(inst, 'manyResults'),
			horizontal: this._get(inst, 'horizontal'),
			resultStyle: (this._get(inst, 'verticalCompressed') ? 2 : 1),
			title: this._get(inst, 'title'),
			linkTarget: this._get(inst, 'linkTarget'),
			currentResult: getElement('currentResult'),
			autoExecuteList: {executeList: search,
				cycleTime: this._get(inst, 'cycleTime'),
				cycleMode: this._get(inst, 'cycleMode')}});
	},

	/* Remove the newsbar widget from a div.
	   @param  target  (element) the affected division */
	_destroyGSNewsbar: function(target) {
		target = $(target);
		if (!target.is('.' + this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).empty();
		$.removeData(target[0], PROP_NAME);
	},

	/* Get a setting value, defaulting if necessary.
	   @param  inst  (object) the instance settings
	   @param  name  (string) the name of the setting
	   @return  (any) the setting value */
	_get: function(inst, name) {
		return (inst.options[name] != null ?
			inst.options[name] : $.gsnewsbar._defaults[name]);
	}
});

/* jQuery extend now ignores nulls! */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null) {
			target[name] = null;
		}
	}
	return target;
}

/* Determine whether an object is an array. */
function isArray(a) {
	return (a && a.constructor == Array);
}

/* Attach the GSNewsbar functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these GSNewsbar instances
   @return  (object) jQuery object for chaining further calls */
$.fn.gsnewsbar = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	return this.each(function() {
		if (typeof options == 'string') {
			$.gsnewsbar['_' + options + 'GSNewsbar'].
				apply($.gsnewsbar, [this].concat(otherArgs));
		}
		else {
			$.gsnewsbar._attachGSNewsbar(this, options);
		}
	});
};

// Add required external files - note: key must be set before loading this module
if ($('script[src*=www.google.com/uds/api?file=uds.js]').length == 0) {
	if (!$.googleSearchKey) {
		throw 'Missing Google Search Key';
	}
	$('head').append('<script type="text/javascript" src="http://www.google.com/uds/' +
		'api?file=uds.js&v=1.0&key=' + $.googleSearchKey + '"></script>\n' +
		'<link type="text/css" href="http://www.google.com/uds/css/gsearch.css" rel="stylesheet"/>\n');
}
$('head').append('<script type="text/javascript" src="http://www.google.com/uds/' +
	'solutions/newsbar/gsnewsbar.js"></script>\n' +
	'<link type="text/css" href="http://www.google.com/uds/solutions/newsbar/gsnewsbar.css" ' +
	'rel="stylesheet"/>\n');
      
/* Initialise the GSNewsbar functionality. */
$.gsnewsbar = new GSNewsbar(); // singleton instance

})(jQuery);
