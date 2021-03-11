// # Base mixin
// This mixin sets up much of the basic functionality of a Scrawl-canvas Object:
// + __defs__ - every Scrawl-canvas object comes with a set of pre-defined attributes with default values; the specific attributes will vary between factories, but all include a 'name' attribute.
// + __getters__ - to retrieve values from a given attribute.
// + __setters__ - to update a range of attribute values in a Scrawl-canvas object.
// + __deltaSetters__ - to add supplied values to a range of attribute values in a Scrawl-canvas object.
// + __name__ attribute functionality - all Scrawl-canvas objects are given a name attribute, either supplied by the developer or computer-generated by the system.
// + Object __registration__ functionality - most factory-generated objects get registered in the Scrawl-canvas library object.
// + __packet__ generation and use - Scrawl-canvas objects can deliver and consume text-based packets to build new objects or update existing objects.
// + __clone__ functionality - most Scrawl-canvas objects can be cloned, to make the development of a canvas (or stack) scene easier.
// + __kill__ functionality - remove objects from the Scrawl-canvas system - and, where required, the DOM - in a safe way.
//
// Given the fundamental nature of the above functionality the base mixin should always, when coding a Scrawl-canvas factory, be the first to be applied to that factory function's prototype.


// #### Imports
import * as library from '../core/library.js';
import { mergeOver, pushUnique, removeItem, 
    generateUniqueString, isa_boolean, isa_obj, addStrings, 
    xt, xta, λnull, Ωempty } from '../core/utilities.js';

// #### Export function
export default function (P = Ωempty) {


// #### Get, Set, deltaSet
// The __defs__ object supplies default values for a Scrawl-canvas object. Setter functions will check to see that a related defs attribute exists before allowing users to update an object attribute. Similarly the getter function will use the defs object to supply default values for an attribute that has not otherwise been set, or has been deleted by a user.
    P.defs = {};
        

// The __getters__ object holds a suite of functions for given factory object attributes that need to have their values processed before they can be returned to the user.
    P.getters = {};
        

// The __setters__ object holds a suite of functions for given factory object attributes that need to process a new value before setting it to the attribute.
    P.setters = {};
        

// The __deltaSetters__ object holds a suite of functions for given factory object attributes that need to process a new value before adding it to the attribute's existing value.
    P.deltaSetters = {};
    
// `get` - Retrieve an attribute value using the __get__ function. While many attributes can be retrieved directly - for example, _scrawl.artefact.myelement.scale_ - some attributes should only ever be retrieved using get:
// ```
// scrawl.artefact.myelement.get('startX');
// -> 200
// ```
    P.get = function (item) {

        if (xt(item)) {

            let getter = this.getters[item];

            if (getter) return getter.call(this);

            else {

                let def = this.defs[item];

                if (typeof def != 'undefined') {

                    let val = this[item];
                    return (typeof val != 'undefined') ? val : def;
                }
            }
        }
        return null;
    };

// `set` - Set an attribute value using the __set__ function. It is extremely important that all factory object attributes are set using the set function; setting an attribute directly will lead to unexpected behaviour! The set function takes a single object as its argument.
// ```
// scrawl.artefact.myelement.set({
//     startX: 50,
//     startY: 200,
//     scale: 1.5,
//     roll: 90,
// });
// ```
    P.set = function (items = Ωempty) {

        const keys = Object.keys(items),
            keysLen = keys.length;

        if (keysLen) {

            const setters = this.setters,
                defs = this.defs;
            
            let predefined, i, key, value;

            for (i = 0; i < keysLen; i++) {

                key = keys[i];
                value = items[key];

                if (key && key !== 'name' && value != null) {

                    predefined = setters[key];

                    if (predefined) predefined.call(this, value);
                    else if (typeof defs[key] !== 'undefined') this[key] = value;
                }
            }
        }
        return this;
    };


// `setDelta` - Add a value to an existing attribute value using the __setDelta__ function. It is extremely important that all factory object attributes are updated using the setDelta function; updating an attribute directly will lead to unexpected behaviour! The setDelta function takes a single object as its argument.
// ```
// scrawl.artefact.myelement.setDelta({
//     startX: 10,
//     startY: -20,
//     scale: 0.05,
//     roll: 5,
// });
// ```
    P.setDelta = function (items = Ωempty) {

        const keys = Object.keys(items),
            keysLen = keys.length;

        if (keysLen) {

            const setters = this.deltaSetters,
                defs = this.defs;
            
            let predefined, i, iz, key, value;

            for (i = 0; i < keysLen; i++) {

                key = keys[i];
                value = items[key];

                if (key && key !== 'name' && value != null) {

                    predefined = setters[key];

                    if (predefined) predefined.call(this, value);
                    else if (typeof defs[key] !== 'undefined') this[key] = addStrings(this[key], value);
                }
            }
        }
        return this;
    };


// #### Shared attributes
    let defaultAttributes = {

// Scrawl-canvas relies on unique __name__ values being present in a factory object for a wide range of functionalities. Most of the library sections store an object by its name value, for example: _scrawl.artefact.myelement_
        name: '',
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// __Packets__ are Scrawl-canvas's way of generating and consuming SC object data, both locally and over a network. A packet is a formatted JSON String which can be captured in a variable or saved to a text file.
//
// The packet format is as follows:
//
//     "[object-name, object-type, object's-library-section, {object-data-key:value-pairs}]"
//
// + Use __saveAsPacket()__ to get a stringified representation of a Scrawl-canvas object, which can then be consumed by other SC objects at a later date.
// + Use __actionPacket('packet-string')__ to apply a previously saved packet to an existing SC object, or to create a new SC object from the packet if it doesn't exist already
// + Use __importPacket(url)__ to retrieve a packet from a text file (normally kept remotely on a server); the function's argument can be either the packet file's url address, or an Array of such addresses.
//
// Using _JSON.stringify(object)_, or _object.toString()_, to generate String representations of SC objects is not recommended as they will forego the pre-processing that saveAsPacket performs to generate the packet String.
//
// Example:
// ```
// let canvas = scrawl.library.canvas.mycanvas;
// canvas.setAsCurrentCanvas();
//
// let box = scrawl.makeBlock({
//
//     name: 'my-box',
//
//     startX: 10,
//     startY: 10,
//
//     width: 100,
//     height: 50,
//
//     fillStyle: 'red',
//
//     onEnter: function () {
//         box.set({
//             fillStyle: 'pink',
//         });
//     },
//
//     onLeave: function () {
//         box.set({
//             fillStyle: 'red',
//         });
//     }
// });
//
// let boxPacket = box.saveAsPacket();
//
// console.log(boxPacket);
// | [
// |     "my-box",
// |     "Block",
// |     "entity",
// |     {
// |         "name":"my-box",
// |         "dimensions":[100,50],
// |         "start":[10,10],
// |         "delta":{},
// |         "onEnter":"function () {\n\t\tbox.set({\n\t\t\tfillStyle: 'pink',\n\t\t});\n\t}",
// |         "onLeave":"function () {\n\t\tbox.set({\n\t\t\tfillStyle: 'red',\n\t\t});\n\t}",
// |         "group":"mycanvas_base",
// |         "fillStyle":"black"
// |     }
// | ]
//
// // delete the box
// box.kill()
//
// // recreate the entity - we can invoke the function on any handy SC object without affecting that object
// let resurrectedBox = canvas.actionPacket(boxPacket);
//
// // recreate the entity - if we had saved the packet to a file on a server
// let fetchedBox = canvas.importPacket('https://example.com/path/to/boxPacket.txt');
// ```

// Internal processing Arrays
    P.packetExclusions = [];
    P.packetExclusionsByRegex = [];
    P.packetCoordinates = [];
    P.packetObjects = [];
    P.packetFunctions = [];

// `saveAsPacket` - accepts an items {key:value} object argument with the following (optional) attributes:
// + __includeDefaults__ - either a boolean (default: false), or an array of attribute strings listing those attributes whose values should be included in the packet even if those values are the default values; setting this attribute to boolean true will include all of the Scrawl-canvas object's attribute values in the (much larger) packet.
//
// Note: if the argument is supplied as a boolean 'true', code will create an items object with an attribute 'includeDefaults' set to true.
    P.saveAsPacket = function (items = Ωempty) {

        if (isa_boolean(items) && items) items = {
            includeDefaults: true,
        }

        let defs = this.defs,
            defKeys = Object.keys(defs),
            packetExclusions = this.packetExclusions,
            packetExclusionsByRegex = this.packetExclusionsByRegex,
            packetCoordinates = this.packetCoordinates,
            packetObjects = this.packetObjects,
            packetFunctions = this.packetFunctions,
            packetDefaultInclusions = items.includeDefaults || false,
            copy = {};

        if (packetDefaultInclusions && !Array.isArray(packetDefaultInclusions)) {

            packetDefaultInclusions = Object.keys(defs);
        }
        else if (!packetDefaultInclusions) packetDefaultInclusions = [];

        Object.entries(this).forEach(([key, val]) => {

            let flag = true,
                test;

            if (defKeys.indexOf(key) < 0) flag = false;

            if (flag && packetExclusions.indexOf(key) >= 0) flag = false;

            if (flag) {

                test = packetExclusionsByRegex.some(reg => new RegExp(reg).test(key));
                if (test) flag = false;
            }

            if (flag) {

                if (packetFunctions.indexOf(key) >= 0) {

                    if (xt(val) && val !== null) {

                        let func = this.stringifyFunction(val);

                        if (func && func.length) copy[key] = func;
                    }
                }

                else if (packetObjects.indexOf(key) >= 0 && this[key] && this[key].name) copy[key] = this[key].name;

                else if (packetCoordinates.indexOf(key) >= 0) {

                    if (packetDefaultInclusions.indexOf(key) >= 0) copy[key] = val;
                    else if (val[0] || val[1]) copy[key] = val;
                }

                else {

                    // Start cascade down to factory to pick up factory-specific exclusions
                    test = this.processPacketOut(key, val, packetDefaultInclusions);
                    if (test) copy[key] = val;
                }
            } 
        }, this);

        // Start cascade down to factory to complete the copy object's build
        copy = this.finalizePacketOut(copy, items);

        // Return a JSON string
        return JSON.stringify([this.name, this.type, this.lib, copy]);
    };


// Helper functions that get defined in various mixins and factories - localizing the functionality to meet the specific needs of that factory's object instances

// `stringifyFunction`
    P.stringifyFunction = function (val) {

        // The dotAll /s regex flag currently not supported by Firefox
        // let matches = val.toString().match(/\((.*?)\).*?\{(.*)\}/s);
        let matches = val.toString().match(/\(([\s\S]*?)\)[\s\S]*?\{([\s\S]*)\}/);
        let vars = matches[1];
        let func = matches[2];

        return (xta(vars, func)) ? `${vars}~~~${func}` : false;
    };

// `processPacketOut`
    P.processPacketOut = function (key, value, includes) {

        let result = true;

        if (includes.indexOf(key) < 0 && value === this.defs[key]) result = false;

        return result;
    };

// `finalizePacketOut`
    P.finalizePacketOut = function (copy, items) {

        return copy;
    };

// `importPacket` - Import and unpack a string representation of a factory object using the __saveAsPacket__ function.
// + Uses __fetch__, thus is an asynchronous process and returns a promise
// + Once we have the packet, we can further action it using actionPacket() 
    P.importPacket = function (items) {

        let self = this;

        const getPacket = function(url) {

            return new Promise((resolve, reject) => {

                let report;

                if (!url.substring) reject(new Error('Packet url supplied for import is not a string'));

                if (url[0] === '[') {

                    // Looks like we already have a packet for processing
                    report = self.actionPacket(url);
                    if (report && report.lib) resolve(report);
                    else reject(report);
                }
                // This is not much of a test ...
                else if (url.indexOf('"name":') >= 0) {

                    // Looks like we have a packet for processing, but it's malformed
                    reject(new Error('Bad packet supplied for import'));
                }
                else {

                    // Attempt to fetch the packet from a remote server
                    fetch(url)
                    .then(res => {

                        if (!res.ok) throw new Error(`Packet import from server failed - ${res.status}: ${res.statusText} - ${res.url}`);
                        return res.text();
                    })
                    .then(packet => {

                        report = self.actionPacket(packet);
                        if (report && report.lib) resolve(report);
                        else throw report;
                    })
                    .catch(error => reject(error));
                }
            });
        };

        if (Array.isArray(items)) {

            let promises = [];

            items.forEach(item => promises.push(getPacket(item)));

            return new Promise((resolve, reject) => {

                Promise.all(promises)
                .then(res => resolve(res))
                .catch(error => reject(error));
            });
        }
        else if (items.substring) return getPacket(items);
        else Promise.reject(new Error('Argument supplied for packet import is not a string or array of strings'));
    };


// `actionPacket` - This function:
// 1. Unpacks the packet
// 2. Determines whether an artefact/asset/style/tween/etc of this packet's name already exists
// 3. If we have existence, set the artefact/asset/style/tween/etc with the packet's data
// 4. If we have no existence, create the artefact/asset/style/tween/etc
// 5. Returns the affected artefact/asset/style/tween/etc on success; false otherwise
//
// The function can be called directly on any Scrawl-canvas object that uses the base.js mixin - which means that all differing functionality for various types of object have to remain here, in base.js
    P.actionPacketExclusions = ['Image', 'Sprite', 'Video', 'Canvas', 'Stack'];
    P.actionPacket = function (packet) {

        try {

            if (packet && packet.substring) {

                if (packet[0] === '[') {

                    let name, type, lib, update;

                    try {

                        [name, type, lib, update] = JSON.parse(packet);
                    }
                    catch (e) {

                        throw new Error(`Failed to process packet due to JSON parsing error - ${e.message}`);
                    }

                    if (xta(name, type, lib, update)) {

                        if (this.actionPacketExclusions.indexOf(type) >= 0) {

                            throw new Error(`Failed to process packet - Stacks, Canvases and visual assets are excluded from the packet system`);
                        }

                        let obj = library[lib][name];

                        if (obj) obj.set(update);
                        else {

                            // Stack-based artefacts need a DOM element that they can pass into the factory
                            if (update.outerHTML && update.host) {

                                let myParent = document.querySelector(`#${update.host}`);

                                if (myParent) {

                                    let tempEl = document.createElement('div');

                                    tempEl.innerHTML = update.outerHTML;

                                    let myEl = tempEl.firstElementChild;

                                    if (myEl) {

                                        myEl.id = name;

                                        myParent.appendChild(myEl);

                                        update.domElement = myEl;
                                    }
                                }
                            }

                            obj = new library.constructors[type](update);

                            if (!obj) throw new Error('Failed to create Scrawl-canvas object from supplied packet');
                        }

                        // For the main object
                        obj.packetFunctions.forEach(item => this.actionPacketFunctions(obj, item));

                        // For artefact anchors - I know that anchors only have the one function to worry about, but doing it this way so I don't forget how to approach it eg for SC sub-objects that have more than one user-settable function (eg timeline actions)
                        if (update.anchor && obj.anchor) {

                            obj.anchor.packetFunctions.forEach(item => {

                                // Anchor.setters.clickAction(arg) explicitly checks that the supplied arg is a function - if it isn't (like in packet cases) then the attribute doesn't get updated when we invoke _obj.set(update);_ earlier in this function.
                                obj.anchor[item] = update.anchor[item];
                                this.actionPacketFunctions(obj.anchor, item)

                                // Anchors are a bit of an exception case because they add a user-interactive and yet otherwise untracked DOM element to the page, which has to be updated in its own sweet, special way...
                                obj.anchor.build();
                            });
                        }

                        // Specific to Phrase entitys, which doesn't include a simple way to set or update glyphStyle objects
                        if (update.glyphStyles && obj.glyphStyles) {

                            update.glyphStyles.forEach((gStyle, index) => {

                                if (isa_obj(gStyle)) obj.setGlyphStyles(gStyle, index);
                            });
                        }

                        if (obj) return obj;
                        else throw new Error('Failed to process supplied packet');
                    }
                    else throw new Error('Failed to process packet - JSON string holds incomplete data');
                }
                else throw new Error('Failed to process packet - JSON string does not represent an array');
            }
            else throw new Error('Failed to process packet - not a JSON string');
        }
        catch (e) { console.log(e); return e }
    };

// `actionPacketFunctions` - internal helper function - creates functions from Strings
    P.actionPacketFunctions = function(obj, item) {

        let fItem = obj[item];

        if (xt(fItem) && fItem !== null && fItem.substring) {

            if (fItem === '~~~') obj[item] = λnull;
            else {

                let args, func, f;

                [args, func] = fItem.split('~~~');

                args = args.split(',');
                args = args.map(a => a.trim());

                // Native code raises non-terminal errors (because it is native code!) - so we dodge that bullet.
                if (func.indexOf('[native code]') < 0) {

                    f = new Function(...args, func);

                    obj[item] = f.bind(obj);
                }
                else obj[item] = λnull;
            }
        }
    };

// #### Clone management
// Most Scrawl-canvas factory objects can be copied using the __clone__ function. The result will be an exact copy of the original, additionally set with values supplied in the argument object.
// ```
// scrawl.artefact.myelement.clone({
//     name: 'myclonedelement',
//     startY: 60,
// });
// ```

// `clone`
    P.clone = function (items = Ωempty) {

        let myName = this.name,
            myPacket, myTicker, myAnchor;

        this.name = items.name || '';

        // Tickers are specific to Tween and Action objects
        if (items.useNewTicker) {

            myTicker = this.ticker;
            this.ticker = null;
            myPacket = this.saveAsPacket();
            this.ticker = myTicker;
        }

        // Everything else
        else myPacket = this.saveAsPacket();

        this.name = myName;

        let clone = this.actionPacket(myPacket);

        this.packetFunctions.forEach(func => {

            if (this[func]) clone[func] = this[func];
        });

        clone = this.postCloneAction(clone, items);

        clone.set(items);

        return clone;
    };

// `postCloneAction` - overwritten by a variety of mixins and factories
    P.postCloneAction = function (clone, items) {

        return clone;
    };


// #### Kill management

// `kill` - overwritten by various mixins and factories
    P.kill = function () {

        return this.deregister();
    }


// #### Prototype functions
// `makeName` - If the developer doesn't supply a name value for a factory function, then Scrawl-canvas will generate a random name for the object to use.
    P.makeName = function (item) {

        if (item && item.substring && library[`${this.lib}names`].indexOf(item) < 0) this.name = item;                
        else this.name = generateUniqueString();

        return this;
    };


// `register` - Many (but not all) factory functions will register their result objects in the scrawl lobrary. The section where the object is stored is dependent on the factory function's type value. 
// + Some objects are stored in more than one place - for example the artefacts section will include Stack, Element and Canvas objects in addition to various Entity objects
    P.register = function () {

        if (!xt(this.name)) throw new Error(`core/base error - register() name not set: ${this}`);

        let arr = library[`${this.lib}names`],
            mylib = library[this.lib];

        if(this.isArtefact){

            pushUnique(library.artefactnames, this.name);
            library.artefact[this.name] = this;
        }

        if(this.isAsset){

            pushUnique(library.assetnames, this.name);
            library.asset[this.name] = this;
        }

        pushUnique(arr, this.name);
        mylib[this.name] = this;

        return this;
    };


// `deregister` - Reverse what register() does
    P.deregister = function () {

        if (!xt(this.name)) throw new Error(`core/base error - deregister() name not set: ${this}`);

        let arr = library[`${this.lib}names`],
            mylib = library[this.lib];

        if(this.isArtefact){

            removeItem(library.artefactnames, this.name);
            delete library.artefact[this.name];
        }

        if(this.isAsset){

            removeItem(library.assetnames, this.name);
            delete library.asset[this.name];
        }

        removeItem(arr, this.name);
        delete mylib[this.name];

        return this;
    };


// Return the prototype
    return P;
};
