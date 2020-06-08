// # Oval factory
// Path-defined entitys represent a diverse range of shapes rendered onto a DOM &lt;canvas> element using the Canvas API's [Path2D interface](https://developer.mozilla.org/en-US/docs/Web/API/Path2D). They use the [shapeBasic](../mixin/shapeBasic.html) and [shapePathCalculation](../mixin/shapePathCalculation.html) (some also use [shapeCurve](../mixin/shapeCurve.html)) mixins to define much of their functionality.
// 
// All path-defined entitys can be positioned, cloned, filtered etc:
// + Positioning functionality for the entity is supplied by the __position__ mixin, while rendering functionality comes from the __entity__ mixin. 
// + Dimensions, however, have little meaning for path-defined entitys - their width and height are determined by their SVG path data Strings; use `scale` instead.
// + Path-defined entitys can use CSS color Strings for their fillStyle and strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects. 
// + They will also accept __Filter__ objects.
// + They can use __Anchor__ objects for user navigation. 
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__. 
// + They can be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Path-defined entitys can be cloned, and killed.


// #### Using path-defined entitys as Scrawl-canvas paths
// A path is a track - straight, or curved, or as complex as required - placed across a container which artefacts can use as a source of their positioning data. We can animate an artifact to move along the path:
// + To enable a path-defined entity to be used as a path by other artefacts, set its `useAsPath` flag to `true`.
// + The artefact can then set its `path` attribute to the path-defined entity's name-String (or the entity itself), and set its `lockTo` Array values to `"path"`.
// + We position the artefact by setting its `pathPosition` attribute to a float Number value between `0.0 - 1.0`, with `0` being the start of the path, and `1` being its end.
// + Path-defined entitys can use other path-defined entitys as a path.
// + Phrase entitys can use a path to position their text block; they can also use a path to position each letter individually along the path.
// + Artefacts (and letters) can be rotated so that they match the rotation at that point along the path - ___tangential rotation___ by setting their `addPathRotation` flag to `true`.
// + Animate an artefact along the path by either using the artefact's `delta` object, or triggering a Tween to perform the movement.


// #### Demos:
// + [Canvas-011](../../demo/canvas-011.html) - Shape entity (make, clone, method); drag and drop shape entitys
// + [Canvas-012](../../demo/canvas-012.html) - Shape entity position; shape entity as a path for other artefacts to follow
// + [Canvas-013](../../demo/canvas-013.html) - Path-defined entitys: oval, rectangle, line, quadratic, bezier, tetragon, polygon, star, spiral
// + [Canvas-014](../../demo/canvas-014.html) - Line, quadratic and bezier entitys - control lock alternatives
// + [Canvas-018](../../demo/canvas-018.html) - Phrase entity - text along a path
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';


// #### Oval constructor
const Oval = function (items = {}) {

    this.shapeInit(items);
    return this;
};


// #### Oval prototype
let P = Oval.prototype = Object.create(Object.prototype);
P.type = 'Oval';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [shapeBasic](../mixin/shapeBasic.html)
P = baseMix(P);
P = shapeMix(P);


// #### Oval attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil, filterAlpha, filterComposite__.
// + Attributes defined in the [shapeBasic mixin](../mixin/shapeBasic.html): __species, useAsPath, precision, pathDefinition, showBoundingBox, boundingBoxColor, minimumBoundingBoxDimensions, constantPathSpeed__.
let defaultAttributes = {

    radiusX: 5,
    radiusY: 5,
    intersectX: 0.5,
    intersectY: 0.5,
    offshootA: 0.55,
    offshootB: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let S = P.setters,
    D = P.deltaSetters;

S.radius = function (item) {

    this.setRectHelper(item, ['radiusX', 'radiusY']);
};
S.radiusX = function (item) {

    this.setRectHelper(item, ['radiusX']);
};
S.radiusY = function (item) {

    this.setRectHelper(item, ['radiusY']);
};
D.radius = function (item) {

    this.deltaRectHelper(item, ['radiusX', 'radiusY']);
};
D.radiusX = function (item) {

    this.deltaRectHelper(item, ['radiusX']);
};
D.radiusY = function (item) {

    this.deltaRectHelper(item, ['radiusY']);
};

S.offshootA = function (item) {

    this.offshootA = item;
    this.updateDirty();
};
S.offshootB = function (item) {

    this.offshootB = item;
    this.updateDirty();
};
D.offshootA = function (item) {

    if (item.toFixed) {

        this.offshootA += item;
        this.updateDirty();
    }
};
D.offshootB = function (item) {

    if (item.toFixed) {

        this.offshootB += item;
        this.updateDirty();
    }
};

S.intersectA = function (item) {

    this.intersectA = item;
    this.updateDirty();
};
S.intersectB = function (item) {

    this.intersectB = item;
    this.updateDirty();
};
D.intersectA = function (item) {

    if (item.toFixed) {

        this.intersectA += item;
        this.updateDirty();
    }
};
D.intersectB = function (item) {

    if (item.toFixed) {

        this.intersectB += item;
        this.updateDirty();
    }
};


// #### Prototype functions

// `setRectHelper` - internal setter helper function
P.setRectHelper = function (item, corners) {

    this.updateDirty();

    corners.forEach(corner => {

        this[corner] = item;
    }, this);
};

// `deltaRectHelper` - internal setter helper function
P.deltaRectHelper = function (item, corners) {

    this.updateDirty();

    corners.forEach(corner => {

        this[corner] = addStrings(this[corner], item);
    }, this);
};


// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;

    let p = 'M0,0';
    p = this.makeOvalPath();

    this.pathDefinition = p;
};


// `makeOvalPath` - internal helper function - called by `cleanSpecies`
P.makeOvalPath = function () {

    let A = parseFloat(this.offshootA.toFixed(6)),
        B = parseFloat(this.offshootB.toFixed(6)),
        radiusX = this.radiusX,
        radiusY = this.radiusY,
        width, height;

    if (radiusX.substring || radiusY.substring) {

        let here = this.getHere();

        let rx = (radiusX.substring) ? (parseFloat(radiusX) / 100) * here.w : radiusX,
            ry = (radiusY.substring) ? (parseFloat(radiusY) / 100) * here.h : radiusY;

        width = rx * 2;
        height = ry * 2;
    }
    else {

        width = radiusX * 2;
        height = radiusY * 2;
    }

    let port = parseFloat((width * this.intersectX).toFixed(2)),
        starboard = parseFloat((width - port).toFixed(2)),
        fore = parseFloat((height * this.intersectY).toFixed(2)),
        aft = parseFloat((height - fore).toFixed(2));

    let myData = `m0,0`;

    myData += `c${starboard * A},${fore * B} ${starboard - (starboard * B)},${fore - (fore * A)}, ${starboard},${fore} `;
    myData += `${-starboard * B},${aft * A} ${-starboard + (starboard * A)},${aft - (aft * B)} ${-starboard},${aft} `;
    myData += `${-port * A},${-aft * B} ${-port + (port * B)},${-aft + (aft * A)} ${-port},${-aft} `;
    myData += `${port * B},${-fore * A} ${port - (port * A)},${-fore + (fore * B)} ${port},${-fore}z`;

    return myData;
};

P.calculateLocalPathAdditionalActions = function () {

    let [x, y, w, h] = this.localBox;

    this.pathDefinition = this.pathDefinition.replace('m0,0', `m${-x},${-y}`);

    this.pathCalculatedOnce = false;

    // ALWAYS, when invoking `calculateLocalPath` from `calculateLocalPathAdditionalActions`, include the second argument, set to `true`! Failure to do this leads to an infinite loop which will make your machine weep.
    // + We need to recalculate the local path to take into account the offset required to put the Oval entity's start coordinates at the top-left of the local box, and to recalculate the data used by other artefacts to place themselves on, or move along, its path.
    this.calculateLocalPath(this.pathDefinition, true);
};


// #### Factories

// ##### makeOval
// Scrawl-canvas uses quadratic curves internally to create the curved path. 
// + The _bend_ of these curves is set by the quadratic's control point which doesn't have its own coordinate but is rather calculated using two float Number variables: __offshootA__ (default: `0.55`) and __offshootB__ (default: `0`) - change these values to make the quarter-curves more or less bendy.
// + The main shape of the oval is determined by differing radius lengths in the `x` and `y` directions, as set by the attributes __radiusX__ and __radiusY__; to set both radiuses to the same value, use ____radius____ instead.
// + The radius values can be: _absolute_ (using Number values); or _relative_ using %-String values - with the y radius representing a portion of the Cell container's height and the x radius the Cell's width.
// + The radiuses (as diameter lines) cross in the middle of the oval shape. We can move the position of where the intersection happens by setting a float Number value between `0.0 - 1.0` (or beyond those limits) for the __intersectX__ and __intersectY__ attributes. 
// + `intersectX` (default: `0.5`) represents the point at which the `y` diameter crosses the `x` diameter, with `0` being the left end and `1` being the right end.
// + `intersectY` (default: `0.5`) represents the point at which the `x` diameter crosses the `y` diameter, with `0` being the top end and `1` being the bottom end.
//
// ```
// scrawl.makeOval({
//
//     name: 'egg',
//
//     fillStyle: 'lightGreen',
//     method: 'fillAndDraw',
//
//     startX: 20,
//     startY: 20,
//
//     radiusX: '7%',
//     radiusY: '3%',
//
//     intersectY: 0.6,
// });
// ```
const makeOval = function (items = {}) {

    items.species = 'oval';
    return new Oval(items);
};

constructors.Oval = Oval;


// #### Exports
export {
    makeOval,
};