// # Demo Canvas 004 
// Radial gradients

// [Run code](../../demo/canvas-004.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'blanchedalmond',
    checkForResize: true,
    fit: 'cover',
    ignoreCanvasCssDimensions: true,
}).setBase({
    width: 1000,
    height: 1000,
});


// Create the radial gradient
let graddy = scrawl.makeRadialGradient({
    name: 'mygradient',
    startX: '50%',
    startY: '50%',
    endX: '50%',
    endY: '50%',
    endRadius: 500,
});


// Create a block entity which will use the gradient
scrawl.makeBlock({
    name: 'myblock',
    width: '90%',
    height: '90%',
    startX: '5%',
    startY: '5%',

    fillStyle: graddy,
    strokeStyle: 'coral',
    lineWidth: 2,
    method: 'fillAndDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Palette - start: ${graddy.get('paletteStart')}; end: ${graddy.get('paletteEnd')}
Start - x: ${graddy.get('startX').toFixed(0)}; y: ${graddy.get('startY').toFixed(0)}; radius: ${graddy.get('startRadius').toFixed(0)}
End - x: ${graddy.get('endX').toFixed(0)}; y: ${graddy.get('endY').toFixed(0)}; radius: ${graddy.get('endRadius').toFixed(0)}`;
    };
}();


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

    target: graddy,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        paletteStart: ['paletteStart', 'int'],
        paletteEnd: ['paletteEnd', 'int'],

        startX: ['startX', '%'],
        startY: ['startY', '%'],
        startRadius: ['startRadius', 'int'],

        endX: ['endX', '%'],
        endY: ['endY', '%'],
        endRadius: ['endRadius', 'int'],
    },
});

let events = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = parseInt(e.target.value, 10);

    switch (e.target.id) {

        case 'red':
            if (val) graddy.updateColor(350, 'red');
            else graddy.removeColor(350);
            break;

        case 'blue':
            if (val) graddy.updateColor(650, 'blue');
            else graddy.removeColor(650);
            break;
    }
};
scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


// Set the DOM input values
document.querySelector('#paletteStart').value = 0;
document.querySelector('#paletteEnd').value = 999;
document.querySelector('#startX').value = 50;
document.querySelector('#startY').value = 50;
document.querySelector('#startRadius').value = 0;
document.querySelector('#endX').value = 50;
document.querySelector('#endY').value = 50;
document.querySelector('#endRadius').value = 500;
document.querySelector('#red').value = 0;
document.querySelector('#blue').value = 0;


// #### Development and testing
console.log(scrawl.library);
