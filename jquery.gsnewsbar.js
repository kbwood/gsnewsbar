/* http://keith-wood.name/gsnewsbar.html
   Google Search Newsbar for jQuery v2.0.0.
   See http://www.google.com/uds/solutions/newsbar/reference.html.
   Written by Keith Wood (kbwood{at}iinet.com.au) November 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */
   
(function($) { // hide the namespace

	var pluginName = 'gsnewsbar';

	/** Create the Google Search Newsbar plugin.
		<p>Sets a <code>div</code> to display a newsbar.</p>
		<p>Expects HTML like:</p>
		<pre>&lt;div>&lt;/div></pre>
		<p>Provide inline configuration like:</p>
		<pre>&lt;div data-gsnewsbar="name: 'value'">&lt;/div></pre>
	 	@module GSNewsBar
		@augments JQPlugin
		@example $(selector).gsnewsbar({search: ['jquery']}); */
	$.JQPlugin.createPlugin({
	
		/** The name of the plugin. */
		name: pluginName,

		/** Cycle times - very short. */
		cycleVShort: 3000,
		/** Cycle times - short. */
		cycleShort: 10000,
		/** Cycle times - medium. */
		cycleMedium: 15000,
		/** Cycle times - long. */
		cycleLong: 30000,
		/** Cycle times - manual (default). */
		cycleManual: 3000000,
		/** Cycle modes - random. */
		cycleRandom: 1,
		/** Cycle modes - linear (default). */
		cycleLinear: 2,
		/** Link targets - self (default). */
		targetSelf: '_self',
		/** Link targets - blank. */
		targetBlank: '_blank',
		/** Link targets - top. */
		targetTop: '_top',
		/** Link targets - parent. */
		targetParent: '_parent',
			
		/** Default settings for the plugin.
			@property [horizontal=true] {boolean} <code>true</code> for horizontal display,
						or <code>false</code> for vertical.
			@property [verticalCompressed=false] {boolean} <code>true</code> for compressed layout when vertical,
						or <code>false</code> for expanded.
			@property [title=''] {string} Title for the bar.
			@property [search='jquery'] {string|string[]} Single or list of search terms.
			@property [manyResults=false] {boolean} <code>true</code> for many results,
						or <code>false</code> for only a few.
			@property [cycleTime=this.cycleManual] {number} Time between cycles of the search terms (milliseconds).
			@property [cycleMode=this.cycleLinear] {number} Mode of cycling through the search terms.
			@property [linkTarget=this.targetSelf] {string} Control where the news links open.
			@property [currentResult=''] {string|jQuery|Element} jQuery selector, jQuery object,
						or element for additional info for current entry when horizontal. */
		defaultOptions: {
			horizontal: true,
			verticalCompressed: false,
			title: '',
			search: 'jquery',
			manyResults: false,
			cycleTime: this.cycleManual,
			cycleMode: this.cycleLinear,
			linkTarget: this.targetSelf,
			currentResult: ''
		},
		
		_init: function() {
			this.defaultOptions.cycleTime = this.cycleManual,
			this.defaultOptions.cycleMode = this.cycleLinear;
			this.defaultOptions.linkTarget = this.targetSelf;
			this._super();
		},

		_optionsChanged: function(elem, inst, options) {
			$.extend(inst.options, options);
			this._updateGSNewsbar(elem[0], inst);
		},

		/** Redisplay the newsbar with an updated display.
			@private
			@param elem {Element} The affected division.
			@param inst {object} The instance settings. */
		_updateGSNewsbar: function(elem, inst) {
			var getElement = function(selector) {
				var element = inst.options[selector];
				element = (element ? (element.jQuery ? element : $(element)) : null);
				return (element && element.length ? element[0] : null);
			};
			var search = inst.options.search;
			search = ($.isArray(search) ? search : [search]);
			inst.newsbar = new GSnewsBar(elem,
				{largeResultSet: inst.options.manyResults, horizontal: inst.options.horizontal,
				resultStyle: (inst.options.verticalCompressed ? 2 : 1),
				title: inst.options.title, linkTarget: inst.options.linkTarget,
				currentResult: getElement('currentResult'),
				autoExecuteList: {executeList: search, cycleTime: inst.options.cycleTime,
					cycleMode: inst.options.cycleMode}});
		},

		/** Perform a new search in the newsbar.
			@param elem {Element} The affected division.
			@param search {string} The new search terms. */
		search: function(elem, search) {
			var inst = this._getInst(elem);
			if (inst) {
				$.extend(inst.options, {search: search});
				inst.newsbar.execute(search);
			}
		},

		_preDestroy: function(elem, inst) {
			elem.empty();
		}
	});

	// Add required external files - note: key must be set before loading this module
	if ($('script[src*="www.google.com/uds/api?file=uds.js"]').length === 0) {
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

})(jQuery);
