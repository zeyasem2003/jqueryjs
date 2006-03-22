function $(a,c) {
	// Since we're using Prototype's $ function,
	// be nice and have backwards compatability
	if ( typeof Prototype != "undefined" ) {
		if ( a.constructor != String )
			return a;
		var re = new RegExp( "[^a-zA-Z0-9_-]" );
		if ( !re.test(a) ) {
			var obj = getById( c || document, a );
			if ( obj != null ) return obj;
		}
	}
  
	// bind these to self instead -
	// I think the scope is leaking
	var speed = {"slow":600,"fast":200,"medium":400};
	var e = ["blur","focus","contextmenu","load","resize","scroll","unload",
		"click","dblclick","mousedown","mouseup","mouseenter","mouseleave",
		"mousemove","mouseover","mouseout","change","reset","select","submit",
		"keydown","keypress","keyup","abort","error","ready"];
	
	var self = {
		cur: Select(a,c),
		
		// The only two getters
		size: function() {
			return this.cur.length;
		},
		get: function(i) {
			if ( i == null )
				return this.cur;
			else
				return this.cur[i];
		},
		
		addClass: function(c) {
			for ( var i = 0; this.cur && i < this.cur.length; i++ )
				addClass( this.cur[i], c );
			return this;
		},
		removeClass: function(c) {
			// return this.exec(function(){removeClass(this, c);});
			for ( var i = 0; this.cur && i < this.cur.length; i++ )
				removeClass( this.cur[i], c );
			return this;
		},
		html: function(h) {
			return this.set({ innerHTML: h });
		},
		set: function(s) {
			for ( var i = 0; this.cur && i < this.cur.length; i++ )
				for ( var j in s )
					this.cur[i][j] = s[j];
			return this;
		},
		style: function() {
			if ( arguments.length == 1 )
				for ( var i = 0; this.cur && i < this.cur.length; i++ )
					for ( var j in arguments[0] )
						this.cur[i].style[j] = arguments[0][j];
			else
				for ( var i = 0; this.cur && i < this.cur.length; i++ )
					this.cur[i].style[ arguments[0] ] = arguments[1];
			return this;
		},
		// Doesn't work? Is this testable?
		focus: function() {
			for ( var i = 0; this.cur && i < this.cur.length; i++ )
				this.cur[i].focus();
			return this;
		},
		show: function(a) {
      if ( a && fx.MultiFadeSize )
				new fx.MultiFadeSize(this.cur,{duration:speed[a]}).show();
      else
  			this.style( "display", "block" );
			return this;
		},
		hide: function(a) {
      if ( a && fx.MultiFadeSize )
				new fx.MultiFadeSize(this.cur,{duration:speed[a]}).hide();
      else
			  this.style( "display", "none" );
			return this;
		},
		exec: function(f) {
			for ( var i = 0; this.cur && i < this.cur.length; i++ ) {
				this.cur[i].$$tmpFunc = f;
				this.cur[i].$$tmpFunc(i);
				delete this.cur[i].$$tmpFunc;
			}
			return this;
		},
		
		// Handle onReady and onHover
		bind: function(t,f) {
			if ( typeof f == 'string' )
				f = new Function( f );
			for ( var i = 0; this.cur && i < this.cur.length; i++ )
				addEvent( this.cur[i], t, f );
			return this;
		},
		unbind: function(t,f) {
			if ( t == null ) {
				
			} else {
				if ( typeof f == 'string' )
					f = new Function( f );
				for ( var i = 0; this.cur && i < this.cur.length; i++ )
					removeEvent( this.cur[i], t, f );
			}
			return this;
		},
		// move to unbind
		clear: function(t) {
			for ( var i = 0; this.cur && i < this.cur.length; i++ )
				removeEvent( this.cur[i], t );
			return this;
		},
		clearAll: function() {
			for ( var j = 0; j < e.length; j++ )
				this.clear(e[j]);
			return this;
		},
		
		find: function(t) {
			var old = new Array();
			var ret = new Array();
			for ( var i = 0; i < this.cur.length; i++ ) {
				old.push( cur[i] );
				ret = merge( ret, Select(t,this.cur[i]) );
			}
			this.old = old;
			this.cur = ret;
			return this;
		},
		end: function() {
			this.cur = this.old;
		},
		filter: function(t) {
			this.cur = filter(t,this.cur).r;
			return this;
		},
		not: function(t) {
			if ( t.constructor == String )
				this.cur = filter(t,this.cur,false).r;
			else
				this.cur = grep(this.cur,function(a){return a != t;});
			return this;
		}
		/*,
		sort: function(f) {
			cur = cur.sort(function(a,b){
				if ( typeof f == 'object' )
					var ret = f(a,b);
				else
					var ret = genericSort(a,b,f);
	
				if ( a < b )
					b.parentNode.insertBefore( a, b );
				else if ( a > b )
					a.parentNode.insertBefore( b, a );
				return ret;
			});
			return this;
		},
		reverse: function() {
			cur[0].parentNode.appendChild( cur[0] );
			for ( var i = 1; cur && i < cur.length; i++ )
				cur[i-1].parentNode.insertBefore( cur[i], cur[i-1] );
			cur = cur.reverse();
			return this;
		}*/
	};

	for ( var i = 0; i < e.length; i++ ) {
		(function(){
			var o = e[i];
			self["on" + e[i].replace(/^(.)/,e[i].charAt(0).toUpperCase())] =
				function(f){ return self.bind(o, f); };
			self["clear" + e[i].replace(/^(.)/,e[i].charAt(0).toUpperCase())] =
				function(f){ return self.clear(o); };
		})();
	}
	
  return self;
}


/*
var $$uuid = 0;;

function addEvent( obj, type, fn ) {
	fn.$$uuid = $$uuid++;
	
	obj["do"+type] = function(e) {
		if ( e == null && window.event ) var e = window.event;
    
		// Check if mouse(over|out) are still within the same parent element
		if ( e && (type == "mouseout" || type == "mouseover") ) {
			if ( type == "mouseout" )
				var p = ( e.toElement != null ? e.toElement : e.relatedTarget );
			if ( type == "mouseover" )
				var p = ( e.fromElement != null ? e.fromElement : e.relatedTarget );
			while ( p && p != obj ) p = p.parentNode;
			if ( p == obj ) return false;
		}
		
		var old = obj[type];
		obj[type] = fn;
		if ( obj[type](e) == false && e ) {
			if ( e.preventDefault != null )
				e.preventDefault();
			if ( e.stopPropogation )
				e.stopPropogation();
      e.returnValue = false;
      e.cancelBubble = true;
		}
		obj[type] = old;
	};
	
	//if (!obj["$$"+type])
	//	obj["$$"+type] = new Array();
	//obj["$$"+type].push( obj["do"+type] );

	if ( type == "ready" ) {
		obj.$$timer = setInterval( function(){
			if ( typeof obj.getElementsByTagName != 'undefined' &&
				   typeof obj.getElementById != 'undefined' && obj.body ) {
				clearInterval( obj.$$timer );
				obj.$$timer = null;
				obj["do"+type]();
			} 
		}, 13 );
	} else if ( obj.attachEvent ) {
		obj.attachEvent( "on"+type, obj["do"+type] );
	} else if ( obj.addEventListener )
		obj.addEventListener( type, obj["do"+type], false );
	else
		obj["on"+type] = obj["do"+type];
}

function removeEvent( obj, type, fn ) {
	if ( type == "ready" ) {
		clearInterval( obj.$$timer );
		obj.$$timer = null;
	} else if ( obj.attachEvent )
		obj.removeEvent( "on"+type, obj["do"+type] );
	else if ( obj.addEventListener )
		obj.removeEventListener( type, obj["do"+type], false );
	else
		delete obj["on"+type];
}
*/

/*
function genericSort(a,b,c) {
	if ( typeof a == "string" || typeof b == "string" ) {
	} else if ( c != null ) {
		a = sibling(a.firstChild)[c].innerText;
		b = sibling(b.firstChild)[c].innerText;
	} else {
		a = a.innerText;
		b = b.innerText;
	}
	
	// Case insensitive
	a = a.toLowerCase();
	b = b.toLowerCase();
	
	// Figure out if it's an American-style date
	var re = new RegExp( "^(\d{2}).(\d{2}).(\d{2,4})$" );
	var ma = re.exec(a);
	var mb = re.exec(b);
	
	if ( ma.length && mb.length ) {
		a = ma.reverse().join('');
		b = mb.reverse().join('');
	}
	
	// If it contains a number, sort on that only
	if ( a.match(/\d/) ) {
		var re = new RegExp("[^0-9.-]","ig");
		a = parseFloat( a.replace( re, "" ) );
		b = parseFloat( b.replace( re, "" ) );
	}
	
	return ( a < b ? -1 : ( a > b ? 1 : 0 ) );
}
*/

function Select( t, context ) {
  if ( context == null )
    var context = document;
	
	if ( t.constructor != String )
		return new Array( t );
	
	if ( t.indexOf("//") == 0 ) {
		context = context.documentElement;
		t = t.substr(2,t.length);
	} else if ( t.indexOf("/") == 0 ) {
		context = context.documentElement;
		t = t.substr(1,t.length);
		// Assume the root element is right :(
		if ( t.indexOf('/') )
			t = t.substr(t.indexOf('/'),t.length);
	}
	
	// Make Xpath Axes Sane
	var re = new RegExp( "/?descendant::", "i" );
	t = t.replace( re, " " );
	var re = new RegExp( "/?child::", "i" );
	t = t.replace( re, "/" );
	// If only...
	//var re = new RegExp( "/?following-sibling::", "i" );
	//t = t.replace( re, " + " );
	var re = new RegExp( "/?preceding-sibling::", "i" );
	t = t.replace( re, " ~ " );
	var re = new RegExp( "/?self::", "i" );
	t = t.replace( re, "" );
	var re = new RegExp( "/?parent::", "i" );
	t = t.replace( re, " .. " );
	
	// following
	// preceding
	// ancestor
	// ancestor-or-self
	// descendant-or-self
	
	var ret = new Array( context );
  var done = new Array();
	var last = null;
  
  while ( t.length > 0 && last != t ) {
    var r = new Array();
		last = t;
    
    t = cleanSpaces(t);
    
    var re = new RegExp( "^//", "i" );
    t = t.replace( re, "" );

    if ( t.indexOf('..') == 0 || t.indexOf('/..') == 0 ) {
			if ( t.indexOf('/') == 0 )
				t = t.substr(1,t.length);
      r = map( ret, function(a){ return a.parentNode; } );
			t = t.substr(2,t.length);
			t = cleanSpaces(t);
    } else if ( t.indexOf('>') == 0 || t.indexOf('/') == 0 ) {
      r = map( ret, function(a){ return ( a.childNodes.length > 0 ? sibling( a.firstChild ) : null ); } );
			t = t.substr(1,t.length);
			t = cleanSpaces(t);
    } else if ( t.indexOf('+') == 0 ) {
      r = map( ret, function(a){ return sibling(a).next; } );
			t = t.substr(1,t.length);
			t = cleanSpaces(t);
    } else if ( t.indexOf('~') == 0 ) {
      r = map( ret, function(a){
        var r = new Array();
        var s = sibling(a);
        if ( s.n > 0 )
          for ( var i = s.n; i < s.length; i++ )
            r.push( s[i] );
        return r;
      } );
			t = t.substr(1,t.length);
			t = cleanSpaces(t);
    } else if ( t.indexOf(',') == 0 || t.indexOf('|') == 0 ) {
      if ( ret[0] == context ) ret.shift();
      done = merge( done, ret );
      r = ret = new Array( context );
			t = " " + t.substr(1,t.length); // Don't go to filter
    } else {
      var re = new RegExp( "^(#?\\.?)([a-z0-9\\*-]*)", "i" );
      var m = re.exec(t);
      t = t.replace( re, "" );

      switch( m[1] ) {
        case '#':
          r = new Array( getById( context, m[2] ) );
        break;
        case '.':
					for ( var i = 0; i < ret.length; i++ )
						r = merge( r, getByClass(ret[i],m[2]) );
        break;
        default:
					if ( m[2] == "" ) m[2] = "*";
					for ( var i = 0; i < ret.length; i++ )
						r = merge( r, getByTagName( ret[i], m[2] ) );
        break;
      }
    }
		
		if ( t.length > 0 ) {
			var val = filter(t,r);
			r = val.r;
			t = val.t;
		}

    t = cleanSpaces(t);
    ret = r;
  }

  if ( ret && ret[0] == context ) ret.shift();
  done = merge( done, ret );
  return done;
}

//window.cssQuery = Select;
//document.getElementsBySelector = Select;

function filter(t,r,not) {
	var g = grep;
	if ( not == false )
		var g = ngrep;
	
	// Filter the current Element Set
	while ( t.length > 0 && t.match(/^[:\\.#\\[a-zA-Z\\*]/) ) {
		var re = new RegExp( "^([:\\.#\\[]*)\s*([a-z0-9\\*-]*)\\(?[\"']?([a-z0-9\\+-]*)['\"]?\\)?", "i" );
		var m = re.exec(t);

		switch(m[1]) {
			case '>':
				t = t.replace( re, "" );
			break;
			case '':
				t = t.replace( re, "" );
				if ( m[2] != '*' )
					r = g( r, function(a){ return a.nodeName.toUpperCase() == m[2].toUpperCase(); } );
			break;
			case '#':
				t = t.replace( re, "" );
				r = g( r, function(a){ return a.id == m[2]; } );
			break;
			case ':':
				t = t.replace( re, "" );
				
				if ( hasWord("first last even odd",m[2]) ) {
					m[3] = m[2];
					m[2] = 'nth';
				}
				
				switch(m[2]) {
          case 'not':
            var re = new RegExp( "^([^\\)]*)\\)", "i" );
            var m = re.exec(t);
            t = t.replace( re, "" );
            r = filter(m[1],r,false).r;
          break;
					
					case 'lt':
						r = g( r, function(a,i){ return i < m[3] - 0; } );
					break;
					case 'gt':
						r = g( r, function(a,i){ return i > m[3] - 0; } );
					break;
					
					case 'eq':
					case 'nth':
						r = g( r, function(a,i){
							if ( m[3] == "first" ) m[3] = 0;
							else if ( m[3] == "last" ) m[3] = r.length - 1;
							if ( m[3] == "even" )
								return i % 2 == 0;
							else if ( m[3] == "odd" )
								return i % 2 == 1;
							else
								return m[3] - 0 == i;
						});
					break;
					
					case 'first-child': m[3] = "0";
					case 'nth-child':
						r = g( r, function(a){
							if ( m[3] == "even" )
								return (sibling(a,m[3]).n % 2 == 0);
							else if ( m[3] == "odd" )
								return (sibling(a,m[3]).n % 2 == 1);
							else
								return sibling(a,m[3]).cur;
						} );
					break;

					case 'last-child': m[3] = 0;
					case 'nth-last-child':
						r = g( r, function(a){ return sibling(a,m[3],true).cur; } );
					break;

					case 'first-of-type': m[3] = 0;
					case 'nth-of-type':
						r = g( r, function(a){ return ofType(a,m[3]).cur; } );
					break;

					case 'last-of-type': m[3] = 0;
					case 'nth-last-of-type':
						r = g( r, function(a){ return ofType(a,m[3],true).cur; } );
					break;

					case 'only-of-type':
						r = g( r, function(a){ return ofType(a).length == 1; } );
					break;

					case 'only-child':
						r = g( r, function(a){ return sibling(a).length == 1; } );
					break;

					case 'parent':
						r = g( r, function(a){ return a.childNodes.length > 0; } );
					break;
					
					case 'empty':
						r = g( r, function(a){ return a.childNodes.length == 0; } );
					break;
					
					case 'lang':
						r = g( r, function(a){ return a.lang == m[3]; } );
					break;

					case 'root':
						r = g( r, function(a){ return a == ( a.ownerDocument ? a.ownerDocument : document ).documentElement; } );
					break;

					case 'contains':
						r = g( r, function(a){
							var s = a.innerText || a.innerHTML;
							return s.indexOf(m[3]) != -1;
						} );
					break;
					
					case 'visible':
						r = g( r, function(a){ return (a.type && a.type != "hidden") && (a.style.display != 'none' && a.style.visibility != 'hidden'); } );
					break;
					case 'hidden':
						r = g( r, function(a){ return (a.type && a.type == "hidden") || a.style.display == 'none' || a.style.visibility == 'hidden' } );
					break;

					case 'enabled':
						r = g( r, function(a){ return a.disabled == false; } );
					break;
					case 'disabled':
						r = g( r, function(a){ return a.disabled; } );
					break;

					case 'checked':
						r = g( r, function(a){ return a.checked; } );
					break;
					case 'indeterminate':
						r = g( r, function(a){ return a.checked != null && !a.checked; } );
					break;
				}
			break;
			case '.':
				t = t.replace( re, "" );
				r = g( r, function(a) {
					return hasWord(a.className,m[2]) || hasWord(a.getAttribute('class'),m[2]);
				} );
			break;
			case '[':
				var re = new RegExp( "^\\[ *@([a-z0-9-]+) *(~?\\!?\\|?\\*?\\$?\\^?=?) *'?\"?([^'\"]*)'?\"? *\\]", "i" );
				var m = re.exec(t);
				
				// If attribute selection found
				if ( m && m.length > 0 ) {
					t = t.replace( re, "" );

					switch(m[2]) {
						case '=': // Equals
							r = g( r, function(a){ return a.getAttribute(m[1]) == m[3] } );
						break;
						case '!=': // Not Equals
							r = g( r, function(a){ return a.getAttribute(m[1]) != m[3] } );
						break;
						case '~=': // Space seperated
							r = g( r, function(a){
								return hasWord(a.getAttribute(m[1]),m[3]);
							} );
						break;
						case '|=':
						case '^=': // At start
							r = g( r, function(a){
								return ( a.getAttribute(m[1]) ? 
									a.getAttribute(m[1]).indexOf(m[3]) == 0 : false );
							} );
						break;
						case '$=': // At end
							r = g( r, function(a){
								var c = a.getAttribute(m[1]);
								if ( c != null ) {
									c = c.substr( c.length - m[3].length, m[3].length );
									return c == m[3];
								} else
									return false;
							} );
						break;
						case '*=': // Within
							r = g( r, function(a){
								return ( a.getAttribute(m[1]) ?
									a.getAttribute(m[1]).indexOf(m[3]) != -1 : false );
							} );
						break;
						default: // Exists
							if ( m[0] == '*' )
								r = g( r, function(a){ return a.attributes.length > 0 } );
							else {
								r = g( r, function(a){ return a.getAttribute(m[1]) } );
              }
						break;
					}
				} else {
					var re = new RegExp( "^\\[([^\\]]+)\\]", "i" );
					var m = re.exec(t);
					t = t.replace( re, "" );
					
					r = g( r, function(a){
						return Select(m[1],a).length > 0;
					});
				}
			break;
			default: break;
		}
	}
	return { r: r, t: t };
}

// Bind these functions to Select

function cleanSpaces(t) {
	var re = new RegExp("^\\s+");
	t = t.replace( re, "" );
	var re = new RegExp("\\s+$");
	t = t.replace( re, "" );
	return  t;
}

function ofType(a,n,e) {
  var type = new Array();
  var tmp = a.parentNode.childNodes;
  for ( var i = 0; i < tmp.length; i++ ) {
    if ( tmp[i].nodeName == a.nodeName )
      type.push( tmp[i] );
    if ( tmp[i] == a )
      type.n = type.length - 1;
  }
  if ( e ) n = type.length - n - 1;
  type.cur = ( type.n == parseInt(n) );
  return type;
}

function sibling(a,n,e) {
  var type = new Array();
  var tmp = a.parentNode.childNodes;
  for ( var i = 0; i < tmp.length; i++ ) {
    if ( tmp[i].nodeType == 1 )
      type.push( tmp[i] );
    if ( tmp[i] == a )
      type.n = type.length - 1;
  }
  if ( e ) n = type.length - n - 1;
  type.cur = ( type.n == n );
  type.prev = ( type.n > 0 ? type[type.n - 1] : null );
  type.next = ( type.n < type.length - 1 ? type[type.n + 1] : null );
  return type;
}

function addClass(e,a) {
  if ( e == null || hasWord(e,a) ) return;
	e.className += ( e.className.length > 0 ? " " : "" ) + a;
}

function removeClass(e,a) {
  if ( e == null || !hasWord(e,a) ) return;
	var ret = "";
  var s = e.className.split( " " );
  for ( var i = 0; i < s.length; i++ )
		if ( s[i] != a ) {
			if ( ret.length > 0 ) ret += " ";
			ret += s[i];
		}
	e.className = ret;
}

function hasWord(e,a) {
  if ( e == null ) return false;
	if ( e.className != null ) e = e.className;
  var s = e.split( " " );
  for ( var i = 0; i < s.length; i++ )
    if ( s[i] == a )
      return true;
  return false;
}

function getByTagName(o,c) {
	var rt = new Array();
	
	switch( c ) {
		case '*':
			rt = getAllChildren(o);
		break;
		case 'text': case 'radio': case 'checkbox': case 'hidden':
		case 'button': case 'submit': case 'image': case 'password':
		case 'reset': case 'image': case 'file':
			rt = o.getElementsByTagName( "input" );
			rt = grep( rt, function(a){ return a.type == c });
		break;
		case 'input':
			rt = merge( o.getElementsByTagName( "input" ), rt );
			rt = merge( o.getElementsByTagName( "select" ), rt );
			rt = merge( o.getElementsByTagName( "textarea" ), rt );
		break;
		default:
			rt = o.getElementsByTagName( c );
		break;
	}
  
  var r = new Array();
  for ( var i = 0; i < rt.length; i++ )
    r.push( rt[i] );
	
	return r;
}

function getById(c,a) {
  if ( c.getElementById != null )
    return c.getElementById(a);
  else {
    var e = getAllChildren(c);
    for ( var i = 0; i < e.length; i++ )
      if ( e[i].id == a )
        return e[i];
    return null;
  }
}

function getAllChildren(o,r) {
	if(!r) var r = new Array();
	var s = o.childNodes;
	for ( var i = 0; i < s.length; i++ ) {
		if ( s[i].nodeType == 1 ) {
			r.push(s[i]);
			getAllChildren( s[i], r );
		}
	}
	return r;
}

function getByClass(o,c) {
  var r = new Array();
  var e = getAllChildren(o);
  for ( var i = 0; i < e.length; i++ )
    if ( hasWord( e[i].className, c ) )
      r.push( e[i] );
  return r;
}

function merge(a,b) {
  for ( var i = 0; i < a.length; i++ ) {
    var c = true;
    for ( var j = 0; j < b.length; j++ )
      if ( a[i] == b[j] )
        c = false;
		if ( c )
			b.push( a[i] );
  }
	return b;
}

function grep(a,f) {
  var r = new Array();
	if ( a != null )
		for ( var i = 0; i < a.length; i++ )
			if ( f(a[i],i) )
				r.push( a[i] );
  return r;
}

function ngrep(a,f) {
  var r = new Array();
	if ( a != null )
		for ( var i = 0; i < a.length; i++ )
			if ( !f(a[i],i) )
				r.push( a[i] );
  return r;
}

function map(a,f) {
  var r = new Array();
  for ( var i = 0; i < a.length; i++ ) {
    var t = f(a[i],i);
    if ( t != null )
      if ( t.push )
        for ( var j = 0; j < t.length; j++ )
          r.push( t[j] );
			else {
				var di = true;
				for ( var k = 0; k < r.length; k++ )
					if ( r[k] == t )
						di = false;
				if ( di )
					r.push( t );
			}
  }
  return r;
}

// written by Dean Edwards, 2005
// with input from Tino Zijdel
// http://dean.edwards.name/weblog/2005/10/add-event/

function addEvent(element, type, handler) {
	if (!handler.$$guid) handler.$$guid = addEvent.guid++;
	if (!element.events) element.events = {};
	var handlers = element.events[type];
	if (!handlers) {
		handlers = element.events[type] = {};
		if (element["on" + type])
			handlers[0] = element["on" + type];
	}
	handlers[handler.$$guid] = handler;
	element["on" + type] = handleEvent;
};
addEvent.guid = 1;

function removeEvent(element, type, handler) {
	if (element.events)
		if (type && element.events[type])
			if ( handler )
				delete element.events[type][handler.$$guid];
			else
				for ( var i in element.events[type] )
					removeEvent( element, type, i );
		else
			for ( var i in element.events )
				removeEvent( element, i );
};

function handleEvent(event) {
	var returnValue = true;
	event = event || fixEvent(window.event);
	var handlers = this.events[event.type];
	for (var i in handlers) {
		this.$$handleEvent = handlers[i];
		if (this.$$handleEvent(event) === false) {
			event.preventDefault();
			event.stopPropagation();
			returnValue = false;
		}
	}
	return returnValue;
};

function fixEvent(event) {
	event.preventDefault = fixEvent.preventDefault;
	event.stopPropagation = fixEvent.stopPropagation;
	return event;
};
fixEvent.preventDefault = function() {
	this.returnValue = false;
};
fixEvent.stopPropagation = function() {
	this.cancelBubble = true;
};
