//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Copyright (c) 2014 Richard James Roots
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------

'use strict';
/**
# scrawlStacks

## Purpose and features

The Stacks module adds support for CSS3 3d transformations to visible &lt;canvas&gt;, and other, elements

* Significantly amends the PageElement object and functions
* Adds core functions for detecting and including Scrawl stacks and associated elements in the library
* Defines the Stack object, which contains all DOM elements to be manipulated by this stack
* Defines the Element object, which wrap DOM elements (excluding &lt;canvas&gt; elements) included in a stack

@module scrawlStacks
**/

var scrawl = (function(my){

/**
# window.scrawl

scrawlStacks module adaptions to the Scrawl library object

## New library sections

* scrawl.stack - for Stack objects
* scrawl.stk - for handles to DOM stack containers
* scrawl.element - for Element objects
* scrawl.elm - for handles to DOM elements within a stack

## New default attributes

* PageElement.start - default: {x:0,y:0,z:0};
* PageElement.delta - default: {x:0,y:0,z:0};
* PageElement.translate - default: {x:0,y:0,z:0};
* PageElement.handle - default: {x:'center',y:'center',z:0};
* PageElement.pivot - default: '';
* PageElement.stack - default: '';
* PageElement.path - default: '';
* PageElement.pathPlace - default: 0;
* PageElement.deltaPathPlace - default: 0;
* PageElement.pathSpeedConstant - default: true;
* PageElement.pathRoll - default: 0;
* PageElement.addPathRoll - default: false;
* PageElement.lockX - default: false;
* PageElement.lockY - default: false;
* PageElement.rotation - default: {n:1,v:{x:0,y:0,z:0}};
* PageElement.deltaRotation - default: {n:1,v:{x:0,y:0,z:0}};
* PageElement.rotationTolerance - default: 0.001;
* PageElement.visibility - default: true;

@class window.scrawl_Stacks
**/

/**
scrawl.init hook function - modified by stacks module
@method pageInit
@private
**/
	my.pageInit = function(){
		my.getStacks();
		my.getCanvases();
		my.getElements();
		};
/**
A __private__ function that searches the DOM for elements with class="scrawlstack"; generates Stack objects
@method getStacks
@return True on success; false otherwise
@private
**/
	my.getStacks = function(){
		var	s = document.getElementsByClassName("scrawlstack"),
			stacks = [],
			myStack;
		if(s.length > 0){
			for(var i=0, z=s.length; i<z; i++){
				stacks.push(s[i]);
				}
			for(var i=0, z=s.length; i<z; i++){
				myStack = my.newStack({
					stackElement: stacks[i],
					});
				for(var j=0, w=my.stk[myStack.name].children.length; j<w; j++){
					my.stk[myStack.name].children[j].style.position = 'absolute';
					if(my.stk[myStack.name].children[j].tagName !== 'CANVAS'){
						my.newElement({
							domElement: my.stk[myStack.name].children[j],
							stack: myStack.name,
							});
						}
					}
				if(my.contains(my.elementnames, myStack.name)){
					myStack.stack = my.element[myStack.name].stack;
					delete my.element[myStack.name];
					delete my.elm[myStack.name];
					my.removeItem(my.elementnames, myStack.name);
					}
				}
			return true;
			}
		console.log('my.getStacks() failed to find any elements with class="scrawlstack" on the page');
		return false;
		};
/**
A __private__ function that searches the DOM for canvas elements and generates Pad/Cell/Context objects for each of them

(This function replaces the one defined in the core module)
@method getCanvases
@return True on success; false otherwise
@private
**/
	my.getCanvases = function(){
		var	s = document.getElementsByTagName("canvas"),
			myPad, 
			myStack, 
			myElement, 
			myNewStack,
			canvases = [];
		if(s.length > 0){
			for(var i=0, z=s.length; i<z; i++){
				canvases.push(s[i]);
				}
			for(var i=0, z=s.length; i<z; i++){
				if(canvases[i].className.indexOf('stack:') !== -1){
					myStack = canvases[i].className.match(/stack:(\w+)/);
					if(my.contains(my.stacknames, myStack[1])){
						my.stk[myStack[1]].appendChild(canvases[i]);
						}
					else{
						myElement = document.createElement('div');
						myElement.id = myStack[1];
						canvases[i].parentElement.appendChild(myElement);
						myElement.appendChild(canvases[i]);
						myNewStack = my.newStack({
							stackElement: document.getElementById(myStack[1]),
							});
						}
					}
				myPad = my.newPad({
					canvasElement: canvases[i],
					});
				if(my.contains(my.stacknames, canvases[i].parentElement.id)){
					myPad.stack = canvases[i].parentElement.id;
					canvases[i].style.position = 'absolute';
					}
				if(i === 0){
					my.currentPad = myPad.name;
					}
				}
			return true;
			}
		console.log('my.getCanvases() failed to find any <canvas> elements on the page');
		return false;
		};
/**
A __private__ function that searches the DOM for elements with class="scrawl stack:STACKNAME"; generates Element objects
@method getElements
@return True on success; false otherwise
@private
**/
	my.getElements = function(){
		var	s = document.getElementsByClassName("scrawl"),
			el = [],
			myName, 
			myStack;
		if(s.length > 0){
			for(var i=0, z=s.length; i<z; i++){
				el.push(s[i]);
				}
			for(var i=0, z=s.length; i<z; i++){
				myName = el.id || el.name || false;
				if(!my.contains(my.elementnames, myName)){
					if(el[i].className.indexOf('stack:') !== -1){
						myStack = el[i].className.match(/stack:(\w+)/);
						if(my.contains(my.stacknames, myStack[1])){
							my.stk[myStack[1]].appendChild(el[i]);
							my.newElement({
								domElement: el[i],
								stack: myStack[1],
								});
							}
						}
					}
				}
			return true;
			}
		console.log('my.getElements() failed to find any elements with class="scrawl" on the page');
		return false;
		};
/**
A __general__ function to add a visible &lt;canvas&gt; element to the web page, and create a Pad controller and Cell wrappers for it

The argument object should include the following attributes:

* __stackName__ (String) - STACKNAME of existing or new stack (optional)
* __parentElement__ - (String) CSS #id of parent element, or the DOM element itself; default: document.body
* any other legitimate Pad and/or Cell object attribute

(This function replaces the one defined in the core module)
@method addCanvasToPage
@param {Object} items Object containing new Cell's parameters
@return The new Pad object
@example
    <body>
		<div id="canvasholder"></div>
		<script src="js/scrawlCore-min.js"></script>
		<script>
			scrawl.addCanvasToPage({
				canvasName:	'mycanvas',
				parentElement: 'canvasholder',
				width: 400,
				height: 200,
				}).makeCurrent();
		</script>
    </body>

<a href="../../demo002.html">Live demo</a>
**/
	my.addCanvasToPage = function(items){
		items = (my.isa(items,'obj')) ? items : {};
		var	myStk = false,
			myParent, 
			myName, 
			myCanvas, 
			DOMCanvas, 
			myPad,
			stackParent;
		if(my.xt(items.stackName)){
			myStk = document.getElementById(items.stackName) || false;
			if(!myStk){
				if(!my.xt(items.parentElement)){
					stackParent = document.body;
					}
				else{
					stackParent = (my.isa(items.parentElement,'str')) ? document.getElementById(items.parentElement) : items.parentElement;
					}
				myStk = my.addStackToPage({
					stackName: items.stackName, 
					width: items.width, 
					height: items.height, 
					parentElement: stackParent,
					});
				}
			items.stack = myStk.name;
			}
		myParent = my.stk[(myStk.name || myStk.id)] || document.getElementById(items.parentElement) || document.body;
		myName = my.makeName({
			name: items.canvasName || items.name || false,
			type: 'Pad',
			target: 'padnames',
			});
		myCanvas = document.createElement('canvas');
		myCanvas.id = myName;
		myParent.appendChild(myCanvas);
		DOMCanvas = document.getElementById(myName)
		DOMCanvas.width = items.width;
		DOMCanvas.height = items.height;
		myPad = my.newPad({
			canvasElement: DOMCanvas,
			});
		if(my.xt(items.position) || myStk){
			items.position = items.position || 'absolute';
			}
		items.stack = (items.stackName) ? items.stackName : '';
		myPad.set(items);
		my.setDisplayOffsets();
		return myPad;
		};
/**
A __general__ function to generates a new Stack object, together with a new DOM &lt;div&gt; element to act as the stack

The argument object should include the following attributes:

* __stackName__ (String) - STACKNAME of existing or new stack (optional)
* __parentElement__ - (String) CSS #id of parent element, or the DOM element itself; default: document.body
* any other legitimate Stack object attribute
@method addStackToPage
@param {Object} items Object containing new Stack's parameters
@return New stack object
**/
	my.addStackToPage = function(items){
		if(my.isa(items.stackName,'str') && my.xt(items.parentElement)){
			var myElement,
				myStack;
			items.parentElement = (my.isa(items.parentElement,'str')) ? document.getElementById(items.parentElement) : items.parentElement;
			myElement = document.createElement('div');
			myElement.id = items.stackName;
			items.parentElement.appendChild(myElement);
			items['stackElement'] = document.getElementById(items.stackName);
			myStack = my.newStack(items);
			myStack.stack = (my.contains(my.stacknames, items.parentElement.id)) ? items.parentElement.id : '';
			return myStack;
			}
		return false;
		};
/**
A __general__ function to reset display offsets for all pads, stacks and elements

The argument is an optional String - permitted values include 'stack', 'pad', 'element'; default: 'all'

(This function replaces the one defined in the core module)
@method setDisplayOffsets
@param {String} [item] Command string detailing which element types are to be set
@return The Scrawl library object (scrawl)
@chainable
@example
	scrawl.setDisplayOffsets();
**/
	my.setDisplayOffsets = function(item){
		item = (my.xt(item)) ? item : 'all';
		if(item === 'stack' || item === 'all'){
			for(var i=0, z=my.stacknames.length; i<z; i++){
				my.stack[my.stacknames[i]].setDisplayOffsets();
				}
			}
		if(item === 'pad' || item === 'all'){
			for(var i=0, z=my.padnames.length; i<z; i++){
				my.pad[my.padnames[i]].setDisplayOffsets();
				}
			}
		if(item === 'element' || item === 'all'){
			for(var i=0, z=my.elementnames.length; i<z; i++){
				my.element[my.elementnames[i]].setDisplayOffsets();
				}
			}
		return true;
		};
/**
A __display__ function to move DOM elements within a Stack
@method renderElements
@return Always true
**/
	my.renderElements = function(){
		for(var i=0, z=my.stacknames.length; i<z; i++){
			my.stack[my.stacknames[i]].renderElement();
			}
		for(var i=0, z=my.padnames.length; i<z; i++){
			my.pad[my.padnames[i]].renderElement();
			}
		for(var i=0, z=my.elementnames.length; i<z; i++){
			my.element[my.elementnames[i]].renderElement();
			}
		return true;
		};
			
/**
A __display__ function to update DOM elements' 3d position/rotation

Argument can contain the following (optional) attributes:

* __quaternion__ - quaternion representing the rotation to be applied to the element
* __distance__ - distance of element from the rotation origin
* __action__ - elements to be rotated/positioned

Where the _action_ attribute can contain either an array of Scrawl objects to be operated upon, or one of the following Strings: '__all__' (default), '__stacks__', '__pads__', or '__elements__'

@method update3d
@param {Object} [items] Argument object containing key:value pairs
@return Always true
**/
	my.update3d = function(items){
		items = my.safeObject(items);
		var action = items.action || 'all';
		if(action === 'stacks' || action === 'all'){
			for(var i=0, z=my.stacknames.length; i<z; i++){
				my.stack[my.stacknames[i]].update3d(items);
				}
			}
		if(action === 'pads' || action === 'all'){
			for(var i=0, z=my.padnames.length; i<z; i++){
				my.pad[my.padnames[i]].update3d(items);
				}
			}
		if(action === 'elements' || action === 'all'){
			for(var i=0, z=my.elementnames.length; i<z; i++){
				my.element[my.elementnames[i]].update3d(items);
				}
			}
		if(my.isa(action, 'arr')){
			for(var i = 0, iz = action; i < iz; i++){
				if(my.contains(['Pad', 'Stack', 'Element'], action[i].type)){
					action[i].update3d(items);
					}
				}
			}
		return true;
		};
			
/**
The coordinate Vector representing the object's rotation/flip point

PageElement, and all Objects that prototype chain to PageElement, supports the following 'virtual' attributes for this attribute:

* __startX__ - (Mixed) the x coordinate of the object's rotation/flip point, in pixels, from the left side of the object's stack
* __startY__ - (Mixed) the y coordinate of the object's rotation/flip point, in pixels, from the top side of the object's stack

This attribute's attributes accepts absolute number values (in pixels), or string percentages where the percentage is relative to the container stack's width or height, or string literals which again refer to the containing stack's dimensions:

* _startX_ - 'left', 'right' or 'center'
* _startY_ - 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector
@property PageElement.start
@type Vector
**/		
	my.d.PageElement.start = {x:0,y:0,z:0};
/**
A change Vector which can be applied to the object's rotation/flip point

PageElement, and all Objects that prototype chain to PageElement, supports the following 'virtual' attributes for this attribute:

* __deltaX__ - (Number) a horizontal change value, in pixels
* __deltaY__ - (Number) a vertical change value, in pixels

@property PageElement.delta
@type Vector
**/		
	my.d.PageElement.delta = {x:0,y:0,z:0};
/**
A change Vector for translating elements away from their start coordinate

PageElement, and all Objects that prototype chain to PageElement, supports the following 'virtual' attributes for this attribute:

* __translateX__ - (Number) movement along the x axis, in pixels
* __translateY__ - (Number) movement along the y axis, in pixels
* __translateZ__ - (Number) movement along the z axis, in pixels

@property PageElement.translate
@type Vector
**/		
	my.d.PageElement.translate = {x:0,y:0,z:0};
/**
@property PageElement.deltaTranslate
@type Vector
**/		
	my.d.PageElement.deltaTranslate = {x:0,y:0,z:0};
/**
An Object (in fact, a Vector) containing offset instructions from the object's rotation/flip point, where drawing commences. 

PageElement, and all Objects that prototype chain to PageElement, supports the following 'virtual' attributes for this attribute:

* __handleX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __handleY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector

@property PageElement.handle
@type Object
**/		
	my.d.PageElement.handle = {x:'center',y:'center',z:0};
/**
The SPRITENAME or POINTNAME of a sprite or Point object to be used for setting this object's start point
@property PageElement.pivot
@type String
@default ''
**/		
	my.d.PageElement.pivot = '';
/**
The element's parent stack's STACKNAME
@property PageElement.stack
@type String
@default ''
**/		
	my.d.PageElement.stack = '';
/**
The SPRITENAME of a Shape sprite whose path is used to calculate this object's start point
@property PageElement.path
@type String
@default ''
**/		
	my.d.PageElement.path = '';
/**
A value between 0 and 1 to represent the distance along a Shape object's path, where 0 is the path start and 1 is the path end
@property PageElement.pathPlace
@type Number
@default 0
**/
	my.d.PageElement.pathPlace = 0;
/**
A change value which can be applied to the object's pathPlace attribute
@property PageElement.deltaPathPlace
@type Number
@default 0
**/
	my.d.PageElement.deltaPathPlace = 0;
/**
A flag to determine whether the object will calculate its position along a Shape path in a regular (true), or simple (false), manner
@property PageElement.pathSpeedConstant
@type Boolean
@default true
**/		
	my.d.PageElement.pathSpeedConstant = true;
/**
The rotation value (in degrees) of an object's current position along a Shape path
@property PageElement.pathRoll
@type Number
@default 0
**/		
	my.d.PageElement.pathRoll = 0;
/**
A flag to determine whether the object will calculate the rotation value of its current position along a Shape path
@property PageElement.addPathRoll
@type Boolean
@default false
**/		
	my.d.PageElement.addPathRoll = false;
/**
When true, element ignores horizontal placement data via pivot and path attributes
@property PageElement.lockX
@type Boolean
@default false
**/		
	my.d.PageElement.lockX = false;
/**
When true, element ignores vertical placement data via pivot and path attributes
@property PageElement.lockY
@type Boolean
@default false
**/		
	my.d.PageElement.lockY = false;
/**
Element rotation around its transform (start) coordinate
@property PageElement.rotation
@type Quaternion
@default Unit quaternion with no rotation
**/		
	my.d.PageElement.rotation = {n:1,v:{x:0,y:0,z:0}};
/**
Element's delta (change in) rotation around its transform (start) coordinate
@property PageElement.deltaRotation
@type Quaternion
@default Unit quaternion with no rotation
**/		
	my.d.PageElement.deltaRotation = {n:1,v:{x:0,y:0,z:0}};
/**
Element's rotation tolerance - all Quaternions need to be unit quaternions; this value represents the acceptable tolerance away from the norm
@property PageElement.rotationTolerance
@type Number
@default 0.001
**/		
	my.d.PageElement.rotationTolerance = 0.001;
/**
A flag to determine whether an element displays itself
@property PageElement.visibility
@type Boolean
@default true
**/		
	my.d.PageElement.visibility = true;
	my.mergeInto(my.d.Pad, my.d.PageElement);
/**
PageElement constructor hook function - modified by stacks module
@method stacksPageElementConstructor
@private
**/
	my.PageElement.prototype.stacksPageElementConstructor = function(items){
		var temp = my.safeObject(items.start);
		this.start = my.newVector({
			name: this.type+'.'+this.name+'.start',
			x: (my.xt(items.startX)) ? items.startX : ((my.xt(temp.x)) ? temp.x : 0),
			y: (my.xt(items.startY)) ? items.startY : ((my.xt(temp.y)) ? temp.y : 0),
			});
		this.work.start = my.newVector({name: this.type+'.'+this.name+'.work.start'});
		temp = my.safeObject(items.delta);
		this.delta = my.newVector({
			name: this.type+'.'+this.name+'.delta',
			x: (my.xt(items.deltaX)) ? items.deltaX : ((my.xt(temp.x)) ? temp.x : 0),
			y: (my.xt(items.deltaY)) ? items.deltaY : ((my.xt(temp.y)) ? temp.y : 0),
			});
		this.work.delta = my.newVector({name: this.type+'.'+this.name+'.work.delta'});
		temp = my.safeObject(items.handle);
		this.handle = my.newVector({
			name: this.type+'.'+this.name+'.handle',
			x: (my.xt(items.handleX)) ? items.handleX : ((my.xt(temp.x)) ? temp.x : 0),
			y: (my.xt(items.handleY)) ? items.handleY : ((my.xt(temp.y)) ? temp.y : 0),
			});
		this.work.handle = my.newVector({name: this.type+'.'+this.name+'.work.handle'});
		if(my.xto([items.handleX, items.handleY, items.handle])){
			this.setTransformOrigin();
			}
		temp = my.safeObject(items.translate);
		this.translate = my.newVector({
			name: this.type+'.'+this.name+'.translate',
			x: (my.xt(items.translateX)) ? items.translateX : ((my.xt(temp.x)) ? temp.x : 0),
			y: (my.xt(items.translateY)) ? items.translateY : ((my.xt(temp.y)) ? temp.y : 0),
			z: (my.xt(items.translateZ)) ? items.translateZ : ((my.xt(temp.y)) ? temp.y : 0),
			});
		this.work.translate = my.newVector({name: this.type+'.'+this.name+'.work.translate'});
		temp = my.safeObject(items.deltaTranslate);
		this.deltaTranslate = my.newVector({
			name: this.type+'.'+this.name+'.deltaTranslate',
			x: (my.xt(items.translateX)) ? items.deltaTranslateX : ((my.xt(temp.x)) ? temp.x : 0),
			y: (my.xt(items.translateY)) ? items.deltaTranslateY : ((my.xt(temp.y)) ? temp.y : 0),
			z: (my.xt(items.translateZ)) ? items.deltaTranslateZ : ((my.xt(temp.y)) ? temp.y : 0),
			});
		this.work.deltaTranslate = my.newVector({name: this.type+'.'+this.name+'.work.deltaTranslate'});
		this.pivot = items.pivot || my.d[this.type].pivot;
		this.path = items.path || my.d[this.type].path;
		this.pathRoll = items.pathRoll || my.d[this.type].pathRoll;
		this.addPathRoll = items.addPathRoll || my.d[this.type].addPathRoll;
		this.pathSpeedConstant = (my.isa(items.pathSpeedConstant,'bool')) ? items.pathSpeedConstant : my.d[this.type].pathSpeedConstant;
		this.pathPlace = items.pathPlace || my.d[this.type].pathPlace;
		this.deltaPathPlace = items.deltaPathPlace || my.d[this.type].deltaPathPlace;
		this.lockX = items.lockX || my.d[this.type].lockX;
		this.lockY = items.lockY || my.d[this.type].lockY;
		this.visibility = (my.isa(items.visibility, 'bool')) ? items.visibility : my.d[this.type].visibility;
		this.rotation = my.newQuaternion({name: this.type+'.'+this.name+'.rotation'}).setFromEuler({
			pitch: items.pitch || 0,
			yaw: items.yaw || 0,
			roll: items.roll || 0,
			});
		this.work.rotation = my.newQuaternion({name: this.type+'.'+this.name+'.work.rotation'});
		this.deltaRotation = my.newQuaternion({name: this.type+'.'+this.name+'.deltaRotation'}).setFromEuler({
			pitch: items.deltaPitch || 0,
			yaw: items.deltaYaw || 0,
			roll: items.deltaRoll || 0,
			});
		this.work.deltaRotation = my.newQuaternion({name: this.type+'.'+this.name+'.work.deltaRotation'});
		this.rotationTolerance = items.rotationTolerance || my.d[this.type].rotationTolerance;
		};
/**
Augments Base.get() to retrieve DOM element width and height values, and stack-related attributes

(The stack module replaces the core function rather than augmenting it via a hook function)

@method PageElement.get
@param {String} get Attribute key
@return Attribute value
**/
	my.PageElement.prototype.get = function(item){
		var el = this.getElement();
		if(my.contains(['width','height'], item)){
			switch(this.type){
				case 'Pad' :
					if('width' === item){
						return this.width || parseFloat(el.width) || my.d[this.type].width; 
						}
					if('height' === item){
						return this.height || parseFloat(el.height) || my.d[this.type].height; 
						}
				default :
					if('width' === item){
						return this.width || parseFloat(el.style.width) || parseFloat(el.clientWidth) || my.d[this.type].width; 
						}
					if('height' === item){
						return this.height || parseFloat(el.style.height) || parseFloat(el.clientHeight) || my.d[this.type].height; 
						}
				}
			}
		if(my.contains(['startX','startY','handleX','handleY','deltaX','deltaY','translateX','translateY','translateZ'], item)){
			switch(item){
				case 'startX' : return this.start.x; break;
				case 'startY' : return this.start.y; break;
				case 'handleX' : return this.handle.x; break;
				case 'handleY' : return this.handle.y; break;
				case 'deltaX' : return this.delta.x; break;
				case 'deltaY' : return this.delta.y; break;
				case 'translateX' : return this.translate.x; break;
				case 'translateY' : return this.translate.y; break;
				case 'translateZ' : return this.translate.z; break;
				}
			}
		
		if(my.xt(el.style[item])){
			return el.style[item];
			}
		if(item === 'position'){
			return el.style.position;
			}
		if(item === 'overflow'){
			return el.style.overflow;
			}
		if(item === 'backfaceVisibility'){
			return el.style.backfaceVisibility;
			}
		return my.Base.prototype.get.call(this, item);
		};
/**
Augments Base.set() to allow the setting of DOM element dimension values, and stack-related attributes

(The stack module replaces the core function rather than augmenting it via a hook function)

@method PageElement.set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.PageElement.prototype.set = function(items){
		var el = this.getElement(),
			temp;
		items = my.safeObject(items);
		my.Base.prototype.set.call(this, items);
		if(!this.start.type || this.start.type !== 'Vector'){
			this.start = my.newVector(items.start || this.start);
			}
		if(my.xto([items.startX, items.startY])){
			this.start.x = (my.xt(items.startX)) ? items.startX : this.start.x;
			this.start.y = (my.xt(items.startY)) ? items.startY : this.start.y;
			}
		if(!this.delta.type || this.delta.type !== 'Vector'){
			this.delta = my.newVector(items.delta || this.delta);
			}
		if(my.xto([items.deltaX, items.deltaY])){
			this.delta.x = (my.xt(items.deltaX)) ? items.deltaX : this.delta.x;
			this.delta.y = (my.xt(items.deltaY)) ? items.deltaY : this.delta.y;
			}
		if(!this.translate.type || this.translate.type !== 'Vector'){
			this.translate = my.newVector(items.translate || this.translate);
			}
		if(my.xto([items.translateX, items.translateY, items.translateZ])){
			this.translate.x = (my.xt(items.translateX)) ? items.translateX : this.translate.x;
			this.translate.y = (my.xt(items.translateY)) ? items.translateY : this.translate.y;
			this.translate.z = (my.xt(items.translateZ)) ? items.translateZ : this.translate.z;
			}
		if(!this.deltaTranslate.type || this.deltaTranslate.type !== 'Vector'){
			this.deltaTranslate = my.newVector(items.deltaTranslate || this.deltaTranslate);
			}
		if(my.xto([items.deltaTranslateX, items.deltaTranslateY, items.deltaTranslateZ])){
			this.deltaTranslate.x = (my.xt(items.deltaTranslateX)) ? items.deltaTranslateX : this.deltaTranslate.x;
			this.deltaTranslate.y = (my.xt(items.deltaTranslateY)) ? items.deltaTranslateY : this.deltaTranslate.y;
			this.deltaTranslate.z = (my.xt(items.deltaTranslateZ)) ? items.deltaTranslateZ : this.deltaTranslate.z;
			}
		if(!this.handle.type || this.handle.type !== 'Vector'){
			this.handle = my.newVector(items.handle || this.handle);
			}
		if(my.xto([items.handleX, items.handleY])){
			this.handle.x = (my.xt(items.handleX)) ? items.handleX : this.handle.x;
			this.handle.y = (my.xt(items.handleY)) ? items.handleY : this.handle.y;
			}
		if(my.xto([items.pitch, items.yaw, items.roll])){
			this.rotation.setFromEuler({
				pitch: items.pitch || 0,
				yaw: items.yaw || 0,
				roll: items.roll || 0,
				});
			}
		if(my.xto([items.deltaPitch, items.deltaYaw, items.deltaRoll])){
			this.deltaRotation.setFromEuler({
				pitch: items.deltaPitch || 0,
				yaw: items.deltaYaw || 0,
				roll: items.deltaRoll || 0,
				});
			}
		if(my.xto([items.width, items.height, items.scale])){
			this.setDimensions();
			}
		if(my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale])){
			delete this.offset;
			}
		if(my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start])){
			this.setDisplayOffsets();
			}
		if(my.xto([items.handleX, items.handleY, items.handle])){
			this.setTransformOrigin();
			}
		if(my.xt(items.position)){
			this.position = items.position;
			}
		if(my.xt(items.mouse)){
			this.initMouse({mouse: items.mouse});
			}
		if(my.xt(items.pivot)){
			this.pivot = items.pivot;
			if(!this.pivot){
				delete this.oldX;
				delete this.oldY;
				}
			}
		if(my.xto([items.title, items.comment])){
			this.setAccessibility(items);
			}
		this.setStyles(items);
		return this;
		};
/**
Handles the setting of position, transformOrigin, backfaceVisibility, margin, border, padding
@method PageElement.setStyles
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.PageElement.prototype.setStyles = function(items){
		items = (my.xt(items)) ? items : {};
		var el = this.getElement(),
			k = Object.keys(items);
		for(var i=0, iz=k.length; i<iz; i++){
			if(my.contains(['width', 'height', 'translate', 'translateX', 'translateY', 'translateZ'], k[i])){}
			else if(k[i] === 'backfaceVisibility'){
				el.style.webkitBackfaceVisibility = items.backfaceVisibility;
				el.style.mozBackfaceVisibility = items.backfaceVisibility;
				el.style.backfaceVisibility = items.backfaceVisibility;
				}
			else if(k[i] === 'visibility'){
				if(my.isa(items.visibility, 'str')){
					this.visibility = (!my.contains(['hidden', 'none'], items.visibility)) ? true : false;
					}
				else{
					this.visibility = (items.visibility) ? true : false;
					}
				if(this.stack){
					el.style.opacity = (this.visibility) ? 1 : 0;
					}
				else{
					el.style.display = (this.visibility) ? 'block' : 'none';
					}
				}
			else {
				if(my.xt(el.style[k[i]])){
					el.style[k[i]] = items[k[i]];
					}
				}
			}
		return this;
		};
/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function
@method PageElement.setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.PageElement.prototype.setDelta = function(items){
		var temp;
		my.Position.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		if(my.xto([items.translate, items.translateX, items.translateY])){
			temp = (my.isa(items.translate,'obj')) ? items.translate : {};
			this.translate.x += (my.xt(items.translateX)) ? items.translateX : ((my.xt(temp.x)) ? temp.x : 0);
			this.translate.y += (my.xt(items.translateY)) ? items.translateY : ((my.xt(temp.y)) ? temp.y : 0);
			this.translate.z += (my.xt(items.translateZ)) ? items.translateZ : ((my.xt(temp.z)) ? temp.z : 0);
			}
		if(my.xto([items.deltaTranslate, items.deltaTranslateX, items.deltaTranslateY])){
			temp = (my.isa(items.deltaTranslate,'obj')) ? items.deltaTranslate : {};
			this.deltaTranslate.x += (my.xt(items.deltaTranslateX)) ? items.deltaTranslateX : ((my.xt(temp.x)) ? temp.x : 0);
			this.deltaTranslate.y += (my.xt(items.deltaTranslateY)) ? items.deltaTranslateY : ((my.xt(temp.y)) ? temp.y : 0);
			this.deltaTranslate.z += (my.xt(items.deltaTranslateZ)) ? items.deltaTranslateZ : ((my.xt(temp.z)) ? temp.z : 0);
			}
		if(my.xto([items.pitch, items.yaw, items.roll])){
			temp = my.workquat.q1.setFromEuler({
				pitch: items.pitch || 0,
				yaw: items.yaw || 0,
				roll: items.roll || 0,
				});
			this.rotation.quaternionMultiply(temp);
			}
		if(my.xto([items.deltaPitch, items.deltaYaw, items.deltaRoll])){
			temp = my.workquat.q1.setFromEuler({
				pitch: items.deltaPitch || 0,
				yaw: items.deltaYaw || 0,
				roll: items.deltaRoll || 0,
				});
			this.deltaRotation.quaternionMultiply(temp);
			}
		if(my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale])){
			delete this.offset;
			}
		if(my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start])){
			this.setDisplayOffsets();
			}
		if(my.xto([items.handleX, items.handleY, items.handle])){
			this.setTransformOrigin();
			}
		if(my.xto([items.width, items.height, items.scale])){
			this.setDimensions();
			}
		return this;
		};
/**
Adds delta values to the start vector; adds deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x added to start.x
* 'y' - delta.y added to start.y
* 'path' - deltaPathPlace added to pathPlace 
* undefined: all values are amended
@method PageElement.updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	my.PageElement.prototype.updateStart = function(item){
		switch(item){
			case 'x' :
				if(my.isa(this.start.x,'num')){this.start.x += this.delta.x || 0};
				break;
			case 'y' :
				if(my.isa(this.start.y,'num')){this.start.y += this.delta.y || 0;}
				break;
			case 'path' :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				break;
			default :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				if(my.isa(this.start.x,'num') && my.isa(this.start.y,'num')){this.start.vectorAdd(this.delta);}
			}
		this.setDisplayOffsets();
		return this;
		};
/**
Subtracts delta values from the start vector; subtracts deltaPathPlace from pathPlace

Permitted argument values include 
* 'x' - delta.x subtracted from start.x
* 'y' - delta.y subtracted from start.y
* 'path' - deltaPathPlace subtracted from pathPlace 
* undefined: all values are amended
@method PageElement.revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	my.PageElement.prototype.revertStart = function(item){
		switch(item){
			case 'x' :
				this.start.x -= this.delta.x || 0;
				break;
			case 'y' :
				this.start.y -= this.delta.y || 0;
				break;
			case 'path' :
				this.pathPlace -= this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				break;
			default :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				this.start.vectorSubtract(this.delta);
			}
		this.setDisplayOffsets();
		return this;
		};
/**
Rotate and translate a DOM element around a quaternion rotation

* Element's initial rotation values should be stored in the deltaRotation attribute quaternion
* Element's initial translation values should be stored in the deltaTranslate attribute vector

Argument can contain the following (optional) attributes:

* __quaternion__ - quaternion representing the rotation to be applied to the element
* __distance__ - distance of element from the rotation origin

@method PageElement.update3d
@param {Object} [items] - Distance between the effective rotation point and the DOM element's start attribute - default: deltaTranslate vector's magnitude
@return This
@chainable
**/
	my.PageElement.prototype.update3d = function(items){
		items = my.safeObject(items);
		if(my.isa(items.quaternion, 'quaternion')){
			this.rotation.set(this.deltaRotation);				//deltaRotation represents the initial, world rotation of the element
			this.rotation.quaternionRotate(items.quaternion);	//quaternion is the local amount we want to rotate the element by
			this.translate.zero();
			this.translate.vectorAdd(this.deltaTranslate);
			this.translate.rotate3d(items.quaternion, items.distance);
			}
		else{
			//opposite to above; rotation is the world rotation, deltaRotation the local rotation to be applied
			this.rotation.quaternionRotate(this.deltaRotation);
			this.translate.vectorAdd(this.deltaTranslate);
			}
		return this;
		};
/**
Changes the sign (+/-) of specified attribute values
@method PageElement.reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
	my.PageElement.prototype.reverse = function(item){
		switch(item){
			case 'deltaX' : 
				this.delta.x = -this.delta.x; break;
			case 'deltaY' : 
				this.delta.y = -this.delta.y; break;
			case 'delta' : 
				this.delta.reverse(); break;
			case 'deltaPathPlace' : 
				this.deltaPathPlace = -this.deltaPathPlace; break;
			default : 
				this.deltaPathPlace = -this.deltaPathPlace;
				this.delta.reverse();
			}
		return this;
		};
/**
Calculates the pixels value of the object's handle attribute

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method PageElement.getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	my.PageElement.prototype.getPivotOffsetVector = function(){
		return my.Position.prototype.getPivotOffsetVector.call(this);
		};
/**
Calculates the pixels value of the object's start attribute

* doesn't take into account the object's scaling or orientation

@method PageElement.getStartValues
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return A Vector of calculated values to help determine where sprite drawing should start
@private
**/
	my.PageElement.prototype.getStartValues = function(hasElementPivot){
		hasElementPivot = (my.xt(hasElementPivot)) ? hasElementPivot : false;
		var result,
			height,
			width;
		if(hasElementPivot){
			result = my.v.set(my.element[this.pivot].start),
			height = my.element[this.pivot].get(height);
			width = my.element[this.pivot].get(width);
			}
		else{
			result = my.v.set(this.start),
			height = (this.stack) ? my.stack[this.stack].get('height') : this.height || this.get('height');
			width = (this.stack) ? my.stack[this.stack].get('width') : this.width || this.get('width');
			}
		return my.Position.prototype.calculatePOV.call(this, result, width, height, false);
		};
/**
Calculates the pixels value of the object's handle attribute
@method PageElement.getOffsetStartVector
@return Final offset values (as a Vector) to determine where sprite drawing should start
**/
	my.PageElement.prototype.getOffsetStartVector = function(){
		return my.Position.prototype.getOffsetStartVector.call(this);
		};
/**
Reposition an element within its stack by changing 'left' and 'top' style attributes; rotate it using matrix3d transform
@method PageElement.renderElement
@return This left
@chainable
**/
	my.PageElement.prototype.renderElement = function(){
		var el = this.getElement(),
			temp = '',
			m = [];
		if(!my.xt(this.offset)){
			this.offset = this.getOffsetStartVector();
			}
		if(this.path){
			this.setStampUsingPath();
			}
		else if(this.pivot){
			this.setStampUsingPivot();
			}
		this.updateStart();
		
		if(this.rotation.getMagnitude() !== 1){
			this.rotation.normalize();
			}
		
		m.push(Math.round(this.translate.x * this.scale));
		m.push(Math.round(this.translate.y * this.scale));
		m.push(Math.round(this.translate.z * this.scale));
		m.push(this.rotation.v.x);
		m.push(this.rotation.v.y);
		m.push(this.rotation.v.z);
		m.push(this.rotation.getAngle(false));

		for(var i = 0, z = m.length; i < z; i++){
			if(my.isBetween(m[i], 0.000001,-0.000001)){
				m[i] = 0;
				}
			}
		temp += 'translate3d('+m[0]+'px,'+m[1]+'px,'+m[2]+'px) rotate3d('+m[3]+','+m[4]+','+m[5]+','+m[6]+'rad)';
			
		el.style.webkitTransform = temp;
		el.style.transform = temp;
		
		el.style.zIndex = m[2];

		temp = this.getStartValues(); 
		
		el.style.left = ((temp.x * this.scale) + this.offset.x)+'px';
		el.style.top = ((temp.y * this.scale) + this.offset.y)+'px';
		return this;
		};
/**
Calculate start Vector in reference to a Shape sprite object's path
@method PageElement.setStampUsingPath
@return This
@chainable
@private
**/
	my.PageElement.prototype.setStampUsingPath = function(){
		var here,
			angles;
		if(my.contains(my.spritenames, this.path) && my.sprite[this.path].type === 'Path'){
			here = my.sprite[this.path].getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, this.addPathRoll);
			this.start.x = (!this.lockX) ? here.x : this.start.x;
			this.start.y = (!this.lockY) ? here.y : this.start.y;
			this.pathRoll = here.r || 0;
			if(this.addPathRoll && this.pathRoll){
				angles = this.rotation.getEulerAngles();
				this.setDelta({
					roll: this.pathRoll - angles.roll,
					});
				}
			}
		return this;
		};
/**
Calculate start Vector in reference to a sprite or Point object's position
@method PageElement.setStampUsingPivot
@return This
@chainable
@private
**/
	my.PageElement.prototype.setStampUsingPivot = function(){
		var	here,
			myCell,
			myP,
			myPVector,
			pSprite,
			temp;
		if(my.contains(my.pointnames, this.pivot)){
			myP = my.point[this.pivot];
			pSprite = my.sprite[myP.sprite];
			myPVector = myP.getCurrentCoordinates().rotate(pSprite.roll).vectorAdd(pSprite.getStartValues());
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(my.contains(my.spritenames, this.pivot)){
			myP = my.sprite[this.pivot];
			myPVector = (myP.type === 'Particle') ? myP.get('place') : myP.get('start');
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(my.contains(my.padnames, this.pivot)){
			myP = my.pad[this.pivot];
			myPVector = myP.getStartValues();
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(my.contains(my.elementnames, this.pivot)){
			myP = my.element[this.pivot];
			myPVector = myP.getStartValues();
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(this.pivot === 'mouse'){
			if(this.stack){
				here = my.stack[this.stack].getMouse();
				temp = this.getStartValues(); 
				if(!my.xta([this.mouseX,this.mouseY])){
					this.oldX = temp.x;
					this.oldY = temp.y;
					}
				if(here.active){
					this.start.x = (!this.lockX) ? temp.x + here.x - this.oldX : this.start.x;
					this.start.y = (!this.lockY) ? temp.y + here.y - this.oldY : this.start.y;
					this.oldX = here.x;
					this.oldY = here.y;
					}
				}
			}
		return this;
		};
/**
Set the transform origin style attribute
@method PageElement.setTransformOrigin
@return This
@chainable
**/
	my.PageElement.prototype.setTransformOrigin = function(){
		var el = this.getElement(),
			x = (my.isa(this.handle.x,'str')) ? this.handle.x : (this.handle.x * this.scale)+'px',
			y = (my.isa(this.handle.y,'str')) ? this.handle.y : (this.handle.y * this.scale)+'px',
			t = x+' '+y;
		el.style.mozTransformOrigin = t;
		el.style.webkitTransformOrigin = t;
		el.style.msTransformOrigin = t;
		el.style.oTransformOrigin = t;
		el.style.transformOrigin = t;
		return this;
		};
/**
Calculate the element's display offset values
@method PageElement.setDisplayOffsets
@return This
@chainable
**/
	my.PageElement.prototype.setDisplayOffsets = function(){
		var dox = 0,
			doy = 0,
			myDisplay = this.getElement();
		if(myDisplay.offsetParent){
			do{
				dox += myDisplay.offsetLeft;
				doy += myDisplay.offsetTop;
				} while (myDisplay = myDisplay.offsetParent);
			}
		this.offset = this.getOffsetStartVector();
		this.displayOffsetX = dox;
		this.displayOffsetY = doy;
		return this;
		};
/**
A __factory__ function to generate new Stack objects
@method newStack
@param {Object} items Key:value Object argument for setting attributes
@return Stack object
@private
**/
	my.newStack = function(items){
		return new my.Stack(items);
		};
/**
A __factory__ function to generate new Element objects
@method newElement
@param {Object} items Key:value Object argument for setting attributes
@return Element object
@private
**/
	my.newElement = function(items){
		return new my.Element(items);
		};

	my.pushUnique(my.sectionlist, 'stack');
	my.pushUnique(my.sectionlist, 'stk');
	my.pushUnique(my.nameslist, 'stacknames');
/**
# Stack
	
## Instantiation

* scrawl.addStackToPage()

## Purpose

* add/manipulate perspective data to a DOM element

## Access

* scrawl.stack.STACKNAME - for the Stack object
* scrawl.stk.STACKNAME - for a handle to the DOM stack element

@class Stack
@constructor
@extends PageElement
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Stack = function(items){
		items = my.safeObject(items);
		if(my.xt(items.stackElement)){
			var tempname = '',
				temp;
			if(my.xto([items.stackElement.id, items.stackElement.name])){
				tempname = items.stackElement.id || items.stackElement.name;
				}
			my.PageElement.call(this, {name: tempname,});
			my.stack[this.name] = this;
			my.stk[this.name] = items.stackElement;
			my.pushUnique(my.stacknames, this.name);
			my.stk[this.name].id = this.name;
			my.stk[this.name].style.position = 'relative';
			this.setDisplayOffsets();
			temp = (my.isa(items.perspective,'obj')) ? items.perspective : {};
			this.perspective = my.newVector({
				x: (my.xt(items.perspectiveX)) ? items.perspectiveX : ((my.xt(temp.x)) ? temp.x : 'center'),
				y: (my.xt(items.perspectiveY)) ? items.perspectiveY : ((my.xt(temp.y)) ? temp.y : 'center'),
				z: (my.xt(items.perspectiveZ)) ? items.perspectiveZ : ((my.xt(temp.z)) ? temp.z : 0),
				});
			this.work.perspective = my.newVector({name: this.type+'.'+this.name+'.work.perspective'});
			this.width = items.width || this.get('width');
			this.height = items.height || this.get('height');
			this.scaleText = (my.isa(items.scaleText, 'bool')) ? items.scaleText : false;
			this.setDimensions()
			this.setPerspective();
			this.setStyles(items);
			if(my.xto([items.title, items.comment])){
				this.setAccessibility(items);
				}
			items.mouse = (my.isa(items.mouse, 'bool') || my.isa(items.mouse, 'vector')) ? items.mouse : true;
			this.initMouse(items);
			return this;
			}
		console.log('Failed to generate a Stack wrapper - no DOM element supplied'); 
		return false;
		}
	my.Stack.prototype = Object.create(my.PageElement.prototype);
/**
@property type
@type String
@default 'Stack'
@final
**/
	my.Stack.prototype.type = 'Stack';
	my.Stack.prototype.classname = 'stacknames';
	my.d.Stack = {
/**
An Object (in fact, a Vector) containing perspective details for the stack element. 

the Stack constructor, and set() function, supports the following 'virtual' attributes for this attribute:

* __perspectiveX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __perspectiveY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'
* __perspectiveZ__ - (Number) perspective depth, in pixels
@property perspective
@type Object
**/		
		perspective: {x:'center',y:'center',z:0},
/**
A flag to indicate whether element text should be scaled at the same time as the stack. Default; false (do not scale text)

@property scaleText
@type Boolean
@default false
**/		
		scaleText: false,
		};
	my.mergeInto(my.d.Stack, my.d.PageElement);
/**
Return the DOM element wrapped by this object
@method getElement
@return Element
**/
	my.Stack.prototype.getElement = function(){
		return my.stk[this.name];
		};
/**
Augments PageElement.set(), to allow users to set the stack perspective using perspectiveX, perspectiveY, perspectiveZ
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Stack.prototype.set = function(items){
		items = (my.xt(items)) ? items : {};
		my.PageElement.prototype.set.call(this, items);
		if(my.xto([items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ])){
			if(!my.isa(this.perspective, 'Vector')){
				this.perspective = my.newVector(items.perspective || this.perspective);
				}
			this.perspective.x = (my.xt(items.perspectiveX)) ? items.perspectiveX : this.perspective.x;
			this.perspective.y = (my.xt(items.perspectiveY)) ? items.perspectiveY : this.perspective.y;
			this.perspective.z = (my.xt(items.perspectiveZ)) ? items.perspectiveZ : this.perspective.z;
			this.setPerspective();
			}
		if(my.xt(items.scale)){
			this.scaleStack(items.scale);
			}
		return this;
		};
/**
Import elements into the stack DOM object, and create element object wrappers for them
@method addElementById
@param {String} DOM element id String
@return Element wrapper object on success; false otherwise
**/
	my.Stack.prototype.addElementById = function(item){
		if(my.isa(item, 'str')){
			var myElement = my.newElement({
				domElement: document.getElementById(item),
				stack: this.name,
				});
			my.stk[this.name].appendChild(my.elm[myElement.name]);
			my.elm[myElement.name] = document.getElementById(myElement.name);
			return myElement;
			}
		return false;
		};
/**
Import elements into the stack DOM object, and create element object wrappers for them
@method addElementsByClassName
@param {String} DOM element class String
@return Array of element wrapper objects on success; false otherwise
**/
	my.Stack.prototype.addElementsByClassName = function(item){
		if(my.isa(item, 'str')){
			var myElements = [];
			var myArray = document.getElementsByClassName(item);
			var myElement, myElm, thisElement;
			for(var i=0, z=myArray.length; i<z; i++){
				thisElement = myArray[i]
				if(thisElement.nodeName !== 'CANVAS'){
					myElement = my.newElement({
						domElement: thisElement,
						stack: this.name,
						});
					myElements.push(myElement);
					}
				}
			for(var i=0, z=myElements.length; i<z; i++){
				my.stk[this.name].appendChild(my.elm[myElements[i].name]);
				my.elm[myElements[i].name] = document.getElementById(myElements[i].name);
				}
			return myElements;
			}
		return false;
		};
/**
Move DOM elements within a Stack
@method renderElements
@return Always true
**/
	my.Stack.prototype.renderElements = function(){
		var temp;
		for(var i=0, z=my.stacknames.length; i<z; i++){
			temp = my.stack[my.stacknames[i]];
			if(temp.stack === this.name){
				temp.renderElement();
				}
			}
		for(var i=0, z=my.padnames.length; i<z; i++){
			temp = my.pad[my.padnames[i]];
			if(temp.stack === this.name){
				temp.renderElement();
				}
			}
		for(var i=0, z=my.elementnames.length; i<z; i++){
			temp = my.element[my.elementnames[i]];
			if(temp.stack === this.name){
				temp.renderElement();
				}
			}
		return true;
		};
/**
Parse the perspective Vector attribute
@method parsePerspective
@return Object containing offset values (in pixels)
@private
**/
	my.Stack.prototype.parsePerspective = function(){
		var result = this.work.perspective,
			height = this.height || this.get('height'),
			width = this.width || this.get('width');
		return my.Position.prototype.calculatePOV.call(this, result, width, height, false);
		};
/**
Calculates the pixels value of the object's perspective attribute
@method setPerspective
@return Set the Stack element's perspective point
**/
	my.Stack.prototype.setPerspective = function(){
		this.resetWork();
		var sx = (my.isa(this.perspective.x,'str')) ? this.scale : 1,
			sy = (my.isa(this.perspective.y,'str')) ? this.scale : 1,
			myH = this.parsePerspective(),
			el = this.getElement();
		myH.x *= sx;
		myH.y *= sy;
		myH.z *= sx;
		el.style.mozPerspectiveOrigin = myH.x+'px '+myH.y+'px';
		el.style.webkitPerspectiveOrigin = myH.x+'px '+myH.y+'px';
		el.style.perspectiveOrigin = myH.x+'px '+myH.y+'px';
		el.style.mozPerspective = myH.z+'px';
		el.style.webkitPerspective = myH.z+'px';
		el.style.perspective = myH.z+'px';
		};
/**
Scale the stack, and all objects contained in stack

An item value of 1 will scale the stack to its preset size. Values less than 1 will shrink the stack; values greater than 1 will enlarge it.

By default, this function does not scale text contained in any stack element. If the scaleFont boolean is is passed as true, then the function will set the stack's font-size style attribute to (item * 100)%. Element font sizes will not scale unless they have been initially set to relative unit values.

@method scaleStack
@param {Number} item - Scale value
@param {Boolean} scaleFont - if set to true, will also scale element font sizes; default: false
@return This
@chainable
**/
	my.Stack.prototype.scaleStack = function(item, scaleFont){
		scaleFont = (my.xt(scaleFont)) ? scaleFont : this.scaleText;
		if(my.isa(item,'num') && this.type === 'Stack'){
			for(var i=0, z=my.stacknames.length; i<z; i++){
				if(my.stack[my.stacknames[i]].stack === this.name){
					my.stack[my.stacknames[i]].scaleStack(item);
					}
				}
			for(var i=0, z=my.elementnames.length; i<z; i++){
				if(my.element[my.elementnames[i]].stack === this.name){
					my.element[my.elementnames[i]].scaleDimensions(item);
					}
				}
			for(var i=0, z=my.padnames.length; i<z; i++){
				if(my.pad[my.padnames[i]].stack === this.name){
					my.pad[my.padnames[i]].scaleDimensions(item);
					}
				}
			this.scaleDimensions(item);
			if(this.type === 'Stack'){
				this.setPerspective();
				if(scaleFont){
					my.stk[this.name].style.fontSize = (item * 100)+'%';
					}
				}
			}
		return this;
		};

	my.pushUnique(my.sectionlist, 'element');
	my.pushUnique(my.sectionlist, 'elm');
	my.pushUnique(my.nameslist, 'elementnames');
/**
# Element
	
## Instantiation

* Stack.addElementById()
* Stack.addElementsByClassNames()

## Purpose

* provide a wrapper object for a DOM element

## Access

* scrawl.element.ELEMENTNAME - for the Element object
* scrawl.elm.ELEMENTNAME - for a handle to the DOM element

@class Element
@constructor
@extends PageElement
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Element = function(items){
		items = (my.isa(items,'obj')) ? items : {};
//		my.PageElement.call(this, items);
		if(my.xt(items.domElement)){
			var tempname = '';
			if(my.xto([items.domElement.id,items.domElement.name])){
				tempname = items.domElement.id || items.domElement.name;
				}
			my.PageElement.call(this, {name: tempname,});
			my.element[this.name] = this;
			my.elm[this.name] = items.domElement;
			my.pushUnique(my.elementnames, this.name);
			my.elm[this.name].id = this.name;
			my.elm[this.name].style.position = 'absolute';
			my.elm[this.name].style.visibility = 'visible';
			this.stack = items.stack || '';
			this.width = items.width || this.get('width');
			this.height = items.height || this.get('height');
			this.setDimensions()
			this.setDisplayOffsets();
			this.setStyles(items);
			if(my.xto([items.title, items.comment])){
				this.setAccessibility(items);
				}
			items.mouse = (my.isa(items.mouse, 'bool') || my.isa(items.mouse, 'vector')) ? items.mouse : false;
			this.initMouse(items);
			return this;
			}
		console.log('Failed to generate an Element wrapper - no DOM element supplied'); 
		return false;
		}
	my.Element.prototype = Object.create(my.PageElement.prototype);
/**
@property type
@type String
@default 'Element'
@final
**/
	my.Element.prototype.type = 'Element';
	my.Element.prototype.classname = 'elementnames';
	my.d.Element = {
		};
	my.mergeInto(my.d.Element, my.d.PageElement);
/**
Return the DOM element wrapped by this object
@method getElement
@return Element
**/
	my.Element.prototype.getElement = function(){
		return my.elm[this.name];
		};
		
	return my;
	}(scrawl));