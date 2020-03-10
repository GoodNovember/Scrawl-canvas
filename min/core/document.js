import { isa_canvas, generateUuid, isa_fn, isa_dom, isa_boolean, isa_obj, pushUnique, removeItem, xt, defaultNonReturnFunction } from "./utilities.js";
import { artefact, canvas, group, stack, unstackedelement, css, xcss } from "./library.js";
import { makeStack } from "../factory/stack.js";
import { makeElement } from "../factory/element.js";
import { makeCanvas } from "../factory/canvas.js";
import { makeUnstackedElement } from "../factory/unstackedElement.js";
import { makeAnimation } from "../factory/animation.js";
## Core DOM element discovery and management
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
const processNewStackChildren = function (el, name) {
let hostDims = el.getBoundingClientRect(),
y = 0;
Array.from(el.children).forEach(child => {
if (child.getAttribute('data-stack') == null && !isa_canvas(child) && child.tagName !== 'SCRIPT') {
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
else child.setAttribute('data-group', name);
});
};
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
return makeCanvas({
name: myname,
domElement: el,
group: mygroup,
host: mygroup,
position: position,
setInitialDimensions: true
});
};
const getStacks = function () {
document.querySelectorAll('[data-stack]').forEach(el => addInitialStackElement(el));
};
const getCanvases = function () {
document.querySelectorAll('canvas').forEach((el, index) => {
let item = addInitialCanvasElement(el);
if (!index) setCurrentCanvas(item);
});
};
const getCanvas = function (search) {
let el = document.querySelector(search),
canvas = false;
if (el) canvas = addInitialCanvasElement(el);
setCurrentCanvas(canvas);
return canvas;
};
const addStack = function (items = {}) {
let el, host, hostinscrawl, mystack, mygroup, name,
position = 'absolute',
newElement = false;
if (items.element && items.element.substring) el = document.querySelector(items.element);
else if (isa_dom(items.element)) el = items.element;
else {
newElement = true;
el = document.createElement('div');
}
if (items.host && items.host.substring) {
host = document.querySelector(items.host);
if (!host) host = document.body;
}
else if (isa_dom(items.host)) host = items.host;
else if (xt(el.parentElement)) host = el.parentElement;
else host = document.body;
if (xt(items.width)) el.style.width = (items.width.toFixed) ? `${items.width}px` : items.width;
if (xt(items.height)) el.style.height = (items.height.toFixed) ? `${items.height}px` : items.height;
name = items.name || el.id || el.getAttribute('name') || '';
if (!name) name = generateUuid();
el.id = name;
el.setAttribute('data-stack', 'data-stack');
if (host && host.getAttribute('data-stack') != null) {
hostinscrawl = artefact[host.id];
mygroup = (hostinscrawl) ? hostinscrawl.name : 'root';
}
else mygroup = 'root';
el.setAttribute('data-group', mygroup);
if (mygroup === 'root') position = 'relative';
if (!el.parentElement || host.id !== el.parentElement.id) host.appendChild(el);
mystack = makeStack({
name: name,
domElement: el,
group: mygroup,
host: mygroup,
position: position,
setInitialDimensions: true
});
processNewStackChildren(el, name);
Array.from(el.childNodes).forEach(child => {
if (child.id && rootElements.indexOf(child.id) >= 0) removeItem(rootElements, child.id);
});
delete items.name;
delete items.element;
delete items.host;
delete items.width;
delete items.height;
mystack.set(items);
rootElementsSort = true;
return mystack;
};
const addCanvas = function (items = {}) {
let el = document.createElement('canvas'),
myname = (items.name) ? items.name : generateUuid(),
host = items.host,
mygroup = 'root',
width = items.width || 300,
height = items.height || 150,
position = 'relative';
if (host.substring) {
let temphost = artefact[host];
if (!temphost && host) host = document.querySelector(host);
else host = temphost;
}
if (host) {
if (host.type === 'Stack') {
mygroup = host.name;
position = 'absolute';
host = host.domElement;
}
else if (!isa_dom(host)) host = document.body;
}
else host = document.body;
el.id = myname;
el.setAttribute('data-group', mygroup);
el.width = width;
el.height = height;
el.style.position = position;
host.appendChild(el);
let mycanvas = makeCanvas({
name: myname,
domElement: el,
group: mygroup,
host: mygroup,
position: position,
setInitialDimensions: false,
setAsCurrentCanvas: (xt(items.setAsCurrentCanvas)) ? items.setAsCurrentCanvas : true,
trackHere: (xt(items.trackHere)) ? items.trackHere : true,
});
delete items.group;
delete items.host;
delete items.name;
delete items.element;
delete items.position;
delete items.setInitialDimensions;
delete items.setAsCurrentCanvas;
delete items.trackHere;
mycanvas.set(items);
return mycanvas;
};
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
const addListener = function (evt, fn, targ) {
if (!isa_fn(fn)) throw new Error(`core/document addListener() error - no function supplied: ${evt}, ${targ}`);
actionListener(evt, fn, targ, 'removeEventListener');
actionListener(evt, fn, targ, 'addEventListener');
return function () {
removeListener(evt, fn, targ);
};
};
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
const addNativeListener = function (evt, fn, targ) {
if (!isa_fn(fn)) throw new Error(`core/document addNativeListener() error - no function supplied: ${evt}, ${targ}`);
actionNativeListener(evt, fn, targ, 'removeEventListener');
actionNativeListener(evt, fn, targ, 'addEventListener');
return function () {
removeNativeListener(evt, fn, targ);
};
};
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
const clear = function (...items) {
displayCycleHelper(items);
return displayCycleBatchProcess('clear');
};
const compile = function (...items) {
displayCycleHelper(items);
return displayCycleBatchProcess('compile');
};
const show = function (...items) {
displayCycleHelper(items);
return displayCycleBatchProcess('show');
};
const render = function (...items) {
displayCycleHelper(items);
return displayCycleBatchProcess('render');
};
const displayCycleHelper = function (items) {
if (items.length) rootElements_sorted = items;
else if (rootElementsSort) sortRootElements();
};
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
const makeRender = function (items = {}) {
if (!items) return false;
let target;
if (!items.target) target = {
clear: clear,
compile: compile,
show: show
};
else if (Array.isArray(items.target)) {
let multiReturn = []
items.target.forEach(tempTarget => {
let tempItems = Object.assign({}, items);
tempItems.name = `${tempItems.name}_${tempTarget.name}`;
tempItems.target = tempTarget;
multiReturn.push(makeRender(tempItems));
});
return multiReturn;
}
else target = (items.target.substring) ? artefact[items.target] : items.target;
if (!target || !target.clear || !target.compile || !target.show) return false;
let commence = (isa_fn(items.commence)) ? items.commence : defaultNonReturnFunction,
afterClear = (isa_fn(items.afterClear)) ? items.afterClear : defaultNonReturnFunction,
afterCompile = (isa_fn(items.afterCompile)) ? items.afterCompile : defaultNonReturnFunction,
afterShow = (isa_fn(items.afterShow)) ? items.afterShow : defaultNonReturnFunction,
afterCreated = (isa_fn(items.afterCreated)) ? items.afterCreated : defaultNonReturnFunction,
onRun = (isa_fn(items.onRun)) ? items.onRun : defaultNonReturnFunction,
onHalt = (isa_fn(items.onHalt)) ? items.onHalt : defaultNonReturnFunction,
onKill = (isa_fn(items.onKill)) ? items.onKill : defaultNonReturnFunction,
error = (isa_fn(items.error)) ? items.error : defaultNonReturnFunction;
let readyToInitialize = true;
return makeAnimation({
name: items.name || '',
order: items.order || 1,
delay: items.delay || false,
fn: function() {
return new Promise((resolve, reject) => {
Promise.resolve(commence())
.then(() => target.clear())
.then(() => Promise.resolve(afterClear()))
.then(() => target.compile())
.then(() => Promise.resolve(afterCompile()))
.then(() => target.show())
.then(() => Promise.resolve(afterShow()))
.then(() => {
if (readyToInitialize) {
afterCreated();
readyToInitialize = false;
}
resolve(true);
})
.catch(err => {
error(err);
reject(err);
});
});
},
});
};
const makeComponent = function (items) {
let domElement = (isa_dom(items.domElement)) ? items.domElement : false,
animationHooks = (isa_obj(items.animationHooks)) ? items.animationHooks : {},
canvasSpecs = (isa_obj(items.canvasSpecs)) ? items.canvasSpecs : {},
observerSpecs = (isa_obj(items.observerSpecs)) ? items.observerSpecs : {},
includeCanvas = (isa_boolean(items.includeCanvas)) ? items.includeCanvas : true;
if (domElement && domElement.id && artefact[domElement.id]) {
return makeStackComponent(domElement, canvasSpecs, animationHooks, observerSpecs);
}
return makeUnstackedComponent(domElement, canvasSpecs, animationHooks, observerSpecs, includeCanvas);
};
const makeStackComponent = function (domElement, canvasSpecs, animationHooks, observerSpecs) {
let myElement = artefact[domElement.id];
if (!myElement) return false;
canvasSpecs.isComponent = true;
let myCanvas = myElement.addCanvas(canvasSpecs);
animationHooks.name = `${myElement.name}-animation`;
animationHooks.target = myCanvas;
let myAnimation = makeRender(animationHooks);
let observer = new IntersectionObserver((entries, observer) => {
entries.forEach(entry => {
if (entry.isIntersecting) !myAnimation.isRunning() && myAnimation.run();
else if (!entry.isIntersecting) myAnimation.isRunning() && myAnimation.halt();
});
}, observerSpecs);
observer.observe(myElement.domElement);
let destroy = () => {
observer.disconnect();
myAnimation.kill();
myCanvas.demolish();
myElement.demolish(true);
};
return {
element: myElement,
canvas: myCanvas,
animation: myAnimation,
demolish: destroy,
};
};
const makeUnstackedComponent = function (domElement, canvasSpecs, animationHooks, observerSpecs, includeCanvas) {
let myElement,
id = domElement.id;
if (id && unstackedelement[id]) myElement = unstackedelement[id];
else myElement = makeUnstackedElement(domElement);
canvasSpecs.isComponent = true;
let myCanvas = (includeCanvas) ? myElement.addCanvas(canvasSpecs) : false;
animationHooks.name = `${myElement.name}-animation`;
if (myCanvas) {
if (!animationHooks.afterClear) animationHooks.afterClear = () => myElement.updateCanvas();
animationHooks.target = myCanvas;
}
let myAnimation = makeRender(animationHooks);
let observer = new IntersectionObserver((entries, observer) => {
entries.forEach(entry => {
if (entry.isIntersecting) !myAnimation.isRunning() && myAnimation.run();
else if (!entry.isIntersecting) myAnimation.isRunning() && myAnimation.halt();
});
}, observerSpecs);
observer.observe(myElement.domElement);
let destroy = () => {
observer.disconnect();
myAnimation.kill();
if (myCanvas) myCanvas.demolish();
myElement.demolish(true);
};
return {
element: myElement,
canvas: myCanvas,
animation: myAnimation,
demolish: destroy,
};
};
const makeAnimationObserver = function (anim, wrapper) {
if (anim && anim.run && wrapper && wrapper.domElement) {
let observer = new IntersectionObserver((entries, observer) => {
entries.forEach(entry => {
if (entry.isIntersecting) !anim.isRunning() && anim.run();
else if (!entry.isIntersecting) anim.isRunning() && anim.halt();
});
}, {});
observer.observe(wrapper.domElement);
return observer.disconnect;
}
else return false;
}
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
if (art.dirtyPerspective) {
art.dirtyPerspective = false;
p = art.perspective;
style.perspectiveOrigin = `${p.x} ${p.y}`;
style.perspective = `${p.z}px`;
}
if (art.dirtyPosition) {
art.dirtyPosition = false;
style.position = art.position;
}
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
if (art.dirtyTransformOrigin) {
art.dirtyTransformOrigin = false;
style.transformOrigin = art.currentTransformOriginString;
}
if (art.dirtyTransform) {
art.dirtyTransform = false;
style.transform = art.currentTransformString;
}
if (art.dirtyVisibility) {
art.dirtyVisibility = false;
style.display = (art.visibility) ? 'block' : 'none';
}
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
if (art.dirtyClasses) {
art.dirtyClasses = false;
el.className = art.classes;
}
}
}
};
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
let scrawlNavigationHold = document.createElement('nav');
scrawlNavigationHold.style.position = 'absolute';
scrawlNavigationHold.style.top = '-5000px';
scrawlNavigationHold.style.left = '-5000px';
document.body.prepend(scrawlNavigationHold);
export {
getCanvases,
getCanvas,
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
makeAnimationObserver,
makeComponent,
addDomShowElement,
setDomShowRequired,
domShow,
scrawlCanvasHold,
scrawlNavigationHold,
};