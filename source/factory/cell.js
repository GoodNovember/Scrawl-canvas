// # Cell factory
// Scrawl-canvas uses 'hidden' canvases - &lt;canvas> elements that are not part of the DOM - for much of its functionality:
// + When we wrap a DOM-based &lt;canvas> element in a Scrawl-canvas [Canvas](./canvas.html) wrapper, we create a second 'hidden' &lt;canvas> element and assign it as that Canvas wrapper's __base cell__. 
// + This Cell is used for building the display during the Display cycle (`clear` and `compile` steps). 
// + It gets copied over to the Dom-based &lt;canvas> element at the end of the cycle (the `show` step).
// + When copied over, the base cell will determine how much of its display to copy into the controller Canvas, to meet the needs of that Canvas wrapper's `fit` attribute.
//
// A Scrawl-canvas Canvas wrapper can have more than one Cell wrapper associated with it. These additional Cells can be used as:
// + __layers__ to be applied to the base cell, allowing us to break a canvas display into more manageable portions
// + the source for image-based objects such as __Picture entitys__ and __Pattern styles__.
// + __artefacts__ - a Cell wrapper can act just like any artefact: it can be positioned, dimensioned, scaled and rotated ; it can act as a `pivot` or `mimic` source for other artefacts, or use them for its position and dimensions data. (Be aware, though, that Cell wrappers are NOT stored in the scrawl library's `artefact` section).
//
// Cell wrappers include a number of Boolean flags and other attributes to control how they are stamped onto other Cells. 
// + We can set flags to determine whether to include the Cell in each step of the Display cycle (`cleared`, `compiled`, `shown`) - this allows us to set up, for example, 'static' Cells that only need to be compiled once and can then be used as backgrounds for other Cells and entitys to be animated over.
// + We can vary the order in which Cell wrappers get processed during the Display cycle (`compileOrder`, `showOrder`). 
// + Each Cell can have its own `backgroundColor`.
// + Each Cell can be made translucent (`alpha`).
// + Each Cell can be stamped onto other Cell canvases using a different composition method (`composite`).
// + Each Cell can be given its own dimensions, different to those of its Canvas wrapper, with updates cascading down to entitys that use the Cell to determine their own (relative) dimensions and start coordinates. 
// + We can `scale`, `roll` and `flip` a Cell.
// + We can control which parts of the Cell display will be copied over to its destination (`copy attributes`).
// + We can add one or more `filters` to the Cell's outputted display.
//
// Every Cell wrapper will include a [Group object](./group.html) which shares the same name as the Cell. To include an entity object in a Cell wrapper's canvas display we add it to this group. 
// + Additional Group objects can be added to the Cell wrapper as-and-when required. 
// + Groups are processed in the order specified in their `order` attributes.
// + Groups whose `visibility` flag is set to false will be skipped during the Display cycle cascade.
//
// Scrawl-canvas uses the `makeCell` factory function internally; it is not exported to the scrawl object. Instead, ___new Cell wrappers can be created from a Canvas wrapper___ using its `addCell` function.
//
// Scrawl-canvas (partially) disables Cell wrapper `packet` functionality. ___Cell wrappers cannot be cloned.___ They can be killed, either using their `kill` function or by invoking their Canvas wrapper controller's `killCell` function.


// #### Demos:
// + All canvas and component demos, and a few of the stack demos, include Cell wrapper functionality - most of which happens behind the scenes and does not need to be directly coded. 
// + [Canvas-009](../../demo/canvas-009.html) - Pattern styles; Entity web link anchors; Dynamic accessibility
// + [Canvas-031](../../demo/canvas-031.html) - Cell generation and processing order - kaleidoscope clock
// + [Canvas-036](../../demo/canvas-036.html) - Cell artefact-like positional functionality
// + [Canvas-039](../../demo/canvas-039.html) - Detecting mouse/pointer cursor movements across a non-base Cell
// + [DOM-011](../../demo/dom-011.html) - Canvas controller `fit` attribute; Cell positioning (mouse)


// #### Imports
import { artefact, asset, tween, radian, constructors, styles, stylesnames, cell, cellnames, group, canvas } from '../core/library.js';

import { generateUniqueString, isa_canvas, mergeOver, λthis, λnull } from '../core/utilities.js';

import { scrawlCanvasHold } from '../core/document.js';

import { makeGroup } from './group.js';
import { makeState } from './state.js';
import { makeCoordinate, requestCoordinate, releaseCoordinate } from './coordinate.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from './filter.js';
import { importDomImage } from './imageAsset.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import deltaMix from '../mixin/delta.js';
import pivotMix from '../mixin/pivot.js';
import mimicMix from '../mixin/mimic.js';
import pathMix from '../mixin/path.js';
import anchorMix from '../mixin/anchor.js';
import cascadeMix from '../mixin/cascade.js';
import assetMix from '../mixin/asset.js';
import patternMix from '../mixin/pattern.js';
import filterMix from '../mixin/filter.js';


// #### Cell constructor
const Cell = function (items = {}) {

    this.makeName(items.name);

    if (!items.isPool) this.register();

    this.initializePositions();
    this.initializeCascade();

    if (!isa_canvas(items.element)) {

        let mycanvas = document.createElement('canvas');
        mycanvas.id = this.name;

        mycanvas.width = 300;
        mycanvas.height = 150;
        items.element = mycanvas;
    }

    this.installElement(items.element);

    if (items.isPool) this.set(this.poolDefs) 
    else this.set(this.defs);

    this.set(items);

    this.state.setStateFromEngine(this.engine);

    if (!items.isPool) {

        makeGroup({
            name: this.name,
            host: this.name
        });
    }

    this.subscribers = [];
    this.sourceNaturalDimensions = makeCoordinate();

    this.sourceLoaded = true;

    this.here = {};

    return this;
};


// #### Cell prototype
let P = Cell.prototype = Object.create(Object.prototype);
P.type = 'Cell';
P.lib = 'cell';
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
// + [base](../mixin/base.html)
// + [asset](../mixin/asset.html) - goes above position mixin because asset objects use the kill function defined in this mixin, but Cells need to follow the position mixin formula (which includes a call to the factoryKill function)
// + [position](../mixin/position.html)
// + [delta](../mixin/delta.html)
// + [pivot](../mixin/pivot.html)
// + [mimic](../mixin/mimic.html)
// + [path](../mixin/path.html)
// + [anchor](../mixin/anchor.html)
// + [cascade](../mixin/cascade.html)
// + [pattern](../mixin/pattern.html)
// + [filter](../mixin/filter.html)
P = baseMix(P);
P = assetMix(P);
P = positionMix(P);
P = deltaMix(P);
P = pivotMix(P);
P = mimicMix(P);
P = pathMix(P);
P = anchorMix(P);
P = cascadeMix(P);
P = patternMix(P);
P = filterMix(P);


// #### Cell attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
// + Attributes defined in the [cascade mixin](../mixin/cascade.html): __groups__.
// + Attributes defined in the [pattern mixin](../mixin/pattern.html): __repeat, patternMatrix, matrixA, matrixB, matrixC, matrixD, matrixE, matrixF__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
let defaultAttributes = {

// The following booleans determine whether a Cell canvas will, clear, compile and/or show itself as part of the Display cycle.
// + Note that as part of the Display cycle, Scrawl-canvas will complete all tasks of the `clear` part of the process before moving on to the `compile` stage, which again will complete before the `show` stage triggers.

// __cleared__ - Clearing the cell wipes it clean ready for new drawing activity - for cells that contain static imagery (such as a background) that only needs to be drawn once during an animation it makes no sense to construct its display on each iteration of the Display cycle. Can also be set to false if the compile step builds on, rather than replaces, the cell's current imagery.
    cleared: true,

// __compiled__ - Compiling the cell triggers the 'stamp cascade', where (visible) entitys in (visible) groups assigned to the cell are instructed to stamp themselves onto the cell. Again, set this to false if the cell's imagery does not need to be redrawn on each iteration of the Display cycle.
    compiled: true,

// __shown__ - Showing the cell instructs it to stamp itself onto the 'base' cell or, for base cells, to stamp itself onto the display &lt;canvas> element in line with that canvas's wrapper's 'fit' attribute. This can be switched off if the cell is (for instance) being used as an asset source for a Picture entity or Pattern style.
    shown: true,

// Cells will compile and show in the order given (ascending) of their __compileOrder__ and __showOrder__ values. Cells sharing a compileOrder or showOrder value will be compiled and shown determined by the order in which they were declared in the script where they were created.
    compileOrder: 0,
    showOrder: 0,


// By default, cells have a background color of `rgba(0,0,0,0)` - transparent black, which gets applied as the end step in the clear part of the display cycle. Setting the __backgroundColor__ attribute ensures the Cell will use that color instead. Any CSS color String is a valid argument (but not gradients or patterns, which get applied at a later stage in the Display cycle).
// + Base cells can have this attribute set via their controller Canvas.
    backgroundColor: '',


// __clearAlpha__ - a Number with a value between 0 and 1. When not zero, the cell will not clear itself; rather it will copy its current contents, clear itself, set its globalAlpha to this value, copy back its contents (now faded) and then restore its globalAlpha value
    clearAlpha: 0,


// Non-base Cells will stamp themselves onto the 'base' Cell as part of the Display cycle's show stage. We can mediate this action by setting the Cell's __alpha__ and __composite__ attributes to valid Rendering2DContext `globalAlpha` and `globalCompositeOperation` values.
    alpha: 1,
    composite: 'source-over',

// We can also scale the Cell's size in the displayed Canvas by setting the __scale__ attribute to an appropriate value.
    scale: 1,

// __flipReverse__, __flipUpend__ - Boolean flags which determine the orientation of the cell when it stamps itself on the display. 
// + a `reversed` cell is effectively flipped 180&deg; around a vertical line passing through that cell's rotation-reflection (start) point - a face looking to the right will now look to the left
// + an `upended` cell is effectively flipped 180&deg; around a horizontal line passing through that cell's rotation-reflection (start) point - a normal face will now appear upside-down
    flipReverse: false,
    flipUpend: false,

// __filter__ - the Canvas 2D engine supports the [filter attribute](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) on an experimental basis, thus it is not guaranteed to work in all browsers and devices. The filter attribute takes a String value (default: 'none') defining one or more filter functions to be applied to the Cell as it is stamped on its host canvas.
// + Be aware that Cells can also take a `filters` Array - this represents an array of Scrawl-canvas filters to be applied to the Cell. The two filter systems are completely separate - combine their effects at your own risk!
    filter: 'none',

// Scrawl-canvas sets the following attributes automatically; do not change their values!

// __isBase__ - Every displayed &lt;canvas> element - wrapped in a Scrawl-canvas Canvas object (factory/canvas.js) - must possess at least one Cell object, known as its 'base' Cell. 
    isBase: false,

// __controller__ - A reference link to the displayed &lt;canvas> element's Scrawl-canvas wrapper (factory/canvas.js) - only 'base' cells require this handle.
    controller: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// Cells don't have a need for these default attributes, which will have been added in by mixin/asset.js
delete P.defs.source;
delete P.defs.sourceLoaded;



// #### Packet/Clone management
// This functionality is disabled for Cell objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;


// #### Kill functionality
P.factoryKill = function () {

    let myname = this.name

    // Remove artefact from all canvases
    Object.entries(canvas).forEach(([name, cvs]) => {

        if (cvs.cells.indexOf(myname) >= 0) cvs.removeCell(myname);

        if (cvs.base && cvs.base.name === myname) {

            cvs.set({
                visibility: false,
            });
        }
    });

    // Remove from other artefacts
    Object.entries(artefact).forEach(([name, art]) => {

        if (art.name !== myname) {

            let state = art.state;

            if (state) {

                let fill = state.fillStyle,
                    stroke = state.strokeStyle;

                if (fill.name && fill.name === myname) state.fillStyle = state.defs.fillStyle;
                if (stroke.name && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
            }
        }
    });

    // Kill group
    if (group[myname]) group[myname].kill();
};

// #### Get, Set, deltaSet
let G = P.getters, 
    S = P.setters,
    D = P.deltaSetters;


// `get` - overwrites the mixin/position function
P.get = function (item) {

    let getter = this.getters[item];

    if (getter) return getter.call(this);

    else {

        let def = this.defs[item],
            state = this.state,
            val;

        if (typeof def != 'undefined') {

            val = this[item];
            return (typeof val != 'undefined') ? val : def;
        }

        def = state.defs[item];

        if (typeof def != 'undefined') {

            val = state[item];
            return (typeof val != 'undefined') ? val : def;
        }
        return undef;
    }
};

// `width`
G.width = function () {

    return this.currentDimensions[0] || this.element.getAttribute('width');
};
S.width = function (item) {

    this.dimensions[0] = item;
    this.dirtyDimensions = true;
};

// `height`
G.height = function () {

    return this.currentDimensions[1] || this.element.getAttribute('height');
};
S.height = function (item) {

    this.dimensions[1] = item;
    this.dirtyDimensions = true;
};

// Internal setters
S.source = function () {};
S.engine = function (item) {};
S.state = function (item) {};

S.element = function (item) {

    if(isa_canvas(item)) this.installElement(item);
};

// Display cycle Boolean flags `cleared`, `compiled`, `shown`
S.cleared = function (item) {

    this.cleared = item;
    this.updateControllerCells();
};
S.compiled = function (item) {

    this.compiled = item;
    this.updateControllerCells();
};
S.shown = function (item) {

    this.shown = item;
    this.updateControllerCells();
};

// Display cycle order attributes `compileOrder`, `showOrder` - argument should be a positive integer Number
S.compileOrder = function (item) {

    this.compileOrder = item;
    this.updateControllerCells();
};
S.showOrder = function (item) {

    this.showOrder = item;
    this.updateControllerCells();
};


// __Stash coordinates and dimensions__ - which are stored in Coordinate arrays - allow us to store, and export to an image asset, a portion of the Cell's current display which can then be used (for instance) by Pattern styles. 
// + Scrawl-canvas supplies the following _pseudo-attributes_ for dealing with the stash start coordinate (`stashX`, `stashY`) and dimensions (`stashWidth`, `stashHeight`)
// + Each of these values can be either absolute px Numbers, or relative (to the Cell's own dimensions) '%' Strings
S.stashX = function (val) {

    if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
    this.stashCoordinates[0] = val;
};
S.stashY = function (val) {

    if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
    this.stashCoordinates[1] = val;
};
S.stashWidth = function (val) {

    if (!this.stashDimensions) {

        let dims = this.currentDimensions;
        this.stashDimensions = [dims[0], dims[1]];
    }
    this.stashDimensions[0] = val;
};
S.stashHeight = function (val) {

    if (!this.stashDimensions) {

        let dims = this.currentDimensions;
        this.stashDimensions = [dims[0], dims[1]];
    }
    this.stashDimensions[1] = val;
};
D.stashX = function (val) {

    if (!this.stashCoordinates) this.stashCoordinates = [0, 0];

    let c = this.stashCoordinates;
    c[0] = addStrings(c[0], val);
};
D.stashY = function (val) {

    if (!this.stashCoordinates) this.stashCoordinates = [0, 0];

    let c = this.stashCoordinates;
    c[1] = addStrings(c[1], val);
};
D.stashWidth = function (val) {

    if (!this.stashDimensions) {

        let dims = this.currentDimensions;
        this.stashDimensions = [dims[0], dims[1]];
    }

    let c = this.stashDimensions;
    c[0] = addStrings(c[0], val);
};
D.stashHeight = function (val) {

    if (!this.stashDimensions) {

        let dims = this.currentDimensions;
        this.stashDimensions = [dims[0], dims[1]];
    }

    let c = this.stashDimensions;
    c[1] = addStrings(c[1], val);
};

S.clearAlpha = function (val) {

    if (val.toFixed) {

        if (val > 1) val = 1;
        else if (val < 0) val = 0;

        this.clearAlpha = val;
    }
};
D.clearAlpha = function (val) {

    if (val.toFixed) {

        val += this.clearAlpha;

        if (val > 1) val = 1;
        else if (val < 0) val = 0;

        this.clearAlpha = val;
    }
};


// #### Prototype functions

// `checkSource` - internal function
P.checkSource = function (width, height) {

    if (this.currentDimensions[0] !== width || this.currentDimensions[1] !== height) this.notifySubscribers();
};

// `getData` - internal function, invoked when a Cell wrapper is used as an entity's pattern style
P.getData = function (entity, cell) {

    this.checkSource(this.sourceNaturalDimensions[0], this.sourceNaturalDimensions[1]);

    return this.buildStyle(cell);
};

// `updateArtefacts` - passes the __items__ argument object through to each of the Cell's Groups for forwarding to their artefacts' `setDelta` function
P.updateArtefacts = function (items = {}) {

    this.groupBuckets.forEach(grp => {

        grp.artefactBuckets.forEach(art => {

            if (items.dirtyScale) art.dirtyScale = true;
            if (items.dirtyDimensions) art.dirtyDimensions = true;
            if (items.dirtyLock) art.dirtyLock = true;
            if (items.dirtyStart) art.dirtyStart = true;
            if (items.dirtyOffset) art.dirtyOffset = true;
            if (items.dirtyHandle) art.dirtyHandle = true;
            if (items.dirtyRotation) art.dirtyRotation = true;
            if (items.dirtyPathObject) art.dirtyPathObject = true;
        })
    });
};

// `cleanDimensionsAdditionalActions` - overwrites mixin/position function:
// + Updates the Cell's &lt;canvas> element's dimensions
// + Restores the render engine's attributes to current cell values (because the resize wipes them to default values)
// + Asks the Canvas controller to trigger an update to the Cell's `here` object
// + Tells all associated artefacts that the Cell's dimensions have changed
P.cleanDimensionsAdditionalActions = function() {

    let element = this.element;

    if (element) {

        let control = this.controller,
            current = this.currentDimensions,
            base = this.isBase;

        if (base && control && control.isComponent) {

            let controlDims = this.controller.currentDimensions,
                dims = this.dimensions;

            dims[0] = current[0] = controlDims[0];
            dims[1] = current[1] = controlDims[1];
        }

        let [w, h] = current;

        element.width = w;
        element.height = h;

        this.setEngineFromState(this.engine);

        if (base && control) control.updateBaseHere();

        if (this.groupBuckets) {

            this.updateArtefacts({
                dirtyDimensions: true,
            });
        }
    }
};


// `notifySubscriber` - Overrides mixin/asset.js function
P.notifySubscriber = function (sub) {

    if (!sub.sourceNaturalDimensions) sub.sourceNaturalDimensions = [];

    sub.sourceNaturalWidth = this.currentDimensions[0];
    sub.sourceNaturalHeight = this.currentDimensions[1];

    sub.sourceLoaded = true;
    sub.dirtyImage = true;

    sub.dirtyCopyStart = true;
    sub.dirtyCopyDimensions = true;
};


// `subscribeAction` - Overrides mixin/asset.js function
P.subscribeAction = function (sub = {}) {

    this.subscribers.push(sub);
    sub.asset = this;
    sub.source = this.element;
    this.notifySubscriber(sub)
};

// `installElement` - internal function, used by the constructor
P.installElement = function (element) {

    this.element = element;
    this.engine = this.element.getContext('2d');

    this.state = makeState({
        engine: this.engine
    });

    return this;
};

// `updateControllerCells` - internal function: ask the Cell's Canvas controller to review/update its cells data
P.updateControllerCells = function () {

    if (this.controller) this.controller.dirtyCells = true;
};

// The following functions set the Cell wrapper's &lt;canvas> element's CanvasRenderingContext2D engine's attributes to match a given set of values

// `setEngineFromState` - internal function: set engine to match this Cell's State object's attribute values
P.setEngineFromState = function (engine) {

    let state = this.state;

    state.allKeys.forEach(key => {

        if (key === 'lineDash') {

            engine.lineDash = state.lineDash;
            engine.setLineDash(engine.lineDash);
        }
        else engine[key] = state[key];

    }, state);

    engine.textAlign = state.textAlign;
    engine.textBaseline = state.textBaseline;

    return this;
};

// `setToDefaults` - internal function: set engine to match the State Factory's default attribute values
P.setToDefaults = function () {

    let items = this.state.defs,
        state = this.state,
        engine = this.engine,
        isArray = Array.isArray;

    Object.entries(items).forEach(([key, value]) => {

        if (key === 'lineDash') {

            if (!isArray(engine.lineDash)) engine.lineDash = [];
            else engine.lineDash.length = 0;

            if (!isArray(state.lineDash)) state.lineDash = [];
            else state.lineDash.length = 0;
        }
        else {

            engine[key] = value;
            state[key] = value;
        }
    });

    engine.textAlign = state.textAlign = 'left';
    engine.textBaseline = state.textBaseline = 'top';

    return this;
};

// `setEngine` - internal function: set engine to match the entity object's State attribute values
P.stylesArray = ['Gradient', 'RadialGradient', 'Pattern'];
P.setEngine = function (entity) {

    let state = this.state,
        entityState = entity.state,
        engine, item,
        changes = entityState.getChanges(entity, state),
        action = this.setEngineActions,
        stylesArray = this.stylesArray;

    if (Object.keys(changes).length) {

        engine = this.engine;

        for (item in changes) {

            action[item](changes[item], engine, stylesArray, entity, this);
            state[item] = changes[item];
        }
    }
    return entity;
};

// __setEngineActions__ - an Object containing functions for updating the engine's attributes; used by `setEngine`
P.setEngineActions = {

    fillStyle: function (item, engine, stylesArray, entity, layer) {

        if (item.substring) {

            let brokenStyle = false;

            if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
            else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

            if (brokenStyle) {
                
                entity.state.fillStyle = brokenStyle;
                engine.fillStyle = brokenStyle.getData(entity, layer);
            }
            else engine.fillStyle = item;
        }
        else engine.fillStyle = item.getData(entity, layer);
    },

    filter: function (item, engine) {
        engine.filter = item;
    },

    font: function (item, engine) {
        engine.font = item;
    },

    globalAlpha: function (item, engine) {
        engine.globalAlpha = item;
    },

    globalCompositeOperation: function (item, engine) {
        engine.globalCompositeOperation = item;
    },

    lineCap: function (item, engine) {
        engine.lineCap = item;
    },

    lineDash: function (item, engine) {

        engine.lineDash = item;

        if (engine.setLineDash) engine.setLineDash(item);
    },

    lineDashOffset: function (item, engine) {
        engine.lineDashOffset = item;
    },

    lineJoin: function (item, engine) {
        engine.lineJoin = item;
    },

    lineWidth: function (item, engine) {
        engine.lineWidth = item;
    },

    miterLimit: function (item, engine) {
        engine.miterLimit = item;
    },

    shadowBlur: function (item, engine) {
        engine.shadowBlur = item;
    },

    shadowColor: function (item, engine) {
        engine.shadowColor = item;
    },

    shadowOffsetX: function (item, engine) {
        engine.shadowOffsetX = item;
    },

    shadowOffsetY: function (item, engine) {
        engine.shadowOffsetY = item;
    },

    strokeStyle: function (item, engine, stylesArray, entity, layer) {

        if (item.substring) {

            let brokenStyle = false;

            if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
            else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

            if (brokenStyle) {
                
                entity.state.strokeStyle = brokenStyle;
                engine.strokeStyle = brokenStyle.getData(entity, layer);
            }
            else engine.strokeStyle = item;
        }
        else engine.strokeStyle = item.getData(entity, layer);
    },
};

// The following functions are used as part of entity object `stamp` functionality - specifically for those with a __method__ whose appearance is affected by shadows, and for the `clear` method
// + Scrawl-canvas, for the most part, avoids using engine.save() and engine.restore() functionality, instead preferring to keep track of engine state in State objects. 
// + When clearing and restoring shadows - a frequent operation given Scrawl-canvas functionality around stamping methods - both the Cell's state object and the Canvas context engine need to be updated with the necessary data 
// + The same reasoning holds when setting up the context engine to 'clear' an entity from the canvas display instead of stamping it onto the canvas

// `clearShadow`
P.clearShadow = function () {

    this.engine.shadowOffsetX = 0.0;
    this.engine.shadowOffsetY = 0.0;
    this.engine.shadowBlur = 0.0;
    this.state.shadowOffsetX = 0.0;
    this.state.shadowOffsetY = 0.0;
    this.state.shadowBlur = 0.0;

    return this;
};

// `restoreShadow`
P.restoreShadow = function (entity) {

    let state = entity.state;

    this.engine.shadowOffsetX = state.shadowOffsetX;
    this.engine.shadowOffsetY = state.shadowOffsetY;
    this.engine.shadowBlur = state.shadowBlur;
    this.state.shadowOffsetX = state.shadowOffsetX;
    this.state.shadowOffsetY = state.shadowOffsetY;
    this.state.shadowBlur = state.shadowBlur;

    return this;
};

// `setToClearShape`
P.setToClearShape = function () {

    this.engine.fillStyle = 'rgba(0,0,0,0)';
    this.engine.strokeStyle = 'rgba(0,0,0,0)';
    this.engine.shadowColor = 'rgba(0,0,0,0)';
    this.state.fillStyle = 'rgba(0,0,0,0)';
    this.state.strokeStyle = 'rgba(0,0,0,0)';
    this.state.shadowColor = 'rgba(0,0,0,0)';

    return this;
};

// `saveEngine`, `restoreEngine` - save and restore the Cell wrapper's &lt;canvas> element's CanvasRenderingContext2D engine's current state to/from a stack
P.saveEngine = function () {

    this.engine.save();
    return this;
};

P.restoreEngine = function () {

    this.engine.restore();
    return this;
};

// `getComputedFontSizes` - internal function - the Cell wrapper gets passed by Phrase entitys to its fontAttributes object, which then invokes it when calculating font sizes
P.getComputedFontSizes = function () {

    let host = this.getHost();

    if (host && host.domElement) {

        let em = window.getComputedStyle(host.domElement),
            rem = window.getComputedStyle(document.documentElement);

        return [parseFloat(em.fontSize), parseFloat(rem.fontSize), window.innerWidth, window.innerHeight];
    }
    return false;
}


// #### Display cycle functionality
// This functionality is triggered by the Cell's Canvas wrapper controller

// `clear`
P.clear = function () {

    const {element, engine, backgroundColor, clearAlpha, currentDimensions} = this;
    const [width, height] = currentDimensions;

    this.prepareStamp();

    engine.setTransform(1,0,0,1,0,0);

    if (backgroundColor) {

        let tempBackground = engine.fillStyle,
            tempGCO = engine.globalCompositeOperation,
            tempAlpha = engine.globalAlpha;

        engine.fillStyle = backgroundColor;
        engine.globalCompositeOperation = 'source-over';
        engine.globalAlpha = 1;
        engine.fillRect(0, 0, width, height);
        engine.fillStyle = tempBackground;
        engine.globalCompositeOperation = tempGCO;
        engine.globalAlpha = tempAlpha;
    }
    else if (clearAlpha) {

        let tempCell = requestCell();
        
        let {engine:tempEngine, element:tempEl} = tempCell;

        tempEl.width = width;
        tempEl.height = height;

        let data = engine.getImageData(0, 0, width, height);
        tempEngine.putImageData(data, 0, 0);

        let oldAlpha = engine.globalAlpha;

        engine.clearRect(0, 0, width, height);
        engine.globalAlpha = clearAlpha;
        engine.drawImage(tempEl, 0, 0);
        engine.globalAlpha = oldAlpha;
    }
    else engine.clearRect(0, 0, width, height);
};

// `compile`
P.compile = function(){

    let mystash = this.stashOutput;

    this.sortGroups();
    this.prepareStamp();

    if(this.dirtyFilters || !this.currentFilters) this.cleanFilters();

    this.groupBuckets.forEach(grp => {

        if (grp && grp.stamp) grp.stamp();
    });

    if (!this.noFilters && this.filters && this.filters.length) this.applyFilters();
    this.stashOutputAction();
};

// `show` - Note that functionality here differs for __base cells__ and other Cell wrappers
P.show = function () {

    // get the destination cell's canvas context
    let host = this.getHost(),
        engine = (host && host.engine) ? host.engine : false;

    if (engine) {

        let floor = Math.floor,
            hostDimensions = host.currentDimensions,
            destWidth = floor(hostDimensions[0]),
            destHeight = floor(hostDimensions[1]);

        // Cannot draw to the destination canvas if either of its dimensions === 0
        // - Test on Demo component-002
        if (!destWidth || !destHeight) return false;

        let { currentScale:scale, currentDimensions, composite, alpha, controller, element, isBase, currentStampHandlePosition:handle, currentStampPosition:stamp } = this;

        let curWidth = floor(currentDimensions[0]),
            curHeight = floor(currentDimensions[1]),
            paste;

        engine.save();
        engine.setTransform(1, 0, 0, 1, 0, 0);
            
        engine.filter = this.filter;

        if (isBase) {

            if (!this.basePaste) this.basePaste = [];
            paste = this.basePaste;

            // copy the base canvas over to the display canvas. This copy operation ignores any scale, roll or position attributes set on the base cell, instead complying with the controller's fit attribute requirements
            this.prepareStamp();

            engine.globalCompositeOperation = 'source-over';
            engine.globalAlpha = 1;
            engine.clearRect(0, 0, destWidth, destHeight);

            engine.globalCompositeOperation = composite;
            engine.globalAlpha = alpha;

            let fit = (controller) ? controller.fit : 'none',
                relWidth, relHeight;

            switch (fit) {

                case 'contain' :
                    // base must copy into display resized, centered, letterboxing if necessary, maintaining aspect ratio
                    relWidth = destWidth / (curWidth || 1);
                    relHeight = destHeight / (curHeight || 1);

                    if (relWidth > relHeight) {

                        paste[0] = floor((destWidth - (curWidth * relHeight)) / 2);
                        paste[1] = 0;
                        paste[2] = floor(curWidth * relHeight);
                        paste[3] = floor(curHeight * relHeight);
                    }
                    else {

                        paste[0] = 0;
                        paste[1] = floor((destHeight - (curHeight * relWidth)) / 2);
                        paste[2] = floor(curWidth * relWidth);
                        paste[3] = floor(curHeight * relWidth);
                    }
                    break;

                case 'cover' :
                    // base must copy into display resized, centered, leaving no letterbox area, maintaining aspect ratio
                    relWidth = destWidth / (curWidth || 1);
                    relHeight = destHeight / (curHeight || 1);

                    if (relWidth < relHeight) {

                        paste[0] = floor((destWidth - (curWidth * relHeight)) / 2);
                        paste[1] = 0;
                        paste[2] = floor(curWidth * relHeight);
                        paste[3] = floor(curHeight * relHeight);
                    }
                    else{

                        paste[0] = 0;
                        paste[1] = floor((destHeight - (curHeight * relWidth)) / 2);
                        paste[2] = floor(curWidth * relWidth);
                        paste[3] = floor(curHeight * relWidth);
                    }
                    break;

                case 'fill' :
                    // base must copy into display resized, distorting the aspect ratio as necessary
                    paste[0] = 0;
                    paste[1] = 0;
                    paste[2] = floor(destWidth);
                    paste[3] = floor(destHeight);
                    break;

                case 'none' :
                default :
                    // base copies into display as-is, centred, maintaining aspect ratio
                    paste[0] = floor((destWidth - curWidth) / 2);
                    paste[1] = floor((destHeight - curHeight) / 2);
                    paste[2] = curWidth;
                    paste[3] = curHeight;
            }
        }
        else if (scale > 0) {

            if (!this.paste) this.paste = [];
            paste = this.paste;

            // Cell canvases are treated like entitys on the base canvas: they can be positioned, scaled and rotated. Positioning will respect lockTo; flipReverse and flipUpend; and can be pivoted to other artefacts, or follow a path entity, etc. If pivoted to the mouse, they will use the base canvas's .here attribute, which takes into account differences between the base and display canvas dimensions.

            if (!this.noDeltaUpdates) this.setDelta(this.delta);

            this.prepareStamp();

            engine.globalCompositeOperation = composite;
            engine.globalAlpha = alpha;

            paste[0] = floor(-handle[0] * scale);
            paste[1] = floor(-handle[1] * scale);
            paste[2] = floor(curWidth * scale);
            paste[3] = floor(curHeight * scale);

            this.rotateDestination(engine, ...stamp);
        }
        engine.drawImage(element, 0, 0, curWidth, curHeight, ...paste);
        engine.restore();
    }
};


// `applyFilters` - Internal function - add filters to the Cell's current output.
P.applyFilters = function () {

    let engine = this.engine,
        image, worker;

    image = engine.getImageData(0, 0, this.currentDimensions[0], this.currentDimensions[1]);
    worker = requestFilterWorker();

    // NEED TO POPULATE IMAGE FILTER ACTION OBJECTS WITH THEIR ASSET'S IMAGEDATA AT THIS POINT
    this.preprocessFilters(this.currentFilters);

    let img = actionFilterWorker(worker, {
        image: image,
        filters: this.currentFilters
    });

    if (img) engine.putImageData(img, 0, 0);
};


// `stashOutputAction` - Internal function - stash the Cell's current output. While this function can be called at any time, the simplest way to invoke it is to set the Cell's __stashOutput__ flag to true, which will then invoke this function at the end of the compile step of the Display cycle (after any filters have been applied to the cell display).
// + The simplest way to set the stashOutput flag is to call `scrawl.createImageFromCell(cellName_or_cellObject, stashOutputAsAsset_flag)` from the user code.
// + We can limit the area of the cell display to be stashed by setting the Cell's __stashX__, __stashY__, __stashWidth__ and __stashHeight__ values appropriately. These can all be either absolute (positive) number values, or %String number values relative to the Cell element's dimensions.
// + We store the generated imageData object into the Cell object's __stashedImageData__ attribute.
// + If we are also stashing an image, an &lt;img> element will be generated and stored in the Cell object's __stashedImage__ attribute. We also generate an imageAsset wrapper for the object that will have the name `cellname+'-image'`, which gets added to the assets section of the Scrawl-canvas library.
P.stashOutputAction = function () {

    if (this.stashOutput) {

        this.stashOutput = false;

        let { currentDimensions, stashCoordinates, stashDimensions, engine } = this;

        let [cellWidth, cellHeight] = currentDimensions;

        let stashX = (stashCoordinates) ? stashCoordinates[0] : 0, 
            stashY = (stashCoordinates) ? stashCoordinates[1] : 0, 
            stashWidth = (stashDimensions) ? stashDimensions[0] : cellWidth, 
            stashHeight = (stashDimensions) ? stashDimensions[1] : cellHeight;

        // Keep the stashed image within bounds of the Cell's dimensions.
        if (stashWidth.substring || stashHeight.substring || stashX.substring || stashY.substring || stashX || stashY || stashWidth !== cellWidth || stashHeight !== cellHeight) {

            if (stashWidth.substring) stashWidth = (parseFloat(stashWidth) / 100) * cellWidth;
            if (isNaN(stashWidth) || stashWidth <= 0) stashWidth = 1;
            if (stashWidth > cellWidth) stashWidth = cellWidth;

            if (stashHeight.substring) stashHeight = (parseFloat(stashHeight) / 100) * cellHeight;
            if (isNaN(stashHeight) || stashHeight <= 0) stashHeight = 1;
            if (stashHeight > cellHeight) stashHeight = cellHeight;

            if (stashX.substring) stashX = (parseFloat(stashX) / 100) * cellWidth;
            if (isNaN(stashX) || stashX < 0) stashX = 0;
            if (stashX + stashWidth > cellWidth) stashX = cellWidth - stashWidth;

            if (stashY.substring) stashY = (parseFloat(stashY) / 100) * cellHeight;
            if (isNaN(stashY) || stashY < 0) stashY = 0;
            if (stashY + stashHeight > cellHeight) stashY = cellHeight - stashHeight;
        }

        // Get the imageData object, and stash it
        engine.save();
        engine.setTransform(1, 0, 0, 1, 0, 0);
        this.stashedImageData = engine.getImageData(stashX, stashY, stashWidth, stashHeight);
        engine.restore();

        // Get the dataUrl String, updating the stashed &lt;img> element with it
        if (this.stashOutputAsAsset) {

            this.stashOutputAsAsset = false;

            let sourcecanvas, mycanvas;
                
            mycanvas = requestCell();
            sourcecanvas = mycanvas.element;

            sourcecanvas.width = stashWidth;
            sourcecanvas.height = stashHeight;

            mycanvas.engine.putImageData(this.stashedImageData, 0, 0);

            if (!this.stashedImage) {

                let newimg = this.stashedImage = document.createElement('img');

                newimg.id = `${this.name}-image`;

                newimg.onload = function () {

                    scrawlCanvasHold.appendChild(newimg);
                    importDomImage(`#${newimg.id}`);
                };

                newimg.src = sourcecanvas.toDataURL();
            }
            else this.stashedImage.src = sourcecanvas.toDataURL();

            releaseCell(mycanvas);
        }
    }
};


// `getHost` - Internal function - get a reference to the Cell's current host (where it will be stamping itself as part of the Display cycle).
// + Note that Cells can (in theory: not tested yet) belong to more than one Canvas object Group - they can be used in multiple &lt;canvas> elements, thus the need to check which canvas is the current host at this point in the Display cycle.
P.getHost = function () {

    if (this.currentHost) return this.currentHost;
    else if (this.host) {

        let host = asset[this.host] || artefact[this.host];

        if (host) this.currentHost = host;
        
        return (host) ? this.currentHost : false;
    }
    return false;
};


// `updateBaseHere` - Internal function - keeping the Canvas object's 'base' Cell's `.here` attribute up-to-date with accurate mouse/pointer/touch cursor data
P.updateBaseHere = function (controllerHere, fit) {

    if (this.isBase) {

        if (!this.here) this.here = {};
        let here = this.here,
            dims = this.currentDimensions;

        let active = controllerHere.active;

        let controllerWidth = (controllerHere.localListener) ? controllerHere.originalWidth : controllerHere.w;
        let controllerHeight = (controllerHere.localListener) ? controllerHere.originalHeight : controllerHere.h;

        if (dims[0] !== controllerWidth || dims[1] !== controllerHeight) {

            if (!this.basePaste) this.basePaste = [];

            let pasteX = this.basePaste[0];

            let localWidth = dims[0],
                localHeight = dims[1],
                remoteWidth = controllerWidth,
                remoteHeight = controllerHeight,
                remoteX = controllerHere.x,
                remoteY = controllerHere.y;

            let relWidth = localWidth / remoteWidth || 1,
                relHeight = localHeight / remoteHeight || 1,
                round = Math.round,
                offsetX, offsetY;

            here.w = localWidth;
            here.h = localHeight;

            switch (fit) {

                case 'contain' :
                case 'cover' :

                    if (pasteX) {

                        offsetX = (remoteWidth - (localWidth / relHeight)) / 2;

                        here.x = round((remoteX - offsetX) * relHeight);
                        here.y = round(remoteY * relHeight);
                    }
                    else {

                        offsetY = (remoteHeight - (localHeight / relWidth)) / 2;

                        here.x = round(remoteX * relWidth);
                        here.y = round((remoteY - offsetY) * relWidth);
                    }
                    break;

                case 'fill' :
                    here.x = round(remoteX * relWidth);
                    here.y = round(remoteY * relHeight);
                    break;

                case 'none' :
                default :
                    offsetX = (remoteWidth - localWidth) / 2;
                    offsetY = (remoteHeight - localHeight) / 2;

                    here.x = round(remoteX - offsetX);
                    here.y = round(remoteY - offsetY);
            }

            if (here.x < 0 || here.x > localWidth) active = false;
            if (here.y < 0 || here.y > localHeight) active = false;

            here.active = active;
        }
        else {

            here.x = controllerHere.x;
            here.y = controllerHere.y;
            here.w = controllerWidth;
            here.h = controllerHeight;
            here.active = active;
        }
        controllerHere.baseActive = active;
    }
};


// `prepareStamp` - Internal function - steps to be performed before the Cell stamps its visual contents onto a Canvas object's base cell's canvas. Will be invoked as part of the Display cycle 'show' functionality.
// + Cells can emulate (much of) the functionality of entity artefacts, in that they can be positioned (start, handle, offset), rotated, scaled and flipped when they stamp themselves on the base cell. They can also be positioned using mimic, pivot, path and mouse functionality.
// + Cells cannot be included in Group objects (which only accept artefacts as members); however drag-and-drop functionality can be emulated by creating a Block and pivot/mimic the Cell to that. Similarly, Block substitutes can be used for hover detection, with their hook functions tailored to pass on the required response to the Cell - see Demo [Canvas-036](../../demo/canvas-036.html).
// + Note that Cells acting as a Canvas object's 'base' cell will position themselves on the displayed Canvas in line with their Canvas controller's 'fit' attribute, disregarding any positional information it may have been given.
P.prepareStamp = function () {

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

    if (this.dirtyScale) this.cleanScale();

    if (this.dirtyDimensions) {

        this.cleanDimensions();
        this.dirtyAssetSubscribers = true;
    }

    if (this.dirtyLock) this.cleanLock();
    if (this.dirtyStart) this.cleanStart();
    if (this.dirtyOffset) this.cleanOffset();
    if (this.dirtyHandle) this.cleanHandle();
    if (this.dirtyRotation) this.cleanRotation();

    if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {

        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    }

    if (this.dirtyStampPositions) this.cleanStampPositions();
    if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

    if (this.dirtyPathObject) this.cleanPathObject();

    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

    if (this.dirtyAssetSubscribers) {

        this.dirtyAssetSubscribers = false;
        this.notifySubscribers();
    }
};

// `cleanPathObject` - Calculate the Cell's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        let p = this.pathObject = new Path2D();
        
        let handle = this.currentStampHandlePosition,
            scale = this.currentScale,
            dims = this.currentDimensions;

        let x = -handle[0] * scale,
            y = -handle[1] * scale,
            w = dims[0] * scale,
            h = dims[1] * scale;

        p.rect(x, y, w, h);
    }
};


// `updateHere` - Internal function - get the Cell to update its .here information
P.updateHere = function () {

    if (!this.here) this.here = {};

    let localHere = this.here;

    let [width, height] = this.currentDimensions;

    localHere.w = width;
    localHere.h = height;
    localHere.x = -10000;
    localHere.y = -10000;
    localHere.active = false;

    let host = this.currentHost;

    if (host) {

        let hostHere = host.here;

        if (hostHere && hostHere.active) {

            let {x:hostX, y:hostY, w:hostWidth, h:hostHeight} = hostHere;

            if (!this.pathObject || this.dirtyPathObject) this.cleanPathObject();

            let tempCell = requestCell();
            let tempEngine = tempCell.engine;

            let [stampX, stampY] = this.currentStampPosition;

            tempCell.rotateDestination(tempEngine, stampX, stampY, this);

            let active = tempEngine.isPointInPath(this.pathObject, hostX, hostY);

            releaseCell(tempCell);

            localHere.active = active;

            if (active) {

                let [stampHandleX, stampHandleY] = this.currentStampHandlePosition;

                let {flipUpend, flipReverse, roll, scale} = this;

                if (scale) {

                    let left = ((hostX - stampX) / scale),
                        top = ((hostY - stampY) / scale);

                    if (flipReverse) left = -left;
                    if (flipUpend) top = -top;

                    if (roll) {

                        if ((flipReverse && !flipUpend) || (!flipReverse && flipUpend)) roll = -roll;

                        let coord = requestCoordinate(left, top);
                        coord.rotate(-roll);

                        [left, top] = coord;

                        releaseCoordinate(coord);
                    }

                    left += stampHandleX;
                    top += stampHandleY;

                    localHere.x = left;
                    localHere.y = top;
                }
            }
        }
    }
};


// `getEntityHits` - Returns an array of entity Objects responding 'true' to a checkHit call on them, for the Cell's current `.here` attribute coordinates. Used in particular with `Canvas.cascadeEventAction()` function
P.getEntityHits = function () {

    let response = [],
        results = [],
        resultNames = [];

    if (this.groupBuckets) {

        this.groupBuckets.forEach(grp => {
            if (grp.visibility) results.push(grp.getAllArtefactsAt(this.here));
        }, this);
    }

    if (results.length) {

        results = results.reduce((a, v) => a.concat(v), []);

        results.forEach(item => {

            let art = item.artefact;

            if (art.visibility && resultNames.indexOf(art.name) < 0) {

                resultNames.push(art.name);
                response.push(art);
            }
        })
    }
    return response;
};


// `rotateDestination` - internal function, called by entity objects about to stamp themselves onto the Cell.
// + entity stamp functionality works by performing a `setTransform` action on the Cell engine so that engine coordinates [0, 0] equal the entity's `currentStampPosition` coordinates, alongside any directionality (`flipReverse`, `flipUpend`) and rotational (`roll`) changes necessary
// + doing it this way saves a massive amount of calculation that is otherwise required to correctly position the entity in the display
P.rotateDestination = function (engine, x, y, entity) {

    let self = (entity) ? entity : this,
        mimic = self.mimic,
        pivot = self.pivot,
        reverse, upend,
        rotation = self.currentRotation;

    if (mimic && mimic.name && self.useMimicFlip) {

        reverse = (mimic.flipReverse) ? -1 : 1;
        upend = (mimic.flipUpend) ? -1 : 1;
    }
    else {

        reverse = (self.flipReverse) ? -1 : 1;
        upend = (self.flipUpend) ? -1 : 1;
    }

    if (mimic && mimic.name && self.useMimicRotation) {

        rotation = mimic.currentRotation;
    }
    else if (pivot && pivot.name && self.addPivotRotation) {

        rotation = pivot.currentRotation;
    }

    if (rotation) {

        rotation *= radian;

        let cos = Math.cos(rotation),
            sin = Math.sin(rotation);

        engine.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), x, y);
    }
    else engine.setTransform(reverse, 0, 0, upend, x, y);

    return this;
};


// #### Cell pool
// A number of processes - for instance collision functionality, and applying filters to entitys and groups - require the use of a &lt;canvas> element and its CanvasRenderingContext2D engine. Rather than generate these canvas elements on the fly, we store them in a pool, to help make the code more efficiant.
//
// To use a pool cell, request it using the exposed __requestCell__ function.
//
// IT IS IMPERATIVE that requested cells are released once work with them completes, using the __releaseCell__ function. Failure to do this leads to impaired performance as Javascript creates new canvas elements (often in multiples of 60 per second) which need to be garbage collected by the Javascript engine, thus leading to increasingly shoddy performance the longer the animation runs.
const cellPool = [];

P.poolDefs = {
    element: null,
    engine: null,
    state: null,
    width: 300,
    height: 100,
    alpha: 1,
    composite: 'source-over',
}

// `Exported function` - __requestCell__
const requestCell = function () {

    if (!cellPool.length) {

        cellPool.push(makeCell({
            name: `pool_${generateUniqueString()}`,
            isPool: true
        }));
    }

    return cellPool.shift();
};

// `Exported function` - __releaseCell__
const releaseCell = function (c) {

    if (c && c.type === 'Cell') {

        c.engine.setTransform(1,0,0,1,0,0);
        cellPool.push(c.setToDefaults());
    }
};


// #### Factory
const makeCell = function (items) {

    return new Cell(items);
};

constructors.Cell = Cell;


// #### Exports
export {
    makeCell,
    requestCell,
    releaseCell,
};
