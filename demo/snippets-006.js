// # Demo Snippets 006
// Editable header element color font snippets
//
// Related files:
// + [Animated highlight gradient text snippet](./snippets/animated-highlight-gradient-text-snippet.html)
// + [Risograph text gradient snippet](./snippets/risograph-text-gradient-snippet.html)
// + [Text snippet helper](./snippets/text-snippet-helper.html)
// + [Worley text gradient snippet](./snippets/worley-text-gradient-snippet.html)
//
// [Run code](../../demo/snippets-006.html)

// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


import risographEffect from './snippets/risograph-text-gradient-snippet.js';
const risographHeaders = document.querySelectorAll('.risograph-header');
risographHeaders.forEach(el => risographEffect(el, scrawl));

import worleyEffect from './snippets/worley-text-gradient-snippet.js';
const worleyHeaders = document.querySelectorAll('.worley-header');
worleyHeaders.forEach(el => worleyEffect(el, scrawl));

import highlightGradientEffect from './snippets/animated-highlight-gradient-text-snippet.js';
const highlightGradientHeaders = document.querySelectorAll('.highlight-gradient-header');
highlightGradientHeaders.forEach(el => highlightGradientEffect(el, scrawl));

import bubblesEffect from './snippets/bubbles-text-snippet.js';
const bubblesHeaders = document.querySelectorAll('.bubbles-text-header');
bubblesHeaders.forEach(el => bubblesEffect(el, scrawl));

import pagePerformance from './snippets/page-performance-snippet.js';
const pageReport = document.querySelectorAll('#reportmessage');
pageReport.forEach(el => pagePerformance(el));


console.log(scrawl.library);
