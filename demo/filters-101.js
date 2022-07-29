// # Demo Filters 101 
// Compound filters: Glass bars/rings, Displace bars/rings, Etching, Green monitor

// [Run code](../../demo/filters-101.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

// The base cell needs to compile after the helper cells we're about to create
canvas.setBase({
    compileOrder: 1,
});


// #### Gradients and pattern definitions
// We display the gradients in a Block entity, in a dedicated Cell
// + The Cell will act as a pattern source for entitys elsewhere
// + Because we're using it as a pattern, the Cell comes with a pattern matrix
// + The pattern matrix lets us warp and stretch the pattern to meet our needs
const patternCell = canvas.buildCell({

    name: 'bar-cell-pattern',
    dimensions: [80, 80],
    shown: false,
    useAsPattern: true,
    skewX: 0,
    stretchX: 1,
    shiftX: 0,
    skewY: 0,
    stretchY: 1,
    shiftY: 0,
});

const barGradient = scrawl.makeGradient({

    name: 'bar-cell-gradient',
    endX: '100%',

    colors: [
        [0, 'transparent'],
        [199, 'transparent'],
        [499, 'white'],
        [799, 'transparent'],
        [999, 'transparent'],
    ],
});

const ringGradient = scrawl.makeRadialGradient({

    name: 'ring-cell-gradient',
    startX: '50%',
    startY: '50%',
    endX: '50%',
    endY: '50%',

    startRadius: '0%',
    endRadius: '50%',

    colors: [
        [0, 'transparent'],
        [199, 'transparent'],
        [499, 'white'],
        [799, 'transparent'],
        [999, 'transparent'],
    ],
});

const updateGradients = (items) => {

    barGradient.set(items);
    ringGradient.set(items);
};

const filterBlock = scrawl.makeBlock({

    name: 'bar-cell-box',
    group: 'bar-cell-pattern',
    dimensions: ['100%', '100%'],
    fillStyle: 'bar-cell-gradient',
});


// #### Build an image source for our compound filter
// We can use anything that generates image data as part of our filter
// + This includes a new Cell, which will display a Block entity
// + The Block entity uses our pattern Cell for its `fillStyle` attribute
const filterCell = canvas.buildCell({

    name: 'bar-cell',
    dimensions: ['100%', '100%'],
    shown: false,
});

scrawl.makeBlock({

    name: 'bar-base-box',
    group: 'bar-cell',
    dimensions: ['100%', '100%'],
    fillStyle: 'bar-cell-pattern',
});


// #### Filter definitions
// Define our filters - we'll populate them with actions data later
const glassBarsFilter = scrawl.makeFilter({ name: 'glass-bars' }),
    displaceBarsFilter = scrawl.makeFilter({ name: 'displace-bars' }),
    etchingFilter = scrawl.makeFilter({ name: 'etching' }),
    greenMonitorFilter = scrawl.makeFilter({ name: 'green-monitor' });

// We define some variables and helper functions here, to cut down on code
let fOffsetX = 0,
    fOffsetY = 0,
    fOpacity = 1,
    fBlend = 'multiply',
    fDisplaceX = 10,
    fDisplaceY = 10;

// All the examples make use of the gradient pattern; this filter loads it into the engine
const getProcessImageFilter = () => {
    return [{
        action: 'process-image',
        asset: 'bar-cell',
        width: '100%',
        height: '100%',
        copyWidth: '100%',
        copyHeight: '100%',
        lineOut: 'bars',
    }];
};

// Three of the examples use a blend filter to merge the gradient pattern into the image
const getBlendFilter = () => {
    return [{
        action: 'blend',
        lineMix: 'bars',
        blend: fBlend,
        offsetX: fOffsetX,
        offsetY: fOffsetY,
        opacity: fOpacity,
    }];
};

// This uses the gradient pattern as a displacement map for the displace filter
const getDisplaceFilter = () => {
    return [{
        action: 'displace',
        lineMix: 'bars',
        offsetX: fOffsetX,
        offsetY: fOffsetY,
        opacity: fOpacity,
        scaleX: fDisplaceX,
        scaleY: fDisplaceY,
    }];
};

// Filters to configure the image (make it green) before applying the blend filter
const getMonitorFilter = () => {
    return [{
        action: 'grayscale',
    }, {
        action: 'modulate-channels',
        red: 0,
        green: 1.3,
        blue: 0,
    }];
};

// Filters to configure the image (give it a black-white drawing effect) before applying the blend filter
const getEtchFilter = () => {
    return [{
        action: 'grayscale',
    }, {
        action: 'gaussian-blur',
        radius: 1,
    }, {
        action: 'matrix',
        weights: [1, 1, 1, 1, -8, 1, 1, 1, 1],
    }, {
        action: 'invert-channels',
    }, {
        action: 'threshold',
        level: 252,
    }];
};

// Helper function to update filter action arrays with user choices
const updateFilters = () => {

    glassBarsFilter.set({
        actions: [
            ...getProcessImageFilter(),
            ...getBlendFilter(),
        ],
    });

    displaceBarsFilter.set({
        actions: [
            ...getProcessImageFilter(),
            ...getDisplaceFilter(),
        ],
    });

    etchingFilter.set({
        actions: [
            ...getProcessImageFilter(),
            ...getEtchFilter(),
            ...getBlendFilter(),
        ],
    });

    greenMonitorFilter.set({
        actions: [
            ...getProcessImageFilter(),
            ...getMonitorFilter(),
            ...getBlendFilter(),
        ],
    });
};

// Initial filter build
updateFilters();


// #### Build the scene
// The initial image
scrawl.importDomImage('.flowers');

// We need something to apply our filters to
const target = scrawl.makePicture({

    name: 'target-image',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['glass-bars'],
});

// Add some Drag-and-Drop image loading functionality
// + So users can check the filter effects against different images
addImageDragAndDrop(canvas, '#my-image-store', target);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Filter dimensions - 
        width: ${filterWidth.value}%; height: ${filterHeight.value}%
    Filter offset - 
        x: ${filterOffsetX.value}px; y: ${filterOffsetY.value}px
    Pattern dimensions - 
        width: ${patternWidth.value}px; height: ${patternHeight.value}px
    Pattern matrix -
        shiftX: ${shiftX.value}; shiftY: ${shiftY.value}
        skewX: ${skewX.value}; skewY: ${skewY.value}
        stretchX: ${stretchX.value}; stretchY: ${stretchY.value}
    Displace filter scaling - 
        x: ${filterScaleX.value}; y: ${filterScaleY.value}
    Opacity: ${opacity.value}`;
});

// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Update pattern values
scrawl.observeAndUpdate({

    event: ['change', 'input'],
    origin: '.patternCell',

    target: patternCell,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        'pattern-width': ['width', 'round'],
        'pattern-height': ['height', 'round'],
        shiftX: ['shiftX', 'round'],
        shiftY: ['shiftY', 'round'],
        skewX: ['skewX', 'float'],
        skewY: ['skewY', 'float'],
        stretchX: ['stretchX', 'float'],
        stretchY: ['stretchY', 'float'],
    },
});

// Update filter dimensions
scrawl.observeAndUpdate({

    event: ['change', 'input'],
    origin: '.filterCell',

    target: filterCell,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        'filter-width': ['width', '%'],
        'filter-height': ['height', '%'],
    },
});

// Update gradient choice
scrawl.observeAndUpdate({

    event: ['change', 'input'],
    origin: '.filterBlock',

    target: filterBlock,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        patternGradient: ['fillStyle', 'raw'],
    },
});

// Update filter offset, opacity, blend choices
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    switch (t.id) {

        case 'filter-offset-x' :
            fOffsetX = parseInt(value, 10);
            break;

        case 'filter-offset-y' :
            fOffsetY = parseInt(value, 10);
            break;

        case 'filter-scale-x' :
            fDisplaceX = parseInt(value, 10);
            break;

        case 'filter-scale-y' :
            fDisplaceY = parseInt(value, 10);
            break;

        case 'opacity' :
            fOpacity = parseFloat(value);
            break;

        case 'blend' :
            fBlend = value;
            break;
    }
    updateFilters();

}, '.filterObject');


// Update gradient easing
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    updateGradients({
        easing: value,
    });

}, '.gradient');


// #### Changing the filter effect
// We do quite a bit of work here to set things up for the example's initial display
// + This includes setting the user controls to match the initial settings
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    switch (value) {

        case 'glass-bars' :
            fOffsetX = 0;
            fOffsetY = 0;
            fOpacity = 1;
            fBlend = 'multiply';
            fDisplaceX = 10;
            fDisplaceY = 10;

            patternCell.set({
                width: 80,
                height: 80,
                shiftX: 0,
                shiftY: 0,
                skewX: 0,
                skewY: 0,
                stretchX: 1,
                stretchY: 1,
            });

            filterBlock.set({
                fillStyle: 'bar-cell-gradient',
            });

            skewX.value = 0;
            skewY.value = 0;
            stretchX.value = 1;
            stretchY.value = 1;
            shiftX.value = 0;
            shiftY.value = 0;
            filterBlend.value = 'multiply';
            patternGradient.value = 'bar-cell-gradient';

            break;

        case 'displace-bars' :
            fOffsetX = 0;
            fOffsetY = 0;
            fOpacity = 1;
            fBlend = 'multiply';
            fDisplaceX = 10;
            fDisplaceY = 10;

            patternCell.set({
                width: 80,
                height: 80,
                shiftX: 0,
                shiftY: 0,
                skewX: 0,
                skewY: 0,
                stretchX: 1,
                stretchY: 1,
            });

            filterBlock.set({
                fillStyle: 'ring-cell-gradient',
            });

            skewX.value = 0;
            skewY.value = 0;
            stretchX.value = 1;
            stretchY.value = 1;
            shiftX.value = 0;
            shiftY.value = 0;
            filterBlend.value = 'multiply';
            patternGradient.value = 'ring-cell-gradient';

            break;

        case 'etching' :
            fOffsetX = 0;
            fOffsetY = 0;
            fOpacity = 1;
            fBlend = 'screen';
            fDisplaceX = 10;
            fDisplaceY = 10;

            patternCell.set({
                width: 80,
                height: 80,
                shiftX: 0,
                shiftY: 0,
                skewX: -0.65,
                skewY: -0.31,
                stretchX: 1,
                stretchY: 0.26,
            });

            filterBlock.set({
                fillStyle: 'bar-cell-gradient',
            });

            skewX.value = -0.65;
            skewY.value = -0.31;
            stretchX.value = 1;
            stretchY.value = 0.26;
            shiftX.value = 0;
            shiftY.value = 0;
            filterBlend.value = 'screen';
            patternGradient.value = 'bar-cell-gradient';

            break;

        case 'green-monitor' :
            fOffsetX = 0;
            fOffsetY = 0;
            fOpacity = 1;
            fBlend = 'luminosity';
            fDisplaceX = 10;
            fDisplaceY = 10;

            patternCell.set({
                width: 80,
                height: 80,
                shiftX: 0,
                shiftY: 0,
                skewX: 1.04,
                skewY: 0.05,
                stretchX: 0.35,
                stretchY: 0,
            });

            filterBlock.set({
                fillStyle: 'bar-cell-gradient',
            });

            skewX.value = 1.04;
            skewY.value = 0.05;
            stretchX.value = 0.35;
            stretchY.value = 0;
            shiftX.value = 0;
            shiftY.value = 0;
            filterBlend.value = 'luminosity';
            patternGradient.value = 'bar-cell-gradient';

            break;
    }

    filterCell.set({
        width: '100%',
        height: '100%',
    });

    updateFilters();

    updateGradients({
        easing: 'linear',
    });

    opacity.value = 1;
    patternWidth.value = 80;
    patternHeight.value = 80;
    filterWidth.value = 100;
    filterHeight.value = 100;
    filterOffsetX.value = 0;
    filterOffsetY.value = 0;
    filterScaleX.value = 10;
    filterScaleY.value = 10;
    easing.value = 'linear';

    target.clearFilters().addFilters(value);

}, '.filterEffect');


// #### Setup form on page load
const opacity = document.querySelector('#opacity');
const skewX = document.querySelector('#skewX');
const skewY = document.querySelector('#skewY');
const stretchX = document.querySelector('#stretchX');
const stretchY = document.querySelector('#stretchY');
const shiftX = document.querySelector('#shiftX');
const shiftY = document.querySelector('#shiftY');
const patternWidth = document.querySelector('#pattern-width');
const patternHeight = document.querySelector('#pattern-height');
const filterWidth = document.querySelector('#filter-width');
const filterHeight = document.querySelector('#filter-height');
const filterOffsetX = document.querySelector('#filter-offset-x');
const filterOffsetY = document.querySelector('#filter-offset-y');
const filterScaleX = document.querySelector('#filter-scale-x');
const filterScaleY = document.querySelector('#filter-scale-y');
const filterBlend = document.querySelector('#blend');
const patternGradient = document.querySelector('#patternGradient');
const easing = document.querySelector('#easing');


// @ts-expect-error
opacity.value = 1;
// @ts-expect-error
skewX.value = 0;
// @ts-expect-error
skewY.value = 0;
// @ts-expect-error
stretchX.value = 1;
// @ts-expect-error
stretchY.value = 1;
// @ts-expect-error
shiftX.value = 0;
// @ts-expect-error
shiftY.value = 0;
// @ts-expect-error
patternWidth.value = 80;
// @ts-expect-error
patternHeight.value = 80;
// @ts-expect-error
filterWidth.value = 100;
// @ts-expect-error
filterHeight.value = 100;
// @ts-expect-error
filterOffsetX.value = 0;
// @ts-expect-error
filterOffsetY.value = 0;
// @ts-expect-error
filterScaleX.value = 10;
// @ts-expect-error
filterScaleY.value = 10;
// @ts-expect-error
filterBlend.value = 'multiply';
// @ts-expect-error
patternGradient.value = 'bar-cell-gradient';
// @ts-expect-error
easing.value = 'linear';

document.querySelector('#filterEffect').value = 'glass-bars';


// #### Development and testing
console.log(scrawl.library);