// # Demo Filters 007 
// Filter parameters: channels

// [Run code](../../demo/filters-007.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'channels',
    method: 'channels',

    red: 1,
    green: 1,
    blue: 1,
});


// Create the target entity
scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['channels'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let red = document.querySelector('#red'),
        green = document.querySelector('#green'),
        blue = document.querySelector('#blue'),
        alpha = document.querySelector('#alpha'),
        opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Red: ${red.value}, Green: ${green.value}, Blue: ${blue.value}, Alpha: ${alpha.value}
    Opacity: ${opacity.value}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        red: ['red', 'float'],
        green: ['green', 'float'],
        blue: ['blue', 'float'],
        alpha: ['alpha', 'float'],
        opacity: ['opacity', 'float'],
    },
});

// Setup form
document.querySelector('#red').value = 1;
document.querySelector('#green').value = 1;
document.querySelector('#blue').value = 1;
document.querySelector('#alpha').value = 1;
document.querySelector('#opacity').value = 1;


// #### Development and testing
console.log(scrawl.library);
