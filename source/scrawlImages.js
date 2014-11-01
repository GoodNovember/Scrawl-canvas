//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Copyright (c) 2014 Richard James Roots
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------


/**
# scrawlImages

## Purpose and features

The Images module adds support for displaying images on canvas elements

* Defines the EntityImage object, which wraps &lt;img&gt; and &lt;svg&gt; elements
* Adds functionality to load images into the Scrawl library dynamically (after the web page hads loaded)
* Defines the Picture entity, which can be used to display file images (including animated entity sheets), other &lt;canvas&gt; elements, and &lt;video&gt; elements (experimental)
* Defines the AnimSheet object, which in turn define and control action sequences from entity sheet images
* Defines the Pattern design, which uses images for entity fillStyle and strokeStyle attributes

@module scrawlImages
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'images')) {
	var scrawl = (function(my) {
		'use strict';

		/**
    # window.scrawl

    scrawlImages module adaptions to the Scrawl library object

    ## New library sections

    * scrawl.image - for ScrawlImage objects
    * scrawl.img - linking to copies of DOM &lt;img&gt; elements - links to the original elements are stored in scrawl.object
    * scrawl.anim - for AnimSheet objects

    @class window.scrawl_Images
    **/

		/**
    A __factory__ function to generate new Pattern objects
    @method newPattern
    @param {Object} items Key:value Object argument for setting attributes
    @return Pattern object
    **/
		my.newPattern = function(items) {
			return new my.Pattern(items);
		};
		/**
    A __factory__ function to generate new Picture entitys
    @method newPicture
    @param {Object} items Key:value Object argument for setting attributes
    @return Picture entity object
    **/
		my.newPicture = function(items) {
			return new my.Picture(items);
		};

		/**
    A __factory__ function to convert a entity into a Picture entity

    Argument attributes can include any entity positioning and styling values, alongside the following flag:

    * __convert__ - when set to true, existing entity will be deleted; default: false

    If no name attribute is supplied in the argument object, the new Picture entity will be given the name: SPRITENAME+'_picture'
    @method Entity.convertToPicture
    @param {Object} items Key:value Object argument for setting attributes
    @return Picture entity object
    **/
		my.Entity.prototype.convertToPicture = function(items) {
			items = my.safeObject(items);
			var image,
				cell,
				ctx;
			cell = my.cell[my.group[this.group].cell];
			ctx = my.context[my.group[this.group].cell];
			image = my.prepareConvert(cell, ctx, this);
			items.name = items.name || this.name + '_picture';
			items.group = items.group || this.group;
			if (items.convert) {
				my.deleteEntity([this.name]);
			}
			return my.doConvert(image, items);
		};
		/**
    A __factory__ function to convert a group of entitys into a single Picture entity

    Argument attributes can include any entity positioning and styling values, alongside the following flag:

    * __convert__ - when set to true, existing entitys in the group will be deleted; default: false

    If no name attribute is supplied in the argument object, the new Picture entity will be given the name: GROUPNAME+'_entity'
    @method Group.convertToEntity
    @param {Object} items Key:value Object argument for setting attributes
    @return Picture entity object; false if no entitys contained in group
    **/
		my.Group.prototype.convertToEntity = function(items) {
			items = my.safeObject(items);
			var image,
				cell,
				ctx;
			if (this.entitys.length > 0) {
				cell = my.cell[this.cell];
				ctx = my.context[this.cell];
				image = my.prepareConvert(cell, ctx, this);
				items.name = items.name || this.name + '_entity';
				items.group = items.group || this.name;
				if (items.convert) {
					my.deleteEntity(this.entitys);
				}
				return my.doConvert(image, items);
			}
			return false;
		};
		/**
    Helper function for convert functions
    @method prepareConvert
    @return ImageData object
    @private
    **/
		my.prepareConvert = function(cell, ctx, obj) {
			var left = cell.actualWidth,
				right = 0,
				top = cell.actualHeight,
				bottom = 0,
				image,
				data,
				pos;
			cell.clear();
			obj.stamp();
			image = ctx.getImageData(0, 0, cell.actualWidth, cell.actualHeight);
			data = image.data;
			for (var i = 0, iz = cell.actualHeight; i < iz; i++) {
				for (var j = 0, jz = cell.actualWidth; j < jz; j++) {
					pos = (((i * cell.actualWidth) + j) * 4) + 3;
					if (data[pos] > 0) {
						top = (top > i) ? i : top;
						bottom = (bottom < i) ? i : bottom;
						left = (left > j) ? j : left;
						right = (right < j) ? j : right;
					}
				}
			}
			image = ctx.getImageData(left, top, (right - left + 1), (bottom - top + 1));
			cell.clear();
			return image;
		};
		/**
    Helper function for convert functions
    @method doConvert
    @return Picture entity object
    @private
    **/
		my.doConvert = function(image, items) {
			my.cv.width = image.width;
			my.cv.height = image.height;
			my.cvx.putImageData(image, 0, 0);
			items.element = my.cv.toDataURL();
			items.width = image.width;
			items.height = image.height;
			image = new my.ScrawlImage(items);
			items.source = image.name;
			return my.newPicture(items);
		};
		/**
    # Pattern

    ## Instantiation

    * scrawl.newPattern()

    ## Purpose

    * Defines a pattern
    * Used with entity.strokeStyle and entity.fillStyle attributes

    Note that a pattern image will always start at the entity's rotation/reflection (start vector) position, extending in all directions. To move a entity over a 'static' (cell-bound) pattern, more inventive solutions need to be found - for instance a combination of Picture entitys, dedicated cells and the 'source-in' globalCompositeOperation attribute.

    Patterns are not restricted to images. A pattern can also be sourced from another cell (canvas element) or even a video element.

    ## Access

    * scrawl.design.PATTERNNAME - for the Pattern design object

    @class Pattern
    @constructor
    @extends Base
    @param {Object} [items] Key:value Object argument for setting attributes
    **/
		my.Pattern = function(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			my.Base.prototype.set.call(this, items);
			this.repeat = items.repeat || 'repeat';
			this.cell = items.cell || my.pad[my.currentPad].current;
			this.setImage((items.source || items.imageData || my.image[items.image] || my.cell[items.canvas] || false), items.callback);
			return this;
		};
		my.Pattern.prototype = Object.create(my.Base.prototype);
		/**
    @property type
    @type String
    @default 'Pattern'
    @final
    **/
		my.Pattern.prototype.type = 'Pattern';
		my.Pattern.prototype.classname = 'designnames';
		my.d.Pattern = {
			/**
    Drawing parameter
    @property repeat
    @type String
    @default 'repeat'
    **/
			repeat: 'repeat',
			/**
    CELLNAME String of &lt;canvas&gt; element context engine on which the gradient has been set
    @property cell
    @type String
    @default ''
    **/
			cell: '',
			/**
    SCRAWLIMAGENAME String - used when pattern is based on an image already imported into the scrawl library
    @property image
    @type String
    @default ''
    **/
			image: '',
			/**
    Full path to image file on server - used when pattern is based on a dynamically loaded image
    @property source
    @type String
    @default ''
    **/
			source: '',
			/**
    CELLNAME String - used when pattern is based on a &lt;canvas&gt; element's image
    @property canvas
    @type String
    @default ''
    **/
			canvas: '',
		};
		my.mergeInto(my.d.Pattern, my.d.Base);
		/**
    Augments Base.set()
    @method set
    @param {Object} items Object consisting of key:value attributes
    @return This
    @chainable
    **/
		my.Pattern.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			this.setImage();
			return this;
		};
		/**
    Discover this Pattern's image source, loading it if necessary
    @method setImage
    @param {Mixed} source
    @param {Function} [callback] Function to be run once Image is successfully loaded
    @return This
    @chainable
    @private
    **/
		my.Pattern.prototype.setImage = function(source, callback) {
			if (my.isa(source, 'str')) {
				var myImage = new Image();
				var that = this;
				myImage.id = this.name;
				myImage.onload = function(callback) {
					try {
						var iObj = my.newImage({
							name: that.name,
							element: myImage,
						});
						my.design[that.name] = that;
						my.design[that.name].image = iObj.name;
						my.design[that.name].source = myImage.src;
						my.pushUnique(my.designnames, that.name);
						my.design[that.name].makeDesign();
						if (my.isa(callback, 'fn')) {
							callback();
						}
					}
					catch (e) {
						console.log('Pattern ' + [that.name] + ' - setImage() #1 failed - ' + e.name + ' error: ' + e.message);
						return that;
					}
				};
				myImage.src = source;
			}
			else if (my.isa(source, 'obj')) {
				if (source.type === 'ScrawlImage') {
					try {
						this.image = source.name;
						my.design[this.name] = this;
						my.pushUnique(my.designnames, this.name);
						this.makeDesign();
						if (my.isa(callback, 'fn')) {
							callback();
						}
					}
					catch (e) {
						console.log('Pattern ' + [this.name] + ' - setImage() #2 failed - ' + e.name + ' error: ' + e.message);
						return that;
					}
				}
				else if (source.type === 'Cell') {
					try {
						this.canvas = source.name;
						my.design[this.name] = this;
						my.pushUnique(my.designnames, this.name);
						this.makeDesign();
						if (my.isa(callback, 'fn')) {
							callback();
						}
					}
					catch (e) {
						console.log('Pattern ' + [this.name] + ' - setImage() #3 failed - ' + e.name + ' error: ' + e.message);
						return that;
					}
				}
			}
			else {
				console.log('Pattern ' + [this.name] + ' - setImage() #4 failed - source not a string or an object', source);
			}
			return this;
		};
		/**
    Returns &lt;canvas&gt; element's contenxt engine's pattern object, or 'rgba(0,0,0,0)' on failure
    @method getData
    @return JavaScript pattern object, or String
    @private
    **/
		my.Pattern.prototype.getData = function() {
			return (my.xt(my.dsn[this.name])) ? my.dsn[this.name] : 'rgba(0,0,0,0)';
		};
		/**
    Builds &lt;canvas&gt; element's contenxt engine's pattern object
    @method makeDesign
    @return This
    @chainable
    @private
    **/
		my.Pattern.prototype.makeDesign = function() {
			var ctx = my.context[this.cell],
				img = (my.xt(my.img[this.image])) ? my.img[this.image] : my.object[this.image];
			if (this.image) {
				if (img) {
					my.dsn[this.name] = ctx.createPattern(img, this.repeat);
				}
			}
			else if (this.canvas) {
				my.dsn[this.name] = ctx.createPattern(my.canvas[this.canvas], this.repeat);
			}
			return this;
		};
		/**
    Remove this pattern from the scrawl library
    @method remove
    @return Always true
    **/
		my.Pattern.prototype.remove = function() {
			delete my.dsn[this.name];
			delete my.design[this.name];
			my.removeItem(my.designnames, this.name);
			return true;
		};
		/**
    Alias for Pattern.makeDesign()
    @method update
    @return This
    @chainable
    **/
		my.Pattern.prototype.update = function() {
			this.makeDesign();
			return this;
		};

		/**
    # Picture

    ## Instantiation

    * scrawl.newPicture()

    ## Purpose

    * Defines rectangular image-based objects for displaying on a Cell's canvas
    * Used to display both static and entity sheet image animations
    * Links to details of an image's data; can use image data (rgba data) during collision detection
    * Can handle video input (experimental)
    * Performs 'rect' and 'drawImage' drawing operations on canvases

    ## Access

    * scrawl.entity.PICTURENAME - for the Picture entity object

    @class Picture
    @constructor
    @extends Entity
    @uses AnimSheet
    @param {Object} [items] Key:value Object argument for setting attributes
    **/
		my.Picture = function(items) {
			if (my.isa(items, 'obj') && my.xt(items.url)) {
				return this.importImage(items);
			}
			else {
				items = my.safeObject(items);
				my.Entity.call(this, items);
				my.Position.prototype.set.call(this, items);
				var s,
					w,
					h,
					x,
					y;
				this.source = items.source || false;
				this.imageType = this.sourceImage(items.source) || false;
				if (this.source) {
					if (this.imageType === 'img' || this.imageType === 'video') {
						s = my.image[this.source];
						w = s.width;
						h = s.height;
						x = 0;
						y = 0;
					}
					else if (this.imageType === 'canvas') {
						s = my.cell[this.source];
						w = s.copyWidth;
						h = s.copyHeight;
						x = s.copy.x;
						y = s.copy.y;
					}
					else if (this.imageType === 'animation') {
						s = my.anim[this.get('animSheet')].getData();
						w = s.copyWidth;
						h = s.copyHeight;
						x = s.copyX;
						y = s.copyY;
					}
					this.width = items.width || w;
					this.height = items.height || h;
					this.copyX = items.copyX || x;
					this.copyY = items.copyY || y;
					this.copyWidth = items.copyWidth || w;
					this.copyHeight = items.copyHeight || h;
					this.setLocalDimensions();
				}
				this.filters = my.safeObject(items.filters);
				this.filterKeys = Object.keys(this.filters);
				this.checkSum = 0;
				this.calculateFilters = false;
				this.registerInLibrary();
				my.pushUnique(my.group[this.group].entitys, this.name);
				if (my.isa(items.callback, 'fn')) {
					items.callback.call(this);
				}
				return this;
			}
		};
		my.Picture.prototype = Object.create(my.Entity.prototype);
		/**
    @property type
    @type String
    @default 'Picture'
    @final
    **/
		my.Picture.prototype.type = 'Picture';
		my.Picture.prototype.classname = 'entitynames';
		my.d.Picture = {
			/**
    SCRAWLIMAGE String - source image for this entity
    @property source
    @type String
    @default ''
    **/
			source: '',
			/**
    IMAGEDATANAME String - name of the Image Data object

    Calculated automatically by Scrawl following a .getImageData() call
    @property imageData
    @type String
    @default ''
    **/
			imageData: '',
			/**
    Collision attribute - name of channel to be checked against during collision detection

    Permitted values: 'red', 'blue', 'green', 'alpha'
    @property imageDataChannel
    @type String
    @default 'alpha'
    **/
			imageDataChannel: 'alpha',
			/**
    ANIMSHEET String - Entity sheet image linked to this entity
    @property animSheet
    @type String
    @default ;;
    **/
			animSheet: '',
			/**
    Identifier String - permitted values include: 'animation', 'canvas', 'img'

    Detected automatically by scrawl during entity construction
    @property imageType
    @type String
    @default ''
    @private
    **/
			imageType: '',
			/**
    Collision flag - when true, Picture entity will use imageData to determine whether a collision has occured; when false, a simpler box collision system is used
    @property checkHitUsingImageData
    @type Boolean
    @default false
    **/
			checkHitUsingImageData: false,
			/**
    Image display - horizontal offset, in pixels, from the image's top left corner
    @property copyX
    @type Number
    @default 0
    **/
			copyX: 0,
			/**
    Image display - vertical offset, in pixels, from the image's top left corner
    @property copyY
    @type Number
    @default 0
    **/
			copyY: 0,
			/**
    Image display - width, in pixels, from copy start point
    @property copyWidth
    @type Number
    @default 0
    **/
			copyWidth: 0,
			/**
    Image display - height, in pixels, from copy start point
    @property copyHeight
    @type Number
    @default 0
    **/
			copyHeight: 0,
			/**
    Image display - width, in pixels
    @property localWidth
    @type Number
    @default 0
    **/
			localWidth: 0,
			/**
    Image display - height, in pixels
    @property localHeight
    @type Number
    @default 0
    **/
			localHeight: 0,
			/**
    Object consisting of filter name keys and filter argument objects
    @property filters
    @type Object
    @default Object
    **/
			filters: {},
			/**
    Array of this.filters{} attribute keys
    @property filterKeys
    @type Array
    @default Array
    @private
    **/
			filterKeys: [],
			/**
    Checksum - used to determine whether filters need to be calculated
    @property checkSum
    @type Number
    @default 0
    **/
			checkSum: 0,
			/**
    Dirty filter flag - if true, recalculate filtered image
    @property calculateFilters
    @type Boolean
    @default false
    @private
    **/
			calculateFilters: false,
			/**
    Asynchronous loading of image file from the server - path/to/image file

    Used only with __scrawl.newPicture()__ and __Picture.clone()__ operations. This attribute is not retained
    @property url
    @type String
    @default ''
    **/
			/**
    Asynchronous loading of image file from the server - function to run once image has successfully loaded

    Used only with __scrawl.newPicture()__ and __Picture.clone()__ operations. This attribute is not retained
    @property callback
    @type Function
    @default undefined
    **/
		};
		my.mergeInto(my.d.Picture, my.d.Entity);
		/**
    Augments Entity.get()
    @method get
    @param {String} item Attribute to be retrieved
    @return Attribute value
    **/
		my.Picture.prototype.get = function(item) {
			if (my.contains(my.animKeys, item)) {
				return my.anim[this.animSheet].get(item);
			}
			else {
				return my.Entity.prototype.get.call(this, item);
			}
		};
		/**
    Augments Entity.set()
    @method set
    @param {Object} items Object consisting of key:value attributes
    @return This
    @chainable
    **/
		my.Picture.prototype.set = function(items) {
			my.Entity.prototype.set.call(this, items);
			if (my.xto([items.width, items.height, items.scale])) {
				this.setLocalDimensions();
			}
			if (my.xt(this.animSheet)) {
				my.anim[this.animSheet].set(items);
			}
			return this;
		};
		/**
    Augments Entity.setDelta()
    @method setDelta
    @param {Object} items Object consisting of key:value attributes
    @return This
    @chainable
    **/
		my.Picture.prototype.setDelta = function(items) {
			my.Entity.prototype.setDelta.call(this, items);
			items = my.safeObject(items);
			if (my.xt(items.copyX)) {
				this.copyX += items.copyX;
			}
			if (my.xt(items.copyY)) {
				this.copyY += items.copyY;
			}
			if (my.xt(items.copyWidth)) {
				this.copyWidth += items.copyWidth;
			}
			if (my.xt(items.copyHeight)) {
				this.copyHeight += items.copyHeight;
			}
			if (my.xto([items.width, items.height, items.scale])) {
				this.setLocalDimensions();
			}
			if (my.xt(this.animSheet)) {
				my.anim[this.animSheet].set(items);
			}
			return this;
		};
		/**
    Augments Entity.set() - sets the local dimensions
    @method setLocalDimensions
    @return This
    @chainable
    **/
		my.Picture.prototype.setLocalDimensions = function() {
			var cell = my.cell[my.group[this.group].cell];
			if (my.isa(this.width, 'str')) {
				this.localWidth = (parseFloat(this.width) / 100) * cell.actualWidth * this.scale;
			}
			else {
				this.localWidth = this.width * this.scale || 0;
			}
			if (my.isa(this.height, 'str')) {
				this.localHeight = (parseFloat(this.height) / 100) * cell.actualHeight * this.scale;
			}
			else {
				this.localHeight = this.height * this.scale || 0;
			}
			return this;
		};
		/**
    Constructor helper function

    Loads an image from an URL path, creates a ScrawlImage wrapper for it and then creates the Picture entity

    _Note: this function is asynchronous_
    @method importImage
    @param {Object} items Object consisting of key:value attributes
    @return New Picture object; false on failure
    @chainable
    @private
    **/
		my.Picture.prototype.importImage = function(items) {
			items = my.safeObject(items);
			if (my.xt(items.url)) {
				var myImage = new Image();
				myImage.id = items.name || 'image' + Math.floor(Math.random() * 100000000);
				myImage.crossOrigin = 'Anonymous';
				myImage.onload = function() {
					var iObj = my.newImage({
						name: myImage.id,
						element: myImage,
					});
					delete items.url;
					items.source = myImage.id;
					console.log('Picture.importImage() - <' + myImage.id + '> loaded');
					return my.newPicture(items);
				};
				myImage.onerror = function() {
					console.log('Picture.importImage() failed - <' + myImage.id + '> failed to load');
					return false;
				};
				myImage.src = items.url;
			}
			else {
				console.log('Picture.importImage() failed - no url supplied');
				return false;
			}
		};
		/**
    Augments Entity.clone()
    @method clone
    @param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
    @return Cloned object
    @chainable
    **/
		my.Picture.prototype.clone = function(items) {
			var a = my.Entity.prototype.clone.call(this, items);
			items = my.safeObject(items);
			if (!items.keepCopyDimensions) {
				a.fitToImageSize();
			}
			return a;
		};
		/**
    Clone helper function
    @method fitToImageSize
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.fitToImageSize = function() {
			if (this.imageType === 'img') {
				var img = my.image[this.source];
				this.set({
					copyWidth: img.get('width'),
					copyHeight: img.get('height'),
					copyX: 0,
					copyY: 0,
				});
			}
			return this;
		};
		/**
    Constructor and clone helper function
    @method sourceImage
    @return Correct imageType attribute value for this entity
    @private
    **/
		my.Picture.prototype.sourceImage = function() {
			var home;
			if (this.get('animSheet') && my.contains(my.imagenames, this.source)) {
				return 'animation';
			}
			if (my.contains(my.imagenames, this.source)) {
				home = my.asset[this.source];
				return (my.isa(home, 'video')) ? 'video' : 'img';
			}
			if (my.contains(my.cellnames, this.source)) {
				return 'canvas';
			}
			return false;
		};
		/**
    Stamp helper function - perform a 'clip' method draw
    @method clip
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.clip = function(ctx, cell) {
			var here = this.prepareStamp();
			ctx.save();
			this.rotateCell(ctx, cell);
			ctx.beginPath();
			ctx.rect(here.x, here.y, this.localWidth, this.localHeight);
			ctx.clip();
			return this;
		};
		/**
    Stamp helper function - perform a 'clear' method draw
    @method clear
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.clear = function(ctx, cell) {
			var here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.clearRect(here.x, here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
    Stamp helper function - perform a 'clearWithBackground' method draw
    @method clearWithBackground
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.clearWithBackground = function(ctx, cell) {
			var here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.fillStyle = my.cell[cell].backgroundColor;
			ctx.strokeStyle = my.cell[cell].backgroundColor;
			ctx.globalAlpha = 1;
			ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
			ctx.fillRect(here.x, here.y, this.localWidth, this.localHeight);
			ctx.fillStyle = my.ctx[cell].fillStyle;
			ctx.strokeStyle = my.ctx[cell].strokeStyle;
			ctx.globalAlpha = my.ctx[cell].globalAlpha;
			return this;
		};
		/**
    Stamp helper function - perform a 'draw' method draw
    @method draw
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.draw = function(ctx, cell) {
			var here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			my.cell[cell].setEngine(this);
			ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
    Stamp helper function - perform a 'fill' method draw
    @method fill
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.fill = function(ctx, cell) {
			var here,
				data = this.getImage();
			if (data.image) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.drawImage(data.image, data.copyX, data.copyY, data.copyWidth, data.copyHeight, here.x, here.y, this.localWidth, this.localHeight);
			}
			return this;
		};
		/**
    Stamp helper function - perform a 'drawFill' method draw
    @method drawFill
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.drawFill = function(ctx, cell) {
			var here,
				data = this.getImage();
			if (data.image) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
				this.clearShadow(ctx, cell);
				ctx.drawImage(data.image, data.copyX, data.copyY, data.copyWidth, data.copyHeight, here.x, here.y, this.localWidth, this.localHeight);
			}
			return this;
		};
		/**
    Stamp helper function - perform a 'fillDraw' method draw
    @method fillDraw
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.fillDraw = function(ctx, cell) {
			var here,
				data = this.getImage();
			if (data.image) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.drawImage(data.image, data.copyX, data.copyY, data.copyWidth, data.copyHeight, here.x, here.y, this.localWidth, this.localHeight);
				this.clearShadow(ctx, cell);
				ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
			}
			return this;
		};
		/**
    Stamp helper function - perform a 'sinkInto' method draw
    @method sinkInto
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.sinkInto = function(ctx, cell) {
			var here,
				data = this.getImage();
			if (data.image) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.drawImage(data.image, data.copyX, data.copyY, data.copyWidth, data.copyHeight, here.x, here.y, this.localWidth, this.localHeight);
				ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
			}
			return this;
		};
		/**
    Stamp helper function - perform a 'floatOver' method draw
    @method floatOver
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.floatOver = function(ctx, cell) {
			var here,
				data = this.getImage();
			if (data.image) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.strokeRect(here.x, here.y, this.localWidth, this.localHeight);
				ctx.drawImage(data.image, data.copyX, data.copyY, data.copyWidth, data.copyHeight, here.x, here.y, this.localWidth, this.localHeight);
			}
			return this;
		};
		/**
    Load the Picture entity's image data (via JavaScript getImageData() function) into the scrawl library
    @method getImageData
    @param {String} [label] IMAGEDATANAME - default: PICTURENAME_data
    @return This
    @chainable
    **/
		my.Picture.prototype.getImageData = function(label) {
			label = (my.xt(label)) ? label : 'data';
			var data = this.getImage(),
				myImage;
			if (data.image) {
				if (this.imageType === 'animation') {
					myImage = my.image[this.source];
					my.cv.width = myImage.get('width');
					my.cv.height = myImage.get('height');
					my.cvx.drawImage(data.image, 0, 0);
				}
				else {
					my.cv.width = this.copyWidth;
					my.cv.height = this.copyHeight;
					my.cvx.drawImage(data.image, this.copyX, this.copyY, this.copyWidth, this.copyHeight, 0, 0, this.copyWidth, this.copyHeight);
				}
				this.imageData = this.name + '_' + label;
				my.imageData[this.imageData] = my.cvx.getImageData(0, 0, my.cv.width, my.cv.height);
			}
			return this;
		};
		/**
    Get the pixel color or channel data from Picture object's image at given coordinate

    Argument needs to have __x__ and __y__ data (pixel coordinates) and, optionally, a __channel__ string - 'red', 'blue', 'green', 'alpha', 'color' (default)
    @method getImageDataValue
    @param {Object} items Coordinate Vector or Object
    @return Color value at coordinate; false if no color found
    **/
		my.Picture.prototype.getImageDataValue = function(items) {
			items = my.safeObject(items);
			var coords = my.workimg.v1.set({
					x: (items.x || 0),
					y: (items.y || 0)
				}),
				d = my.imageData[this.get('imageData')],
				myX,
				myY,
				myData,
				copyScaleX,
				copyScaleY,
				result,
				myEl,
				imageDataChannel = this.get('imageDataChannel');
			this.resetWork();
			coords.vectorSubtract(this.work.start).scalarDivide(this.scale).rotate(-this.roll);
			coords.x = (this.flipReverse) ? -coords.x : coords.x;
			coords.y = (this.flipUpend) ? -coords.y : coords.y;
			coords.vectorAdd(this.getPivotOffsetVector(this.handle));
			if (this.imageType === 'animation' && my.image[this.source]) {
				myData = my.anim[this.get('animSheet')].getData();
				copyScaleX = (this.localWidth / this.scale) / myData.copyWidth;
				copyScaleY = (this.localHeight / this.scale) / myData.copyHeight;
				myX = Math.round((coords.x / copyScaleX) + myData.copyX);
				myY = Math.round((coords.y / copyScaleY) + myData.copyY);
			}
			else {
				copyScaleX = (this.localWidth / this.scale) / this.copyWidth;
				copyScaleY = (this.localHeight / this.scale) / this.copyHeight;
				myX = Math.round(coords.x / copyScaleX);
				myY = Math.round(coords.y / copyScaleY);
			}
			result = false;
			myEl = ((myY * d.width) + myX) * 4;
			if (my.isBetween(myX, 0, d.width - 1, true) && my.isBetween(myY, 0, d.height - 1, true)) {
				switch (items.channel || imageDataChannel) {
					case 'red':
						result = (my.xt(d.data[myEl])) ? d.data[myEl] : false;
						break;
					case 'blue':
						result = (my.xt(d.data[myEl + 1])) ? d.data[myEl + 1] : false;
						break;
					case 'green':
						result = (my.xt(d.data[myEl + 2])) ? d.data[myEl + 2] : false;
						break;
					case 'alpha':
						result = (my.xt(d.data[myEl + 3])) ? d.data[myEl + 3] : false;
						break;
					case 'color':
						result = (my.xta([d.data[myEl], d.data[myEl + 1], d.data[myEl + 2], d.data[myEl + 3]])) ? 'rgba(' + d.data[myEl] + ',' + d.data[myEl + 1] + ',' + d.data[myEl + 2] + ',' + d.data[myEl + 3] + ')' : false;
						break;
					default:
						result = false;
				}
			}
			return result;
		};
		/**
    Display helper function - retrieve copy attributes for ScrawlImage, taking into account the current frame for entity sheet images

    Also generates new filtered images, when necessary
    @method getImage
    @return Image Object
    @private
    **/
		my.Picture.prototype.getImage = function() {
			var myData,
				myReturn = {},
				myImage,
				iObject,
				home;
			myReturn.copyX = this.copyX;
			myReturn.copyY = this.copyY;
			myReturn.copyWidth = this.copyWidth;
			myReturn.copyHeight = this.copyHeight;
			switch (this.imageType) {
				case 'canvas':
					myReturn.image = (my.isa(my.canvas[this.source], 'canvas')) ? my.canvas[this.source] : false;
					break;
				case 'animation':
					myReturn = my.anim[this.animSheet].getData();
					this.copyX = myReturn.copyX;
					this.copyY = myReturn.copyY;
					this.copyWidth = myReturn.copyWidth;
					this.copyHeight = myReturn.copyHeight;
					home = (my.xt(my.img[this.source])) ? my.img[this.source] : my.object[this.source];
					myReturn.image = (my.isa(home, 'img')) ? home : false;
					break;
				default:
					home = my.asset[this.source];
					myReturn.image = (my.isa(home, 'img') || my.isa(home, 'video')) ? home : false;
			}
			this.filterKeys = Object.keys(this.filters);
			if (this.filterKeys.length > 0) {
				this.calculateCheckSum();
				if (this.calculateFilters) {
					iObject = my.image[this.source];
					my.cv.width = iObject.width;
					my.cv.height = iObject.height;
					my.cvx.drawImage(myReturn.image, 0, 0);
					myImage = my.cvx.getImageData(this.copyX, this.copyY, this.copyWidth, this.copyHeight);
					for (var i = 0, iz = this.filterKeys.length; i < iz; i++) {
						if (my.xt(my.filter[this.filterKeys[i]])) {
							this.filters[this.filterKeys[i]].use = myImage;
							this.filters[this.filterKeys[i]].save = false;
							myImage = my.filter[this.filterKeys[i]](this.filters[this.filterKeys[i]], my.image[this.source]);
						}
					}
					myImage = iObject.getImageDataUrl(myImage, true);
					iObject.makeImage(myImage, this.name + '_brush', this.copyWidth, this.copyHeight);
				}
				myReturn.copyX = 0;
				myReturn.copyY = 0;
				myImage = my.f.querySelector('#' + this.name + '_brush');
				myReturn.image = (my.isa(myImage, 'img')) ? myImage : false;
				if (myReturn.image) {
					this.calculateFilters = false;
				}
			}
			return myReturn;
		};
		/**
    Display helper function - check to see if filtered image needs to be recalculated
    @method calculateCheckSum
    @return Boolean False if filters need recalculating; true otherwise.
    @private
    **/
		my.Picture.prototype.calculateCheckSum = function() {
			var check = ((this.copyX * this.copyX) || 1) * ((this.copyY * this.copyY) || 1) * ((this.copyWidth * this.copyWidth) || 1) * ((this.copyHeight * this.copyHeight) || 1),
				filtercheck = Object.keys(this.filters);
			//check if copy parameters have changed
			if (this.checkSum !== check) {
				this.calculateFilters = true;
				this.checkSum = check;
			}
			//check if a filter has been added/removed from the filters object
			if (this.filterKeys.length !== filtercheck.length) {
				this.calculateFilters = true;
			}
			//at this point, know enough to return if something has changed
			if (this.calculateFilters) {
				return false;
			}
			//final, deep check to see if filter order has changed, or if a filter has been replaced by another one
			for (var i = 0, iz = filtercheck.length; i < iz; i++) {
				if (this.filterKeys[i] !== filtercheck[i]) {
					this.calculateFilters = true;
					return false;
				}
			}
			//nothing changed
			return true;
		};
		/**
    Check Cell coordinates to see if any of them fall within this entity's path - uses JavaScript's _isPointInPath_ function

    Argument object contains the following attributes:

    * __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
    * __x__ - X coordinate
    * __y__ - Y coordinate

    Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values
    @method checkHit
    @param {Object} items Argument object
    @return The first coordinate to fall within the entity's path; false if none fall within the path
    **/
		my.Picture.prototype.checkHit = function(items) {
			items = my.safeObject(items);
			var mytests = (my.xt(items.tests)) ? [].concat(items.tests) : [(items.x || false), (items.y || false)],
				c,
				hit,
				test = (my.isa(items.test, 'num')) ? items.test : 0;
			for (var i = 0, iz = mytests.length; i < iz; i += 2) {
				hit = my.Entity.prototype.checkHit.call(this, {
					tests: [mytests[i], mytests[i + 1]]
				});
				if (this.checkHitUsingImageData) {
					if (hit) {
						hit.x = parseInt(hit.x, 10);
						hit.y = parseInt(hit.y, 10);
						c = this.getImageDataValue(hit);
						if (this.get('imageDataChannel') === 'color') {
							hit = (c === 'rgba(0,0,0,0)') ? false : hit;
						}
						else {
							hit = (c > test) ? hit : false;
						}
					}
				}
				if (hit) {
					break;
				}
			}
			return (hit) ? hit : false;
		};


		return my;
	}(scrawl));
}
