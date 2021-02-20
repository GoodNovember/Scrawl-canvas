// import scrawl from 'https://unpkg.com/scrawl-canvas@8.0.11';
import scrawl from './source/scrawl.js';

let canvas = scrawl.library.canvas.mycanvas,
    namespace = 'London-crimes';

import * as frame from './simple-chart-frame.js';
// import * as tests from './simple-chart-frame-tests.js';
import * as barGraph from './london-crime-stacked-bars.js';
import * as lineGraph from './london-crime-lines.js';

canvas.set({

    backgroundColor: 'lemonchiffon',

    label: 'Crime statistics for London areas - from 1999 to 2017',

    description: 'Interactive graphic showing crimes recorded in various London areas, broken down into crime types. Data taken from https://data.london.gov.uk/dataset/recorded_crime_rates',

    fit: 'contain',
    checkForResize: true,

}).setBase({

    width: 600,
    height: 600,
});

let report = function () {

    let assets = scrawl.library.assetnames,
        groups = scrawl.library.groupnames,
        entitys = scrawl.library.entitynames,

        reporter = document.querySelector('#library-reporter');

    return function () {

        reporter.textContent = `Assets:
${assets.join(', ')}

Groups:
${groups.join(', ')}

Entitys:
${entitys.join(', ')}`;
    }
}();

scrawl.makeRender({
    name: `${namespace}-animation`,
    target: canvas,

    afterShow: report,
});

scrawl.addListener(
    'move', 
    () => canvas.cascadeEventAction('move'), 
    canvas.domElement 
);

// tests.activateButton(
//     `${namespace}-frame`, 
//     canvas, 
//     document.querySelector('#test-controls'),
//     document.querySelector('#tests-button'),
//     'Other Notifiable Offences');

let currentGraphType = 'bars',
    currentArea = 'Hackney',
    currentCategory = 'Burglary';

let crimeCategoryInput = document.querySelector('#crime-categories');

scrawl.addNativeListener(['input', 'change'], function (e) {

    if (e && e.target) {

        e.preventDefault();
        e.stopPropagation();

        let target = e.target.id,
            value = e.target.value;

        switch (target) {

            case 'areas' :

                if (value !== currentArea) {

                    currentArea = value;

                    if (currentGraphType === 'bars') {

                        barGraph.kill();

                        barGraph.build(
                            `${namespace}-bars`, 
                            canvas, 
                            `crimes-in-${currentArea.toLowerCase()}.json`
                        );
                    }
                    else if (currentGraphType === 'lines') {

                        lineGraph.kill();

                        lineGraph.build(
                            `${namespace}-lines`, 
                            canvas, 
                            `crimes-in-${currentArea.toLowerCase()}.json`, 
                            currentCategory
                        );
                    }
                }
                break;

            case 'graph-types' :

                if (value !== currentGraphType) {

                    currentGraphType = value;

                    if (currentGraphType === 'bars') {

                        lineGraph.kill();

                        barGraph.build(
                            `${namespace}-bars`, 
                            canvas, 
                            `crimes-in-${currentArea.toLowerCase()}.json`
                        );

                        crimeCategoryInput.setAttribute('disabled', '');
                    }
                    else if (currentGraphType === 'lines') {

                        barGraph.kill();

                        lineGraph.build(
                            `${namespace}-lines`, 
                            canvas, 
                            `crimes-in-${currentArea.toLowerCase()}.json`, 
                            currentCategory
                        );

                        crimeCategoryInput.removeAttribute('disabled');
                    }
                }
                break;

            case 'crime-categories' :

                if (currentGraphType === 'lines' && value !== currentCategory) {

                    currentCategory = value;

                    lineGraph.update(
                        `${namespace}-lines`, 
                        canvas, 
                        currentCategory
                    );
                }
                break;
        }
    }
}, '.control-item');

// Initial display
frame.build(`${namespace}-frame`, canvas, 'Hackney');
barGraph.build(`${namespace}-bars`, canvas, 'crimes-in-hackney.json');

crimeCategoryInput.value = 'Burglary';
crimeCategoryInput.setAttribute('disabled', '');

console.log(scrawl.library);
