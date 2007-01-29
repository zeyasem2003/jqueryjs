// initializer for all js/plugins
jQuery(function($){
	// modify body to mark js layout
	$(document.body).addClass("js");
	
	// general tooltips ( http://bassistance.de/jquery-plugins/jquery-plugin-accordion/ )
	$("span.tooltip").Tooltip({ delay: 150 });
	
	// quicksearch ( http://rikrikrik.com/jquery/quicksearch/ )
	$("#navCat, #navAlpha").find("ul li").quicksearch({
		position: 'before',
		focusOnLoad: false,
		delay: 50,
		loaderText: "",
		attached: '#nav ul.tabs-nav',
		formId: "navQS"
	});
	$('#docs>li').quicksearch({
		focusOnLoad: false,
		loaderText: "",
		delay: 50,
		formId: "mainQS"
	});
	// quicksearch tooltips
	$("#mainQS, #navQS").find("input")
		.attr("title", 'Filter displayed elements^, eg "$" to display only entries that contain the $ alias. Clear to display all.')
		.Tooltip({delay: 50});
	
	// navigation tabs ( http://stilbuero.de/tabs/ )
	$('#nav').tabs();
	
	// splitter ( http://methvin.com/jquery/splitter/ )
	/* deactivate, currently causes too many problems
	$("#content").height("90%").splitter({
		type: 'v', outline: true,
		minA: 200, initA: 300, minB: 200
	});
	// Firefox doesn't fire resize on page elements
	$(window).bind("resize", function(){
		$("#content").trigger("resize"); 
	}).trigger("resize");
	*/
	
	// navigation trees ( http://bassistance.de/jquery-plugins/jquery-plugin-treeview/ )
	$("#navCat>ul").Treeview({ control: "#navCat div.treecontrol" });
	$("#navAlpha>ul").Treeview({ control: "#navAlpha div.treecontrol" });

	// highlightfade on navigation to a method ( http://jquery.offput.ca/highlightFade/ )
	$("#nav div li a").click(function() {
		$( this.href.match(/(#.+)/)[1] ).highlightFade({start: "blue"});
	});
	
	// chili is also used, but it initializes itself ( http://www.mondotondo.com/aercolino/noteslog/?cat=8 )
});
