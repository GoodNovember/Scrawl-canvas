// # Demo Delaunator 001
// Delauney triangulation and Voronoi cell visualisation

// [Run code](../../demo/delaunator-001.html)
import scrawl from '../source/scrawl.js';
import Delaunator from 'https://cdn.skypack.dev/delaunator@5.0.0';


// The following functions are used to handle the Delaunay object
// + Code adapted from the [Delaunator Guide website](https://mapbox.github.io/delaunator/)
const edgesOfTriangle = (t) => [3 * t, 3 * t + 1, 3 * t + 2];

const pointsOfTriangle = (del, t) => {

    let { triangles } = del;

    return edgesOfTriangle(t).map(e => triangles[e]);
};

const triangleOfEdge = (e) => Math.floor(e / 3);

const nextHalfedge = (e) => (e % 3 === 2) ? e - 2 : e + 1;

const prevHalfedge = (e) => (e % 3 === 0) ? e + 2 : e - 1;

const forEachTriangleEdge = (pts, del, cb) => {

    let { triangles, halfedges } = del;

    let len = triangles.length;

    for (let e = 0; e < len; e++) {

        if (e > halfedges[e]) {

            const p = pts[triangles[e]];
            const q = pts[triangles[nextHalfedge(e)]];

            cb(e, p, q);
        }
    }
};

const forEachTriangle = (pts, del, cb) => {

    let len = del.triangles.length / 3;

    for (let t = 0; t < len; t++) {

        cb(t, pointsOfTriangle(del, t).map(p => pts[p]));
    }
};

const triangleCenter = (pts, del, t) => {

    const vertices = pointsOfTriangle(del, t).map(p => pts[p]);

    return circumcenter(vertices[0], vertices[1], vertices[2]);
};

const trianglesAdjacentToTriangle = (del, t) => {

    let { halfedges } = del;

    const adjacent = [];

    for (const e of edgesOfTriangle(t)) {

        const opposite = halfedges[e];

        if (opposite >= 0) adjacent.push(triangleOfEdge(opposite));
    }
    return adjacent;
};

const circumcenter = (a, b, c) => {

    if (a && b && c && a.length && b.length && c.length) {

        const ad = a[0] * a[0] + a[1] * a[1],
            bd = b[0] * b[0] + b[1] * b[1],
            cd = c[0] * c[0] + c[1] * c[1];

        const D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));

        return [
            1 / D * (ad * (b[1] - c[1]) + bd * (c[1] - a[1]) + cd * (a[1] - b[1])),
            1 / D * (ad * (c[0] - b[0]) + bd * (a[0] - c[0]) + cd * (b[0] - a[0])),
        ];
    }
};

const forEachVoronoiEdge = (pts, del, cb) => {

    let { triangles, halfedges } = del;

    let len = triangles.length;

    for (let e = 0; e < len; e++) {

        if (e < halfedges[e]) {

            const p = triangleCenter(pts, del, triangleOfEdge(e));
            const q = triangleCenter(pts, del, triangleOfEdge(halfedges[e]));

            cb(e, p, q);
        }
    }
};

const edgesAroundPoint = (del, start) => {

    let { halfedges } = del;

    const result = [];

    let incoming = start;

    do {

        result.push(incoming);
        const outgoing = nextHalfedge(incoming);
        incoming = halfedges[outgoing];

    } while (incoming !== -1 && incoming !== start);

    return result;
};

const forEachVoronoiCell = (pts, del, cb) => {

    const index = new Map();

    let { triangles, halfedges } = del;

    let tLen = triangles.length,
        pLen = pts.length;

    for (let e = 0; e < tLen; e++) {

        const endpoint = triangles[nextHalfedge(e)];

        if (!index.has(endpoint) || halfedges[e] === -1) index.set(endpoint, e);
    }

    for (let p = 0; p < pLen; p++) {

        const incoming = index.get(p);

        const E = edgesAroundPoint(del, incoming);

        const T = E.map(triangleOfEdge);

        const V = T.map(t => triangleCenter(pts, del, t));

        cb(p, V);
    }
};


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'black',
});

// Create a Block entity which covers the entire canvas; this will act as the area in which particles will be generated by the Emitter entity
scrawl.makeBlock({

    name: 'field-block',
    order: 1,

    width: '100%',
    height: '100%',

    method: 'none',
});


scrawl.makeWheel({

    name: 'mouse-planet',

    radius: 12,

    handle: ['center', 'center'],

    fillStyle: 'gold',

    lockTo: 'mouse',
});


// #### Particle physics animation scene

// Create a World object which we can then assign to the particle emitter
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,

    userAttributes: [
        {
            key: 'coords', 
            defaultValue: [],
            getter: function () { return [].concat(this.coords) },
            setter: function (emitter) {

                let { coords } = this;
                coords.length = 0;

                let { particleStore } = emitter;

                particleStore.forEach(p => {

                    let pos = p.position;

                    coords.push([pos.x, pos.y]);
                });

                let here = (canvas) ? canvas.here : false;

                if (here && here.active) coords.push([here.x, here.y]);
            },
        },
    ],
});

let delaunay = false;

const buildDelaunayObject = function (coords) {

    return Delaunator.from(coords);
};

const myEmitter = scrawl.makeEmitter({

    name: 'field-emitter',
    world: myWorld,

    generationRate: 5,

    particleCount: 80,
    start: ['center', 'center'],

    killRadius: 500, 
    killRadiusVariation: 0,

    rangeX: 24,
    rangeFromX: -12,
    rangeY: 24,
    rangeFromY: -12,

    artefact: scrawl.makeStar({

        name: 'particle-star-entity',

        radius1: 8,
        radius2: 5,

        points: 5,

        handle: ['center', 'center'],

        fillStyle: 'aliceblue',
        strokeStyle: 'orange',
        method: 'fillThenDraw',

        visibility: false, 

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    preAction: function (host) {


        // generate coords
        this.world.set({ coords: this });

        let c = this.world.get('coords');

        // Build a new Delaunay object for each iteration (think of this as a stress test)
        if (c.length) delaunay = buildDelaunayObject(c);

        if (delaunay) {

            let particles = this.particleStore,
                engine = host.engine,
                radius = this.world.connectionRadius;

            engine.save();

            engine.setTransform(1, 0, 0, 1, 0, 0);

            engine.lineWidth = 3;
            engine.strokeStyle = 'gold';
            engine.globalAlpha = 0.4;

            engine.beginPath();

            forEachTriangleEdge(c, delaunay, (e, p, q) => {

                if (p && q) {

                    engine.moveTo(...p);
                    engine.lineTo(...q);
                }
            });

            engine.stroke();

            engine.strokeStyle = 'lightgreen';
            engine.globalAlpha = 1;

            engine.beginPath();

            forEachVoronoiEdge(c, delaunay, (e, p, q) => {

                if (p && q) {

                    engine.moveTo(...p);
                    engine.lineTo(...q);
                }
            });

            engine.stroke();

            engine.restore();
        }
    },

    // The `stampAction` function just adds the stars to the scene
    stampAction: function (artefact, particle, host) {

        let [r, z, ...start] = particle.history[0];
        artefact.simpleStamp(host, {start});
    },
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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
