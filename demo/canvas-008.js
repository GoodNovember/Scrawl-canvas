// # Demo Canvas 008 
// Picture entity position; manipulate copy attributes

// [Run code](../../demo/canvas-008.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Import image from DOM, and create Picture entity using it
scrawl.importDomImage('.flowers');

let piccy = scrawl.makePicture({

    name: 'myFlower',
    asset: 'iris',

    width: 200,
    height: 200,

    startX: 300,
    startY: 200,
    handleX: 100,
    handleY: 100,

    copyWidth: 200,
    copyHeight: 200,
    copyStartX: 100,
    copyStartY: 100,

    lineWidth: 10,
    strokeStyle: 'gold',

    order: 1,
    method: 'drawAndFill',

});

// Create a second Picture entity, this time pulling in the image dynamically
piccy.clone({

    name: 'myFactory',
    imageSource: 'img/canalFactory-800.png',

    width: 600,
    height: 400,

    startX: 0,
    startY: 0,
    handleX: 0,
    handleY: 0,

    copyWidth: 600,
    copyHeight: 400,
    copyStartX: 150,
    copyStartY: 0,

    order: 0,
    method: 'fill',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    let [copyX, copyY] = piccy.copyStart;
    let [copyW, copyH] = piccy.copyDimensions;
    let [pasteX, pasteY] = piccy.start;
    let [pasteW, pasteH] = piccy.dimensions;
    let [handleX, handleY] = piccy.handle;

    let {roll, scale} = piccy;

    return `    Copy - x: ${copyX}, y: ${copyY}, w: ${copyW}, h: ${copyH}
    Paste - x: ${pasteX}, y: ${pasteY}, w: ${pasteW}, h:${pasteH}
    Handle - x: ${handleX}, y: ${handleY}
    Roll: ${roll}; Scale: ${scale}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: piccy,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        copy_start_xPercent: ['copyStartX', '%'],
        copy_start_xAbsolute: ['copyStartX', 'round'],

        copy_start_yPercent: ['copyStartY', '%'],
        copy_start_yAbsolute: ['copyStartY', 'round'],

        copy_dims_widthPercent: ['copyWidth', '%'],
        copy_dims_widthAbsolute: ['copyWidth', 'round'],

        copy_dims_heightPercent: ['copyHeight', '%'],
        copy_dims_heightAbsolute: ['copyHeight', 'round'],

        paste_dims_widthPercent: ['width', '%'],
        paste_dims_widthAbsolute: ['width', 'round'],

        paste_dims_heightPercent: ['height', '%'],
        paste_dims_heightAbsolute: ['height', 'round'],

        paste_start_xPercent: ['startX', '%'],
        paste_start_xAbsolute: ['startX', 'round'],
        paste_start_xString: ['startX', 'raw'],

        paste_start_yPercent: ['startY', '%'],
        paste_start_yAbsolute: ['startY', 'round'],
        paste_start_yString: ['startY', 'raw'],

        paste_handle_xPercent: ['handleX', '%'],
        paste_handle_xAbsolute: ['handleX', 'round'],
        paste_handle_xString: ['handleX', 'raw'],

        paste_handle_yPercent: ['handleY', '%'],
        paste_handle_yAbsolute: ['handleY', 'round'],
        paste_handle_yString: ['handleY', 'raw'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],
    },
});

// Setup form
document.querySelector('#copy_start_xPercent').value = 25;
document.querySelector('#copy_start_yPercent').value = 25;
document.querySelector('#copy_dims_widthPercent').value = 50;
document.querySelector('#copy_dims_widthAbsolute').value = 200;
document.querySelector('#copy_start_xAbsolute').value = 100;
document.querySelector('#copy_start_yAbsolute').value = 100;
document.querySelector('#copy_dims_heightPercent').value = 50;
document.querySelector('#copy_dims_heightAbsolute').value = 200;
document.querySelector('#paste_dims_widthPercent').value = 33;
document.querySelector('#paste_dims_widthAbsolute').value = 200;
document.querySelector('#paste_dims_heightPercent').value = 50;
document.querySelector('#paste_dims_heightAbsolute').value = 200;
document.querySelector('#paste_start_xPercent').value = 50;
document.querySelector('#paste_start_yPercent').value = 50;
document.querySelector('#paste_handle_xPercent').value = 50;
document.querySelector('#paste_handle_yPercent').value = 50;
document.querySelector('#paste_start_xAbsolute').value = 300;
document.querySelector('#paste_start_yAbsolute').value = 200;
document.querySelector('#paste_handle_xAbsolute').value = 100;
document.querySelector('#paste_handle_yAbsolute').value = 100;
document.querySelector('#paste_start_xString').options.selectedIndex = 1;
document.querySelector('#paste_start_yString').options.selectedIndex = 1;
document.querySelector('#paste_handle_xString').options.selectedIndex = 1;
document.querySelector('#paste_handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;

// #### Development and testing
console.log(scrawl.library);
