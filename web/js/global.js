$(document).ready(function(){
	$("pre.run").append('<input type="submit" value="&raquo; Run"/>')
		.find("input").click(function(){
			eval(this.parentNode.childNodes[0].nodeValue);
			$(this).remove();
		});
	$("#download").oneclick(function(){
		$("#form").slideDown("slow");
		$(this).remove();
		return false;
	});
});
