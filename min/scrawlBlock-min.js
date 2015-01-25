/*! scrawl-canvas 2015-01-25 */
if(window.scrawl&&window.scrawl.modules&&!window.scrawl.contains(window.scrawl.modules,"block"))var scrawl=function(a){"use strict";return a.newBlock=function(b){return new a.Block(b)},a.Block=function(b){return b=a.safeObject(b),a.Entity.call(this,b),a.Position.prototype.set.call(this,b),this.width=a.xtGet(b.width,a.d.Block.width),this.height=a.xtGet(b.height,a.d.Block.height),this.setLocalDimensions(),this.registerInLibrary(),a.pushUnique(a.group[this.group].entitys,this.name),this},a.Block.prototype=Object.create(a.Entity.prototype),a.Block.prototype.type="Block",a.Block.prototype.classname="entitynames",a.d.Block={localWidth:0,localHeight:0},a.mergeInto(a.d.Block,a.d.Entity),a.Block.prototype.set=function(b){return a.Entity.prototype.set.call(this,b),a.xto(b.width,b.height,b.scale)&&this.setLocalDimensions(),this},a.Block.prototype.setDelta=function(b){return a.Entity.prototype.setDelta.call(this,b),a.xto(b.width,b.height,b.scale)&&this.setLocalDimensions(),this},a.Block.prototype.setLocalDimensions=function(){var b=a.cell[a.group[this.group].cell];return this.localWidth=a.isa(this.width,"str")?parseFloat(this.width)/100*b.actualWidth*this.scale:this.width*this.scale||0,this.localHeight=a.isa(this.height,"str")?parseFloat(this.height)/100*b.actualHeight*this.scale:this.height*this.scale||0,this},a.Block.prototype.clip=function(a,b){var c=this.prepareStamp();return this.rotateCell(a,b),a.beginPath(),a.rect(c.x,c.y,this.localWidth,this.localHeight),a.clip(),this},a.Block.prototype.clear=function(b,c){var d=this.prepareStamp();return a.cell[c].setToClearShape(),this.rotateCell(b,c),b.clearRect(d.x,d.y,this.localWidth,this.localHeight),this},a.Block.prototype.clearWithBackground=function(b,c){var d=a.cell[c],e=d.get("backgroundColor"),f=a.ctx[c],g=f.get("fillStyle"),h=f.get("strokeStyle"),i=f.get("globalAlpha"),j=this.prepareStamp();return this.rotateCell(b,c),b.fillStyle=e,b.strokeStyle=e,b.globalAlpha=1,b.strokeRect(j.x,j.y,this.localWidth,this.localHeight),b.fillRect(j.x,j.y,this.localWidth,this.localHeight),b.fillStyle=g,b.strokeStyle=h,b.globalAlpha=i,this},a.Block.prototype.draw=function(b,c){var d=this.prepareStamp();return a.cell[c].setEngine(this),this.rotateCell(b,c),b.strokeRect(d.x,d.y,this.localWidth,this.localHeight),this},a.Block.prototype.fill=function(b,c){var d=this.prepareStamp();return a.cell[c].setEngine(this),this.rotateCell(b,c),b.fillRect(d.x,d.y,this.localWidth,this.localHeight),this},a.Block.prototype.drawFill=function(b,c){var d=this.prepareStamp();return a.cell[c].setEngine(this),this.rotateCell(b,c),b.strokeRect(d.x,d.y,this.localWidth,this.localHeight),this.clearShadow(b,c),b.fillRect(d.x,d.y,this.localWidth,this.localHeight),this},a.Block.prototype.fillDraw=function(b,c){var d=this.prepareStamp();return a.cell[c].setEngine(this),this.rotateCell(b,c),b.fillRect(d.x,d.y,this.localWidth,this.localHeight),this.clearShadow(b,c),b.strokeRect(d.x,d.y,this.localWidth,this.localHeight),this},a.Block.prototype.sinkInto=function(b,c){var d=this.prepareStamp();return a.cell[c].setEngine(this),this.rotateCell(b,c),b.fillRect(d.x,d.y,this.localWidth,this.localHeight),b.strokeRect(d.x,d.y,this.localWidth,this.localHeight),this},a.Block.prototype.floatOver=function(b,c){var d=this.prepareStamp();return a.cell[c].setEngine(this),this.rotateCell(b,c),b.strokeRect(d.x,d.y,this.localWidth,this.localHeight),b.fillRect(d.x,d.y,this.localWidth,this.localHeight),this},a.Block.prototype.none=function(){return this.prepareStamp(),this},a}(scrawl);