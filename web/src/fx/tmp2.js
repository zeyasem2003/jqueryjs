$.speed = function(s,o) {
  o = o || {};
  o.duration = {"crawl":1200,"xslow":850,"slow":600,"medium":400,
	  "fast":200,"xfast":75}[s] || typeof s == "number" ? s : 400;
  return o;
};

$.fn.hide = function(a,o) {
  o = $.speed(a,o);
  return a ? this.each(function(){
    new fx.FadeSize(this,o).hide();
  }) : this._hide();
};

$.fn.show = function(a,o) {
  o = $.speed(a,o);
  return a ? this.each(function(){
    new fx.FadeSize(this,o).show();
  }) : this._show();
};

$.fn.slideDown = function(a,o) {
  o = $.speed(a,o);
  return this.each(function(){
    new fx.Resize(this,o).show("height");
  });
};

$.fn.slideUp = function(a,o) {
  o = $.speed(a,o);
  return this.each(function(){
    new fx.Resize(this,o).hide("height");
  });
};

$.fn.fadeOut = function(a,o) {
  o = $.speed(a,o);
  return a ? this.each(function(){
    new fx.Opacity(this,o).hide();
  }) : this._hide();
};

$.fn.fadeIn = function(a,o) {
  o = $.speed(a,o);
  return a ? this.each(function(){
    new fx.Opacity(this,o).show();
  }) : this._show();
};

$.fn.center = function(f) {
  return this.each(function(){
		if ( !f && this.nodeName == 'IMG' &&
				 !this.offsetWidth && !this.offsetHeight ) {
			var self = this;
			setTimeout(function(){
				$(self).center(true);
			}, 13);
		} else {
			var s = this.style;
			var p = this.parentNode;
			if ( $.css(p,"position") == 'static' )
				p.style.position = 'relative';
			s.position = 'absolute';
			s.left = parseInt(($.css(p,"width") - $.css(this,"width"))/2) + "px";
			s.top = parseInt(($.css(p,"height") - $.css(this,"height"))/2) + "px";
		}
  });
};
