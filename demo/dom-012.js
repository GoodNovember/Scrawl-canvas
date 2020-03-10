// ## Demo DOM 012

// [Add and remove (demolish) Scrawl-canvas canvas elements programmatically](../../demo/dom-012.html)
import scrawl from '../source/scrawl.js'


// Scene setup
let library = scrawl.library,
    artefact = library.artefact,
    canvasnames = library.canvasnames,
    mystack = artefact.mystack;


let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, text,
        testMessage = document.querySelector('#reportmessage');

    let artefactnames = library.artefactnames,
        stacknames = library.stacknames,
        cellnames = library.cellnames,
        stack = library.stack,
        canvas = library.canvas,
        cell = library.cell;

    let a, s, el, c;

    return function () {

        a = Object.keys(artefact);
        s = Object.keys(stack);
        el = Object.keys(canvas);
        c = Object.keys(cell);

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
artefact - ${a.length}, ${artefactnames.length}: [${(artefactnames).join(', ')}] 
stack - ${s.length}, ${stacknames.length}: [${(stacknames).join(', ')}] 
canvas - ${el.length}, ${canvasnames.length}: [${(canvasnames).join(', ')}]
cell - ${c.length}, ${cellnames.length}: [${(cellnames).join(', ')}]`;
    };
}();


// Animation loop - can't use .makeRender() in this case because there's no initial stack/canvas arterfact to render. Using .makeAnimation() and .render() - which use promises - instead
scrawl.makeAnimation({

    name: 'demo-animation',

    fn: function () {

        return new Promise((resolve, reject) => {

            scrawl.render()
            .then(() => {

                report();
                resolve(true);
            })
            .catch(err => reject(err));
        });
    }
});


// User interaction - buttons listener
let controls = function () {

    // the control buttons are never part of a Scrawl-canvas stack
    let b1 = document.querySelector('#action_1'),
        b2 = document.querySelector('#action_2'),
        b3 = document.querySelector('#action_3'),
        b4 = document.querySelector('#action_4');

    b1.disabled = '';
    b2.disabled = 'disabled';
    b3.disabled = '';
    b4.disabled = '';

    let stackCanvas, divCanvas;

    // Using a color factory object to generate random colors within a restricted palette
    let colorFactory = scrawl.makeColor({
        name: 'myColorObject',
        rMax: 200,
        gMax: 50,
        bMax: 10,
    });

    return function (e) {

        e.preventDefault();
        e.returnValue = false;
        
        switch (e.target.id) {

            case 'action_1':
                b1.disabled = 'disabled';
                b2.disabled = '';

                stackCanvas = scrawl.addCanvas({
                    host: (Math.random() > 0.5) ? mystack : '#mystack',
                    name: 'my-new-canvas',
                    width: 300,
                    height: 50,
                    backgroundColor: 'lavender',
                });

                break;

            case 'action_2':

                b1.disabled = '';
                b2.disabled = 'disabled';

                if (stackCanvas) stackCanvas.demolish();

                break;

            case 'action_3':

                b1.disabled = '';
                b2.disabled = 'disabled';
                b3.disabled = 'disabled';

                mystack.demolish(true);
                mystack = false;

                break;
                
            case 'action_4':

                scrawl.addCanvas({
                    name: `extra-canvas-${canvasnames.length}`,
                    host: (Math.random() > 0.5) ? '#not-a-stack' : '',
                    width: 300,
                    height: 50,
                    backgroundColor: colorFactory.get('random'),
                });

                break;
        }
    };
}();
scrawl.addListener('up', controls, '.controls');
