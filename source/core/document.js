/*
# Core DOM element discovery and management, and the Scrawl-canvas display cycle

Scrawl-canvas breaks down the display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.

The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value
*/

import { isa_canvas, generateUuid, isa_fn, isa_dom, pushUnique, removeItem, xt, defaultNonReturnFunction } from "./utilities.js";
import { artefact, canvas, group, stack, css, xcss } from "./library.js";

import { makeStack } from "../factory/stack.js";
import { makeElement } from "../factory/element.js";
import { makeCanvas } from "../factory/canvas.js";

import { makeAnimation } from "../factory/animation.js";


/*
## Core DOM element discovery and management
*/
let rootElements = [],
	rootElements_sorted = [];

let rootElementsSort = true,
	setRootElementsSort = () => {rootElementsSort = true};

const sortRootElements = function () {

	let floor = Math.floor;

	if (rootElementsSort) {

		rootElementsSort = false;

		let buckets = [];

		rootElements.forEach((item) => {

			let art = artefact[item],
				order = (art) ? floor(art.order) : 0;

			if (!buckets[order]) buckets[order] = [];
			
			buckets[order].push(art.name);
		});

		rootElements_sorted = buckets.reduce((a, v) => a.concat(v), []);
	}
};

/*

*/
const addInitialStackElement = function (el) {

	let mygroup = el.getAttribute('data-group'),
		myname = el.id || el.getAttribute('name'),
		position = 'absolute';

	if (!mygroup) {

		el.setAttribute('data-group', 'root');
		mygroup = 'root';
		position = 'relative';
	}

	if (!myname) {

		myname = generateUuid();
		el.id = myname;
	}

	let mystack = makeStack({
		name: myname,
		domElement: el,
		group: mygroup,
		host: mygroup,
		position: position,
		setInitialDimensions: true
	});

	processNewStackChildren(el, myname);

	return mystack;
};

/*

*/
const processNewStackChildren = function (el, name) {

	let hostDims = el.getBoundingClientRect(),
		y = 0;

	// only go down one level of hierarchy here; stacks don't do hierarchies, only interested in knowing about immediate child elements
	Array.from(el.children).forEach(child => {
	
		if (child.getAttribute('data-stack') == null && !isa_canvas(child)) {

			let dims = child.getBoundingClientRect(),
				computed = window.getComputedStyle(child);

			let yHeight = parseFloat(computed.marginTop) + parseFloat(computed.borderTopWidth) + parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom) + parseFloat(computed.borderBottomWidth) + parseFloat(computed.marginBottom);

			y = (!y) ? dims.top - hostDims.top : y;

			let args = {
				name: child.id || child.getAttribute('name'),
				domElement: child,
				group: name,
				host: name,
				position: 'absolute',
				width: dims.width,
				height: dims.height,
				startX: dims.left - hostDims.left,
				startY: y,
				classes: (child.className) ? child.className : '',
			};

			y += yHeight + dims.height;

			makeElement(args);
		}

		// no need to worry about processing child stacks - they'll already be in the list of stacks to be processed
		else child.setAttribute('data-group', name);
	});
};

/*
create __canvas__ wrappers and controllers for a given canvas element.
*/
const addInitialCanvasElement = function (el) {

	let mygroup = el.getAttribute('data-group'),
		myname = el.id || el.getAttribute('name'),
		position = 'absolute';

	if (!mygroup) {

		el.setAttribute('data-group', 'root');
		mygroup = 'root';
		position = el.style.position;
	}

	if (!myname) {

		myname = generateUuid();
		el.id = myname;
	}

	// console.log('addInitialCanvasElement called on', el)
	// let mygroup = el.getAttribute('data-group');

	return makeCanvas({
		name: myname,
		domElement: el,
		group: mygroup,
		host: mygroup,
		position: position,
		setInitialDimensions: true
	});
};

/*

*/
const getStacks = function () {
		
	document.querySelectorAll('[data-stack]').forEach(el => addInitialStackElement(el));
};

/*
Parse the DOM, looking for &lt;canvas> elements; then create __cell__ wrappers and __pad__ controllers for each canvas found. Canvas elements do not need to be part of a stack and can appear anywhere in the HTML body.
*/ 
const getCanvases = function () {

	document.querySelectorAll('canvas').forEach((el, index) => {

		let item = addInitialCanvasElement(el);

		if (!index) setCurrentCanvas(item);
	});
};

/*
Programmatically add Scrawl-canvas stack and canvas elements to the DOM document

TODO - add a canvas element to the DOM document programmatically
*/
const addCanvas = function (items = {}) {

	// will need to automatically set the new canvas as the currentCanvas and currentGroup
	// to maintain previous functionality
	return true;
};

/*
Scrawl-canvas expects one canvas element (if any canvases are present) to act as the 'current' canvas on which other factory functions - such as adding new entitys - can act. The current canvas can be changed at any time using __scrawl.setCurrentCanvas__
*/
let currentCanvas = null,
	currentGroup = null;

const setCurrentCanvas = function (item) {

	let changeFlag = false;

	if (item) {

		if (item.substring) {

			let mycanvas = canvas[item];

			if (mycanvas) {
				currentCanvas = mycanvas;
				changeFlag = true;	
			}
		}
		else if (item.type === 'Canvas') {

			currentCanvas = item;	
			changeFlag = true;	
		} 
	}

	if (changeFlag && currentCanvas.base) {

		let mygroup = group[currentCanvas.base.name];

		if (mygroup) currentGroup = mygroup;
	}
};

/*
Use __addStack__ to add a Scrawl-canvas stack element to a web page, or transform an existing element into a stack element
items object should include 

* __element__ - the DOM element to be the stack - if not present, will autogenerate a div element
* __host__ - the host element, either as the DOM element itself, or some sort of CSS search string; if not present, will create the stack at the stack element's current place or, failing all else, add the stack to the end of the document body
* __name__ - String identifier for the stack; if not included the function will attempt to use the element's existing id or name attribute or, failing that, generate a random name for the stack.
* any other regular stack attribute
*/
const addStack = function (items = {}) {

	// define variables
	let el, host, hostinscrawl, mystack, mygroup, name,
		position = 'absolute',
		newElement = false;

	// get, or generate a new, stack-to-be element
	if (items.element && items.element.substring) el = document.querySelector(items.element);
	else if (isa_dom(items.element)) el = items.element;
	else {

		newElement = true;
		el = document.createElement('div');
	}

	// get element's host (parent-to-be) element
	if (items.host && items.host.substring) {

		host = document.querySelector(items.host);
		if (!host) host = document.body;
	}
	else if (isa_dom(items.host)) host = items.host;
	else if (xt(el.parentElement)) host = el.parentElement;
	else host = document.body;

	// if dimensions have been set in the argument, apply them to the stack-to-be element
	if (xt(items.width)) el.style.width = (items.width.toFixed) ? `${items.width}px` : items.width;
	if (xt(items.height)) el.style.height = (items.height.toFixed) ? `${items.height}px` : items.height;

	// make sure the stack-to-be element has an id attribute
	name = items.name || el.id || el.getAttribute('name') || '';
	if (!name) name = generateUuid();
	el.id = name;

	// set the 'data-stack' attribute on the stack-to-be element
	el.setAttribute('data-stack', 'data-stack');

	// determine whether the parent element is already known to Scrawl-canvas - affects the stack-to-be element's group 
	if (host && host.getAttribute('data-stack') != null) {

		hostinscrawl = artefact[host.id];

		mygroup = (hostinscrawl) ? hostinscrawl.name : 'root';
	}
	else mygroup = 'root';

	// set the 'data-group' attribute on the stack-to-be element
	el.setAttribute('data-group', mygroup);

	// determine what the stack-to-be element's position style attribute will be
	if (mygroup === 'root') position = 'relative';

	// add (or move) the stack-to-be element to/in the DOM
	if (!el.parentElement || host.id !== el.parentElement.id) host.appendChild(el);

	// create the Scrawl-canvas Stack artefact
	mystack = makeStack({
		name: name,
		domElement: el,
		group: mygroup,
		host: mygroup,
		position: position,
		setInitialDimensions: true
	});

	processNewStackChildren(el, name);

	// in case any of the child elements were already a Scrawl-canvas stack, un-root them (if required)
	Array.from(el.childNodes).forEach(child => {

		if (child.id && rootElements.indexOf(child.id) >= 0) removeItem(rootElements, child.id);
	});

	// set the new Stack's remaining attributes, clearing out any attributes already handled
	delete items.name;
	delete items.element;
	delete items.host;
	delete items.width;
	delete items.height;
	mystack.set(items);

	// tidy up and complete
	rootElementsSort = true;
	return mystack;
};

/*
## Scrawl-canvas user interaction listeners
Each scrawl-canvas stack and canvas can have bespoke Scrawl-canvas listeners attached to them, to track user mouse and touch interactions with that element. Scrawl-canvas defines five bespoke listeners:

* __move__ - track mouse cursor and touch movements across the DOM element
* __down__ - register a new touch interaction, or user pressing the left mouse button
* __up__ - register the end of a touch interaction, or user releasing the left mouse button
* __enter__ - trigger an event when the mouse cursor or touch event enters into the DOM element
* __leave__ - trigger an event when the mouse cursor or touch event exits from the DOM element

The functions all takes the following arguments:

* __evt__ - String name of the event ('move', 'down', 'up', 'enter', 'leave'), or an array of such strings
* __fn__ - the function to be called when the event listener(s) trigger
* __targ__ - either the DOM element object, or an array of DOM element objects, or a query selector String; these elements need to be registered in the Scrawl-canvas library beforehend (done automatically for stack and canvas elements)
*/
const addListener = function (evt, fn, targ) {

	if (!isa_fn(fn)) throw new Error(`core/document addListener() error - no function supplied: ${evt}, ${targ}`);

	actionListener(evt, fn, targ, 'removeEventListener');
	actionListener(evt, fn, targ, 'addEventListener');

	return function () {

		removeListener(evt, fn, targ);
	};
};

/*
The counterpart to 'addListener' is __removeListener__ which removes Scrawl-canvas event listeners from DOM elements in a similar way
*/ 
const removeListener = function (evt, fn, targ) {

	if (!isa_fn(fn)) throw new Error(`core/document removeListener() error - no function supplied: ${evt}, ${targ}`);

	actionListener(evt, fn, targ, 'removeEventListener');
};

const actionListener = function (evt, fn, targ, action) {

	let events = [].concat(evt),
		targets;
	
	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	if (navigator.pointerEnabled || navigator.msPointerEnabled) actionPointerListener(events, fn, targets, action);
	else actionMouseListener(events, fn, targets, action);
};

const actionMouseListener = function (events, fn, targets, action) {

	events.forEach(myevent => {

		targets.forEach(target => {

			if (!isa_dom(target)) throw new Error(`core/document actionMouseListener() error - bad target: ${myevent}, ${target}`);

			switch (myevent) {
			
				case 'move':
					target[action]('mousemove', fn, false);
					target[action]('touchmove', fn, false);
					target[action]('touchfollow', fn, false);
					break;

				case 'up':
					target[action]('mouseup', fn, false);
					target[action]('touchend', fn, false);
					break;

				case 'down':
					target[action]('mousedown', fn, false);
					target[action]('touchstart', fn, false);
					break;

				case 'leave':
					target[action]('mouseleave', fn, false);
					target[action]('touchleave', fn, false);
					break;

				case 'enter':
					target[action]('mouseenter', fn, false);
					target[action]('touchenter', fn, false);
					break;
			}
		});
	});
};

const actionPointerListener = function (events, fn, targets, action) {

	events.forEach(myevent => {

		targets.forEach(target => {

			if (!isa_dom(target)) throw new Error(`core/document actionPointerListener() error - bad target: ${myevent}, ${target}`);

			switch (myevent) {
			
				case 'move':
					target[action]('pointermove', fn, false);
					break;

				case 'up':
					target[action]('pointerup', fn, false);
					break;

				case 'down':
					target[action]('pointerdown', fn, false);
					break;

				case 'leave':
					target[action]('pointerleave', fn, false);
					break;

				case 'enter':
					target[action]('pointerenter', fn, false);
					break;
			}
		});
	});
};

/*
Any event listener can be added to a Scrawl-canvas stack or canvas DOM element. The __addNativeListener__ makes adding and removing these 'native' listeners a little easier: multiple event listeners (which all trigger the same function) can be added to multiple DOM elements (that have been registered in the Scrawl-canvas library) in a single function call.

The function requires three arguments:

* __evt__ - String name of the event ('click', 'input', 'change', etc), or an array of such strings
* __fn__ - the function to be called when the event listener(s) trigger
* __targ__ - either the DOM element object, or an array of DOM element objects, or a query selector String
*/
const addNativeListener = function (evt, fn, targ) {

	if (!isa_fn(fn)) throw new Error(`core/document addNativeListener() error - no function supplied: ${evt}, ${targ}`);

	actionNativeListener(evt, fn, targ, 'removeEventListener');
	actionNativeListener(evt, fn, targ, 'addEventListener');

	return function () {

		removeNativeListener(evt, fn, targ);
	};
};

/*
The counterpart to 'addNativeListener' is __removeNativeListener__ which removes event listeners from DOM elements in a similar way
*/ 
const removeNativeListener = function (evt, fn, targ) {

	if (!isa_fn(fn)) throw new Error(`core/document removeNativeListener() error - no function supplied: ${evt}, ${targ}`);

	actionNativeListener(evt, fn, targ, 'removeEventListener');
};

const actionNativeListener = function (evt, fn, targ, action) {

	let events = [].concat(evt),
		targets;

	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	events.forEach(myevent => {

		targets.forEach(target => {

			if (!isa_dom(target)) throw new Error(`core/document actionNativeListener() error - bad target: ${myevent}, ${target}`);

			target[action](myevent, fn, false);
		});
	});
};

/*
## Scrawl-canvas display cycle

Scrawl-canvas breaks down the display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.

The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value

Each display cycle function returns a Promise object which will resolve as true if the function completes successfully; false otherwise. These promises will never reject
*/

/*
### Clear

* for a canvas, clear its display (reset all pixels to 0, or the designated background color) ready for it to be redrawn
* for a stack element - no action required
*/
const clear = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('clear');
};

/*
### Compile

* for both canvas and stack elements, perform necessary entity/element positional calculations
* for a canvas, stamp associated entitys onto the canvas
*/
const compile = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('compile');
};

/*
### Show

* stamp additional 'layer' canvases onto the base canvas, then copy the base canvas onto the display canvas
* for a stack element - no action required
*/
const show = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('show');
};

/*
### Render

* orchestrate the clear, compile and show actions on each stack and canvas DOM element
*/
const render = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('render');
};

/*
Helper functions coordinate the actions required to complete a display cycle
*/
const displayCycleHelper = function (items) {

	if (items.length) rootElements_sorted = items;
	else if (rootElementsSort) sortRootElements();
};

/*

*/
const displayCycleBatchProcess = function (method) {

	return new Promise((resolve, reject) => {

		let promises = [];

		rootElements_sorted.forEach((name) => {

			let item = artefact[name];

			if (item && item[method]) promises.push(item[method]());
		})

		Promise.all(promises)
		.then(() => resolve(true))
		.catch((err) => reject(false));
	})
};

/*
### makeRender

Generate an animation object which will run a clear/compile/show display ccycle on an renderable artefact such as a Stack or Canvas.

We can also add in user-composed __display cycle hook functions__ which will run at appropriate places in the display cycle. These hooks are:

* commence
* afterClear
* afterCompile
* afterShow
* error
*/
const makeRender = function (items = {}) {

	if (!items || !items.target) return false;

	let target = (items.target.substring) ? artefact[items.target] : items.target;

	if (!target.clear || !target.compile || !target.show) return false;

	let commence = (isa_fn(items.commence)) ? items.commence : defaultNonReturnFunction,
		afterClear = (isa_fn(items.afterClear)) ? items.afterClear : defaultNonReturnFunction,
		afterCompile = (isa_fn(items.afterCompile)) ? items.afterCompile : defaultNonReturnFunction,
		afterShow = (isa_fn(items.afterShow)) ? items.afterShow : defaultNonReturnFunction,
		error = (isa_fn(items.error)) ? items.error : defaultNonReturnFunction;

	return makeAnimation({

		name: items.name || '',
		order: items.order || 1,
		// delay: true,
		
		fn: function() {
			
			return new Promise((resolve, reject) => {

				Promise.resolve(commence())
				.then(() => target.clear())
				.then(() => Promise.resolve(afterClear()))
				.then(() => target.compile())
				.then(() => Promise.resolve(afterCompile()))
				.then(() => target.show())
				.then(() => Promise.resolve(afterShow()))
				.then(() => resolve(true))
				.catch(err => {

					error(err);
					reject(err);
				});
			});
		},
	});
};

/*

*/
const domShowElements = [];
const addDomShowElement = function (item = '') {

	if (!item) throw new Error(`core/document addDomShowElement() error - false argument supplied: ${item}`);
	if (!item.substring) throw new Error(`core/document addDomShowElement() error - argument not a string: ${item}`);

	pushUnique(domShowElements, item);
};

let domShowRequired = false;
const setDomShowRequired = function (val = true) {

	domShowRequired = val;
};

const domShow = function (singleArtefact = '') {

	if (domShowRequired || singleArtefact) {

		let myartefacts;

		if (singleArtefact) myartefacts = [singleArtefact];
		else {

			domShowRequired = false;
			myartefacts = [].concat(domShowElements);
			domShowElements.length = 0;
		}

		// given the critical nature of these loops, using 'for' instead of 'forEach'
		let i, iz, name, art, el, style,
			p, dims, w, h,
			j, jz, items, keys, key, keyName, value;

		for (i = 0, iz = myartefacts.length; i < iz; i++) {

			name = myartefacts[i];

			art = artefact[name];
			if (!art) throw new Error(`core/document domShow() error - artefact missing: ${name}`);

			el = art.domElement;
			if (!el) throw new Error(`core/document domShow() error - DOM element missing: ${name}`);

			style = el.style;

			// update perspective
			if (art.dirtyPerspective) {

				art.dirtyPerspective = false;

				p = art.perspective;

				style.perspectiveOrigin = `${p.x} ${p.y}`;
				style.perspective = `${p.z}px`;
			}

			// update position
			if (art.dirtyPosition) {

				art.dirtyPosition = false;
				style.position = art.position;
			}

			// update dimensions
			if (art.dirtyDomDimensions) {

				art.dirtyDomDimensions = false;

				dims = art.currentDimensions;
				w = dims[0];
				h = dims[1];

				if (art.type === 'Canvas') {

					el.width = w;
					el.height = h;
				}
				else {

					style.width = `${w}px`;
					style.height = (h) ? `${h}px` : 'auto';
				}
			}

			// update handle/transformOrigin
			if (art.dirtyTransformOrigin) {

				art.dirtyTransformOrigin = false;
				style.transformOrigin = art.currentTransformOriginString;
			}

			// update transform
			if (art.dirtyTransform) {

				art.dirtyTransform = false;
				style.transform = art.currentTransformString;
			}

			// update visibility
			if (art.dirtyVisibility) {

				art.dirtyVisibility = false;
				style.display = (art.visibility) ? 'block' : 'none';
			}

			// update other CSS changes
			if (art.dirtyCss) {

				art.dirtyCss = false;

				items = art.css || {};
				keys = Object.keys(items);

				for (j = 0, jz = keys.length; j < jz; j++) {

					key = keys[j];
					value = items[key];

					if (xcss.has(key)) {

						keyName = `${key[0].toUpperCase}${key.substr(1)}`;

						style[`webkit${keyName}`] = value;
						style[`moz${keyName}`] = value;
						style[`ms${keyName}`] = value;
						style[`o${keyName}`] = value;
						style[key] = value;
					}
					else if (css.has(key)) style[key] = value;
				}
			}

			// update element classes
			if (art.dirtyClasses) {

				art.dirtyClasses = false;
				el.className = art.classes;
			}
		}
	}
}

/*
Used by Scrawl-canvas worker functionality to locate worker-related javascript files on the server
*/
const setScrawlPath = function (url) {

	window.scrawlPath = url;
};

/*
Create a holding area within the DOM but very offscreen, which can be used by (for example) the Phrase entity for calculating font heights
*/
let scrawlCanvasHold = document.createElement('div');
scrawlCanvasHold.style.padding = 0;
scrawlCanvasHold.style.border = 0;
scrawlCanvasHold.style.margin = 0;
scrawlCanvasHold.style.width = '4500px';
scrawlCanvasHold.style.boxSizing = 'border-box';
scrawlCanvasHold.style.position = 'absolute';
scrawlCanvasHold.style.top = '-5000px';
scrawlCanvasHold.style.left = '-5000px';
document.body.appendChild(scrawlCanvasHold);

export {
	getCanvases,
	getStacks,

	addCanvas,
	addStack,
	setCurrentCanvas,

	currentCanvas,
	currentGroup,

	rootElements,
	setRootElementsSort,

	addListener,
	removeListener,
	addNativeListener,
	removeNativeListener,

	clear,
	compile,
	show,
	render,

	makeRender,

	addDomShowElement,
	setDomShowRequired,
	domShow,

	setScrawlPath,
	scrawlCanvasHold,
};