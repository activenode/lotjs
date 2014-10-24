/*!
 * lotjs JavaScript Framework 1.0
 * Initially created at https://code.google.com/p/lotjs/
 * Now located at GitHub.
 *
 * Developed by David Lorenz (http://activenode.de)
 * Released under the MIT license
 */



$ = function(expr) {
	if (typeof expr == 'number') {
		//hey we got a mathematician here
		return new $._mathObject(expr);
	} else if (typeof expr == 'string' || expr instanceof HTMLElement 
		|| expr instanceof $._domObject || expr instanceof $._collectionType) {
		//should be DOMElement-Expression type
		return new $._domObject(expr);
	} else {
		//cant handle this
		throw "Cannot inititate " + typeof expr + "in primary $(..)-function";
	}
};





/*
	Open access methods
*/
$.oa = {
	hasClass: function(domElement,className) {
		if (domElement.getAttribute) { //check if available (e.g. not at domtype)
			var c = domElement.getAttribute('class');
			if (typeof c=="string") {
				c = c.split(" ");
				for (i in c) {
					if (c[i]==className) {
						return true;
					}
				}
			} 
		}
		
		return false;

	},
	hasTagName: function(domElement,tagName) {
		if (domElement.tagName) { //check if available (e.g. not at domtype)
			return domElement.tagName.toLowerCase() == tagName.toLowerCase();
		}
		
		return false;
	},
	
	getAttr: function(domElement,name) {
		return domElement.getAttribute(name);
	},
	
	setAttr: function(domElement,name,val){
		domElement.setAttribute(name,val);
	},
	
	
	//bidirectional CSS parser
	parseCSS: function(domElement,styleObj) {
		if (styleObj==undefined) {
			//READ
			var styleObj = {};
			var style = $.oa.getAttr(domElement,'style');
			
			if (style) { //check if anything there
				style = style.split(';');
				
				for (i in style) {
					style[i] = $.oa.trim(style[i]);
					if (style[i]!="" && style[i]!=" ") { //was an error source...
						var s = style[i].split(':');
						if (s.length>1) {
							styleObj[s[0]] = s[1];
						}
					}
					
				}
			}
			
			
			
			return styleObj;
		} else {
			//WRITE
			var style = '';
			for (cssName in styleObj) { //duplicate names in object can NOT occur, which is good
				style += cssName+':'+styleObj[cssName]+';'; //access like assocArray
			}
			
			$.oa.setAttr(domElement,'style',style);
		}
		
	},
	
	//removes whitespaces at the start and the end of a string
	trim: function(str) {
		var regexp = /^\s*(?:(\S[\S\s]*\S)|(\S[\S]*))\s*$/;
		var match = regexp.exec(str);
		
		if (match && match.length > 1) {
			return match[1];
		} else {
			return str;
		}
	},
	
	ajax: function(requestUri,successFunc,reqType) {
		if (reqType==undefined) {
			var reqType = 'GET';
		} else {
			reqType = reqType.toUpperCase();
		}
		
		
		
		var httpRequest = null;
		try {
		    //Internet Explorer (>=v7) and other browsers
		    httpRequest = new XMLHttpRequest();
		} catch(e) {
		    try {
		        //IE (v6)
		        httpRequest  = new ActiveXObject("Microsoft.XMLHTTP");
		    } catch(e) {
		        try {
		            //IE (v5)
		            httpRequest  = new ActiveXObject("Msxml2.XMLHTTP");
		        } catch(e) {
		            httpRequest  = null;
		        }
		    }
		}
		
		if (httpRequest!=null) {
		    httpRequest.open(reqType, requestUri+'?r='+Math.random(), true);
		    httpRequest.onreadystatechange = function () {
		        if (httpRequest.readyState == 4) {
		            if (successFunc!=undefined) {
			            successFunc(httpRequest.responseText);
		            }
		        }
		    };
		    httpRequest.send(null);
		}
	}
};



/**
#######################################
#######################################
#######################################
**/
$._mathObject = function(number) {
	this.number = number;
	
	//creates new mathobject instance
	this._c = function(number) {
		return new $._mathObject(number);	
	};
	
	
	//square function
	this.square = function() {
		return this.pow(2);
	};
	
	
	//power function
	this.pow = function(exponent) {
		return this._c(Math.pow(this.number, exponent));
	};
	
	
	//modulo function
	this.mod = function(intB) {
		return this._c(this.number%intB);
	};
	
	
	//add
	this.plus = function(add) {
		return this._c(this.number+add);
	};
	
	
	//subtract
	this.minus = function(sub) {
		return this._c(this.number-sub);
	};
	
	//multiply
	this.mult = function(tiply) {
		return this._c(this.number*tiply);
	};
	
	//divide
	this.divide = function(dNum) {
		return this._c(this.number/(1.0*dNum));
	};
	
	//>= 0 ?
	this.isPositive = function() {
		return this.number >= 0;	
	};
	
	
	//< 0 ?
	this.isNegative = function() {
		return !(this.isPositive());	
	};
	
	
	//flooring
	this.floor = function() {
		return this._c(Math.floor(this.number));
	};
	
	//ceiling
	this.ceil = function() {
		return this._c(Math.ceil(this.number));
	};
	
	//absolute value
	this.abs = function() {
		return this._c(Math.abs(this.number));
	};
	
	//from 0/1 to number
	this.upLoop = function(handler,useNatural) {
		for (var i=0; i<this.number; i++) {
			handler(i+((useNatural===true)?1:0));
		}
	};
	
	
	this.toString = function() {
		return this.number;
	};
	
	return this;
};



/**
#######################################
#######################################
#######################################
**/
$._collectionType = function(collection) {
	this.collection = collection;
	
	//no array-preset to avoid bigger errors
	if (!collection) { 
		throw "collection must (!) be given as a parameter in collectionType";
	}
	
	this.get = function() {
		return this.collection;
	};
	
	this.push = function(obj) {
		this.collection.push(obj);
		return this;
	};
	
	//unlike push, add will concat an array of elements
	//no validty checks done here cause it shall only be called from
	//the system itself
	this.__concat = function(arr) {
		this.collection = this.collection.concat(arr);
		return this;
	};
};


/**
#######################################
#######################################
#######################################
this is where the magic happens: the domObject extending possibilities of real DOMElements
**/
$._domObject = function(expr) {
	this.domObjectCollection = []; //the contained object (could be set of elements)
	
	//getDomObject
	this.getAll = function() {
		return this.domObjectCollection;
	};
	
	this.length = function() {
		return this.domObjectCollection.length;
	};
	
	//hasClass does either match at least ONE or EVERYTHING
	this.hasClass = function(className, matchEverything) {
		matchEverything = matchEverything && matchEverything==true;
		for (i in this.domObjectCollection) {
			if (matchEverything) {
				if (!$.oa.hasClass(this.domObjectCollection[i])) {
					return false;
				}
			} else {
				if ($.oa.hasClass(this.domObjectCollection[i])) {
					return true;
				}
			}
		}
		
		return matchEverything;
	};
	
	this._find = function(expr, parent, directChildOnly) {
		var idfinder 				= /^\#(.+)$/gi;
		var classfinder				= /^\.(.+)$/gi;
		var elementfinder			= /^[a-z]+$/;
		var nodefinder				= "*";
		
		if (directChildOnly == undefined) {
			var directChildOnly = false;
		}
		
		directChildOnly = (directChildOnly==true) ? true : false; //in case it's given, check for TRUE
		
		if (idfinder.test(expr)) {
			//find elmement with id
			var find = document.getElementById(expr.substring(1));
			var collection = new $._collectionType([]);
			if (find) {
				collection.push(find);
			}
			
			return new $._domObject(collection);
		} else {
			//find elements with class OR elements with tagName
			var isLookingForClasses = classfinder.test(expr);
			var doesValidate	= (isLookingForClasses) ? function(elem, expr) {
					return $.oa.hasClass(elem,expr.substring(1));
				} : function(elem, expr) {
					return $.oa.hasTagName(elem,expr);
				};
			
			//check for nodefinder before going on:
			if (expr==nodefinder) { //match everything
				doesValidate = function(elem) {
					if (elem.tagName) {
						return true;
					} else {
						return false;
					}
				};
			}
			
			var childElements 		= parent.childNodes;
			var collectedElements	= [];
			
			//while has childnodes, go deep and search with hasclass
			for (var i=0; i<childElements.length; i++) {
				if(doesValidate(childElements[i],expr)) {
					collectedElements.push(childElements[i]);
				} 
				
				if (!directChildOnly) {
					if (childElements[i].childNodes.length>0) {
						if (typeof childElements[i]=='object') {
							var recursionFind = $(childElements[i]).find(expr).getAll();
							if (!recursionFind) {recursionFind = []} //not really needed. only for keeping consistency
							
							collectedElements = collectedElements.concat(recursionFind);
							
						}
					}
				}
			}
			
		}
		
		collectedElements = new $._collectionType(collectedElements);
		return $(collectedElements);
	};
	
	
	this.find = function(expr, directChildOnly) {
		var collection = new $._collectionType([]);
		
		for (i in this.domObjectCollection) {
			var domObject = this.domObjectCollection[i];
			collection.__concat(this._find(expr, domObject, directChildOnly).getAll());
		}
		
		return new $._domObject(collection);
	};
	
	
	//each will iterate the collection with perfectly changing context
	//in case wrap is set then the context will be an $._domObject of the element
	this.each = function(elementHandler, wrap){
		for (i in this.domObjectCollection) {
			var domObject = this.domObjectCollection[i];
			domObject = (wrap) ? $(domObject) : domObject; //see explanation above
			
			domObject.__contextChangedFunction = elementHandler;
			domObject.__contextChangedFunction(i);
			domObject.__contextChangedFunction = null; //we dont want to store it
		}
	};
	
	
	
	this.parent = function() {
		//collect all the parents
		var collection = new $._collectionType([]);
		
		for (i in this.domObjectCollection) {
			var domObject = this.domObjectCollection[i];
			if (domObject.parentNode) {
				collection.push(domObject.parentNode);
			}
		}
        
        
		
		return $(collection);
	};
	
    
    
	this.children = function() {
		return this.find('*', true);	
	};
	
	
	//returns first element of collection
	this.first = function() {
		if (this.length()<=1) { //in case 0,1 this is common sense
			return this;
		} else {
			//there is more
			return $(this.domObjectCollection[0]);
		}
	};
	
	//returns last element of collection
	this.last = function() {
		if (this.length()<=1) { //in case 0,1 this is common sense
			return this;
		} else {
			//there is more
			return $(this.domObjectCollection[this.length()-1]);
		}
	};
	
	//returns the nth element of the collection (if n not given, returns first)
	this.getDomElement = function(n) { //important: at this point no checks are done
		if (n==undefined) {
			var n=0;
		}
		
		return this.domObjectCollection[n];
	};
	
	
	//-----------------------
	//EVENT handlings > START
	//-----------------------
	
	this.click = function(handler) {
		this.each(function(){
			this.onclick = handler; //correct context
		});
	};
   
	this.mouseover = function(handler) {
	    this.each(function(){
			this.onmouseover = handler; //correct context
		});
    };
    
    this.mouseout = function(handler) {
	    this.each(function(){
			this.onmouseout = handler; //correct context
		});
    };
    
    this.load = function(handler) {
	    this.each(function(){
			this.onload = handler; //correct context
		});
    };
    
	//-----------------------
	//EVENT handlings > END
	//-----------------------
	
	
	
	//-----------------------
	//direct DOM affecting handlings > START
	//-----------------------
	
	
	//will remove the element(s) completely from dom
	this.remove = function() {
		//having the each-function we will make use of it in here
		
		this.each(function(){ //will be in element context!
			this.parentNode.removeChild(this);
		});
	};
	
	this.html = function(data) {
		if (data==undefined) { //no data is given, so return the html data
			return this.last().getDomElement().innerHTML;
		}
		
		//else (implicit):
		this.each(function(){
			this.innerHTML = data;
		});
		
		return this;
	};
	
	
	//returns the styleObj (last is common sense cause would be last executed)
	this.styleObj = function() {
		return $.oa.parseCSS(this.last().getDomElement());
	};
	
	this.css = function(name,val) {
		if (val==undefined) {
			var styleObj = this.styleObj();
			if (styleObj[name]!=undefined) {
				return styleObj[name];
			} 
			
			return ''; //implicit else
		} else {
			this.each(function(){
				var currentCss = $.oa.parseCSS(this);
				currentCss[name] = val;
				
				$.oa.parseCSS(this,currentCss);
			});
			
			return this;
		}
		
	};
	
	this.dimensions = function() {
		var widthPadding 	= 0;
		var heightPadding	= 0;
		
		var paddings = [0,0,0,0];
		if (this.css('padding')!='') {
			paddings = this.css('padding').replace('  ',''); //remove double spaces (just in case)
			paddings = paddings.split(' ');
			
			while (paddings.length < 4) { //fill up the rest
				paddings.push(0);
			}
		} else {
			if (this.css('padding-top')!='') {
				paddings[0] = parseInt(this.css('padding-top'));
			}
			
			if (this.css('padding-right')!='') {
				paddings[1] = parseInt(this.css('padding-right'));
			}
			
			if (this.css('padding-bottom')!='') {
				paddings[2] = parseInt(this.css('padding-bottom'));
			}
			
			if (this.css('padding-left')!='') {
				paddings[3] = parseInt(this.css('padding-left'));
			}
			
			
		}
		
		widthPadding 	= parseInt(paddings[1])+parseInt(paddings[3]);
		heightPadding 	= parseInt(paddings[0])+parseInt(paddings[2]);
		
		var domObject = this.last().getDomElement();
		var width 	= (this.css('width')!='') ? parseInt(this.css('width')) : domObject.clientWidth-widthPadding;
		var height 	= (this.css('height')!='') ? parseInt(this.css('height')) : domObject.clientHeight-heightPadding;

		return [width,height];
	};
	
	this.width = function() {
		return this.dimensions()[0];
	};
	
	this.height = function() {
		return this.dimensions()[1];
	};
	
	//-----------------------
	//direct DOM affecting handlings > END
	//-----------------------
	
	
	
	//-----------------------
	//FX/Animations > START
	//-----------------------
	this._fxPrepare = function() {
		this.each(function(){
			var restoreCss = null;
			
			if (this._fx) {
				this._fx.stop(); //necessary, overwrite will NOT delete interval!
				restoreCss = this._fx.restoreCss;
			}
			
			var selfReference = this;
			
			this._fx = {
				interval: null,
				msTotal: 0,
				msTarget: null, 
				restoreCss: restoreCss, //to mention
				interpolateAnimation: function(msPlus) {
					this.msTotal += msPlus;
					
					if (!this.msTarget) { //needed for debugging
						throw "msTarget has non valid value";
						this.stop();
						return;
					}
					
					var percent = this.msTotal/this.msTarget;
					if (percent > 1) {
						percent = 1;
						this.stop();
					}
					
					return percent;
				},
				stop: function() {
					if (this.interval!=null) {
						window.clearInterval(this.interval);	
					}
					
					if (this.restoreCss!=null) {
						$.oa.parseCSS(selfReference,this.restoreCss);
					}
				}
			};
		});
	};
	
	this._setFx = function(msTime,fxFunc) {
		this._fxPrepare(); //make sure fx is initiated and resetted
		//---------------------------------------------
		
		if (msTime==undefined) {
			var msTime = 500; //just a default value
		}
		
		this.each(function(){
			var domObject = this; //needed for self referencing
			this._fx.msTarget 	= msTime;
			this._fx.func = function(){
				fxFunc(domObject,domObject._fx.interpolateAnimation(10));
			};
			this._fx.interval = window.setInterval(this._fx.func,10);
		});
	};
	
	this.fadeIn = function(msTime) {
		this._setFx(msTime,function(domObject,percent){
			$(domObject).css('opacity',percent);
		});
	};
	
	this.fadeOut = function(msTime) {
		this._setFx(msTime,function(domObject,percent){
			$(domObject).css('opacity',1-percent);
		});
	};
	
	this.show = function(useFx) {
		if (!(useFx==undefined) && useFx==true) {
			//do animations
			this._fxPrepare(); 
				//_fxPrepare is needed though called again in setfx
				//this is caused by the fact that we will now check a certain property
				
			this.each(function(){
				var toShow = $(this);
				if (this._fx.restoreCss==null) {
					this._fx.restoreCss=toShow.styleObj();
					this._fx.restoreCss.width = toShow.width()+'px';
					this._fx.restoreCss.height = toShow.height()+'px';
				}  
				this._fx.restoreCss.display = 'block'; //we have to overwrite this in case it was invisible before!
				
				toShow._setFx(400,function(domObject,percent){
					var width 	= Math.round(percent*parseInt(domObject._fx.restoreCss.width))+'px';
					var height 	= Math.round(percent*parseInt(domObject._fx.restoreCss.height))+'px';
					$(domObject).css('opacity',percent);
					$(domObject).css('width',width);
					$(domObject).css('height',height);
					
					$(domObject).css('display','block');
				});
			});
		} else {
			this.css('display','block');
		}
	};
	
	this.hide = function(useFx) {
		if (!(useFx==undefined) && useFx==true) {
			//do animations
			this._fxPrepare(); 
				//_fxPrepare is needed though called again in setfx
				//this is caused by the fact that we will now check a certain property
				
			this.each(function(){
				var toHide = $(this);
				if (this._fx.restoreCss==null) {
					this._fx.restoreCss=toHide.styleObj();
					//this._fx.restoreCss.display = 'none';
						//CANNOT do this at this place cause will
						//be executed directly when calling _setFx
						//in _fxPrepare
				} 
				
				var oldWidth 	= toHide.width();
				var oldHeight 	= toHide.height();
				
				toHide._setFx(400,function(domObject,percent){
					domObject._fx.restoreCss.display = 'none';
					var width 	= Math.round((1-percent)*oldWidth)+'px';
					var height 	= Math.round((1-percent)*oldHeight)+'px';
					$(domObject).css('opacity',1-percent);
					$(domObject).css('width',width);
					$(domObject).css('height',height);
				});
			});
		} else {
			this.css('display','none');
		}
	};
	//-----------------------
	//FX/Animations > START
	//-----------------------
	
	
	
	
	if (typeof expr=='string') {
		//find it with regular expressions
		return this._find(expr, document); //IMPORTANT: document is used as parent here 
	} else {
		//is <kind> of domelement
		if (expr instanceof $._domObject) {
			return expr; //avoiding double wrapping which will cause errors
		} else if (expr instanceof $._collectionType) {
			this.domObjectCollection = expr.get(); //dissolve the collection
		} else {
			this.domObjectCollection = [expr];	//must be domObject (htmlobject)
		}
	}
	
	
	

	return this;
};


/**
#######################################
#######################################
#######################################
Short write aliases
**/
$.ajax = $.oa.ajax;
$.trim = $.oa.trim;




/**
#######################################
#######################################
#######################################
provide simple onLoad Handling like in JQuery (different type of implementation though)
here $.load(..) is window-specific.
**/
$._load = {
	onloadHandlers: [],
	init: function() {
		window.onload = function() {
			for (var i=0; i<$._load.onloadHandlers.length; i++) {
				$._load.onloadHandlers[i]();
			}
		}
	},
	add: function(onloadHandler) {
		this.onloadHandlers.push(onloadHandler);
	}
};

$.load = function(onloadHandler) {
	$._load.add(onloadHandler);
};


$._load.init();
