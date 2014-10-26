var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//setup variables
	var here,
		myWheels,
		myStars,
		myColor,
		wheelStamp,
		makeSomeWheels,
		starStamp,
		makeSomeStars,
		updateCells,
		checkForSplice,
		dx,
		dy,
		starSpeed = 8,
		wheelSpeed = 5;

	//add background cells to pad
	scrawl.addNewCell({
		name: 'wheelBackground',
		width: 850,
		height: 480,
		sourceX: 25,
		sourceY: 25,
		sourceWidth: 750,
		sourceHeight: 380,
		targetX: 0,
		targetY: 0,
		targetWidth: 750,
		targetHeight: 380,
	});
	scrawl.addNewCell({
		name: 'starBackground',
		width: 850,
		height: 480,
		backgroundColor: 'lightblue',
		sourceX: 25,
		sourceY: 25,
		sourceWidth: 750,
		sourceHeight: 380,
		targetX: 0,
		targetY: 0,
		targetWidth: 750,
		targetHeight: 380,
	});
	myWheels = scrawl.cell.wheelBackground;
	myStars = scrawl.cell.starBackground;
	//backgrounds only need to be drawn once
	scrawl.clear('all');
	//compiling at this stage to draw the background color
	scrawl.compile();
	scrawl.setDrawOrder(['starBackground', 'wheelBackground']);

	//finish drawing the background cells by adding wheels and stars to them
	myColor = scrawl.newColor({
		aMin: 0.4,
		aMax: 0.7,
		rMax: 200,
		gMax: 200,
		bMax: 200,
	});
	wheelStamp = scrawl.newWheel({
		group: 'wheelBackground',
		method: 'fill',
	});
	makeSomeWheels = function() {
		for (var i = 0; i < 10; i++) {
			wheelStamp.set({
				startX: Math.floor((Math.random() * 650) + 100),
				startY: Math.floor((Math.random() * 280) + 100),
				radius: Math.floor((Math.random() * 70) + 30),
				fillStyle: myColor.get('random'),
			}).stamp();
		}
	};
	makeSomeWheels();
	//this splice ensures background cell has matching edges
	myWheels.spliceCell({
		edge: 'horizontal'
	}).spliceCell({
		edge: 'vertical'
	});
	makeSomeWheels();

	starStamp = scrawl.makeRegularShape({
		angle: 144,
		radius: 10,
		group: 'starBackground',
		method: 'fill',
	});
	makeSomeStars = function() {
		for (var i = 0; i < 20; i++) {
			starStamp.set({
				startX: Math.floor((Math.random() * 650) + 100),
				startY: Math.floor((Math.random() * 280) + 100),
				scale: (Math.random() * 1.5) + 0.5,
				roll: Math.floor(Math.random() * 72),
				fillStyle: myColor.get('random'),
			}).stamp();
		}
	};
	makeSomeStars();
	myStars.spliceCell({
		edge: 'horizontal'
	}).spliceCell({
		edge: 'vertical'
	});
	makeSomeStars();

	//cell animation function
	updateCells = function() {
		dx = (here.x - 375) / 375;
		dy = (here.y - 190) / 190;
		myWheels.set({
			sourceDeltaX: dx * wheelSpeed,
			sourceDeltaY: dy * wheelSpeed,
		});
		checkForSplice(myWheels);
		myWheels.updateStart('source');

		myStars.set({
			sourceDeltaX: dx * starSpeed,
			sourceDeltaY: dy * starSpeed,
		});
		checkForSplice(myStars);
		myStars.updateStart('source');
	};

	//splice checker function called by cell animation function
	checkForSplice = function(cell) {
		var x = cell.sourceDelta.x,
			y = cell.sourceDelta.y,
			sx = cell.source.x,
			sy = cell.source.y,
			sw = cell.sourceWidth,
			sh = cell.sourceHeight,
			aw = cell.actualWidth,
			ah = cell.actualHeight;
		if (sx + x < 0) {
			cell.spliceCell({
				edge: 'right',
				strip: 100,
				shiftSource: true,
			});
		}
		else if (sx + sw + x > aw) {
			cell.spliceCell({
				edge: 'left',
				strip: 100,
				shiftSource: true,
			});
		}
		if (sy + y < 0) {
			cell.spliceCell({
				edge: 'bottom',
				strip: 100,
				shiftSource: true,
			});
		}
		else if (sy + sh + y > ah) {
			cell.spliceCell({
				edge: 'top',
				strip: 100,
				shiftSource: true,
			});
		}
	};

	//display initial scene
	scrawl.show();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = scrawl.pad.mycanvas.getMouse();
			if (here.active) {
				updateCells();
				//display cycle reduced to show component
				scrawl.show();
			}

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['color', 'factories', 'wheel', 'path', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});