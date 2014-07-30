/*! scrawl 2014-07-30 */
"use strict";var scrawl=function(a){return a.newWheel=function(b){return new a.Wheel(b)},a.workwheel={v1:a.newVector()},a.Wheel=function(b){return b=a.safeObject(b),a.Sprite.call(this,b),a.Position.prototype.set.call(this,b),this.radius=b.radius||a.d.Wheel.radius,this.width=2*this.radius,this.height=this.width,this.checkHitUsingRadius=a.isa(b.checkHitUsingRadius,"bool")?b.checkHitUsingRadius:a.d.Wheel.checkHitUsingRadius,this.closed=a.isa(b.closed,"bool")?b.closed:a.d.Wheel.closed,this.includeCenter=a.isa(b.includeCenter,"bool")?b.includeCenter:a.d.Wheel.includeCenter,this.clockwise=a.isa(b.clockwise,"bool")?b.clockwise:a.d.Wheel.clockwise,this.registerInLibrary(),a.pushUnique(a.group[this.group].sprites,this.name),this},a.Wheel.prototype=Object.create(a.Sprite.prototype),a.Wheel.prototype.type="Wheel",a.Wheel.prototype.classname="spritenames",a.d.Wheel={startAngle:0,endAngle:360,clockwise:!1,closed:!0,includeCenter:!1,checkHitUsingRadius:!0,checkHitRadius:0},a.mergeInto(a.d.Wheel,a.d.Sprite),a.Wheel.prototype.set=function(b){return a.Sprite.prototype.set.call(this,b),this.radius=b.radius||this.radius,this.width=2*this.radius,this.height=this.width,this},a.Wheel.prototype.setDelta=function(b){a.Sprite.prototype.setDelta.call(this,b),b=a.isa(b,"obj")?b:{};var c={};return a.xt(b.radius)&&(this.radius+=b.radius,this.width=2*this.radius,this.height=this.width),a.xt(b.startAngle)&&(c.startAngle=this.get("startAngle")+b.startAngle),a.xt(b.endAngle)&&(c.endAngle=this.get("endAngle")+b.endAngle),this.set(c),this},a.Wheel.prototype.checkHit=function(b){b=a.safeObject(b);var c,d,e,f=a.xt(b.tests)?b.tests:[b.x||!1,b.y||!1],g=!1;if(this.checkHitUsingRadius){d=this.checkHitRadius?this.checkHitRadius:this.radius*this.scale;for(var h=0,i=f.length;i>h&&(this.resetWork(),c=a.workwheel.v1.set({x:f[h],y:f[h+1]}),c.vectorSubtract(this.work.start).scalarDivide(this.scale).rotate(-this.roll),c.x=this.flipReverse?-c.x:c.x,c.y=this.flipUpend?-c.y:c.y,c.vectorAdd(this.getPivotOffsetVector(this.handle)),!(g=c.getMagnitude()<=d?!0:!1));h+=2);}else{e=a.cvx,this.buildPath(e);for(var h=0,i=f.length;i>h&&!(g=e.isPointInPath(f[h],f[h+1]));h+=2);}return g?{x:f[h],y:f[h+1]}:!1},a.Wheel.prototype.getPivotOffsetVector=function(){return this.getCenteredPivotOffsetVector()},a.Wheel.prototype.buildPath=function(b){var c=this.prepareStamp(),d=this.get("startAngle"),e=this.get("endAngle");return this.rotateCell(b),b.beginPath(),b.arc(c.x,c.y,this.radius*this.scale,d*a.radian,e*a.radian,this.clockwise),this.includeCenter&&b.lineTo(c.x,c.y),this.closed&&b.closePath(),this},a.Wheel.prototype.clip=function(a){return this.buildPath(a),a.clip(),this},a.Wheel.prototype.clear=function(b,c){return b.globalCompositeOperation="destination-out",this.buildPath(b),b.stroke(),b.fill(),b.globalCompositeOperation=a.ctx[c].get("globalCompositeOperation"),this},a.Wheel.prototype.clearWithBackground=function(b,c){var d=a.cell[c],e=d.get("backgroundColor"),f=a.ctx[c],g=f.get("fillStyle"),h=f.get("strokeStyle"),i=f.get("globalAlpha");return b.fillStyle=e,b.strokeStyle=e,b.globalAlpha=1,this.buildPath(b),b.stroke(),b.fill(),b.fillStyle=g,b.strokeStyle=h,b.globalAlpha=i,this},a.Wheel.prototype.draw=function(b,c){return a.cell[c].setEngine(this),this.buildPath(b),b.stroke(),this},a.Wheel.prototype.fill=function(b,c){return a.cell[c].setEngine(this),this.buildPath(b),b.fill(),this},a.Wheel.prototype.drawFill=function(b,c){return a.cell[c].setEngine(this),this.buildPath(b),b.stroke(),this.clearShadow(b,c),b.fill(),this},a.Wheel.prototype.fillDraw=function(b,c){return a.cell[c].setEngine(this),this.buildPath(b),b.fill(),this.clearShadow(b,c),b.stroke(),this},a.Wheel.prototype.sinkInto=function(b,c){return a.cell[c].setEngine(this),this.buildPath(b),b.fill(),b.stroke(),this},a.Wheel.prototype.floatOver=function(b,c){return a.cell[c].setEngine(this),this.buildPath(b),b.stroke(),b.fill(),this},a.Wheel.prototype.buildCollisionVectors=function(b){if(a.xt(a.workcols)){var c,d,e,f=[],g=a.workcols.v1.set({x:this.radius,y:0});c=a.xt(b)?this.parseCollisionPoints(b):this.collisionPoints;for(var h=0,i=c.length;i>h;h++)if(a.isa(c[h],"num")&&c[h]>1){d=a.workcols.v2.set(g),e=360/Math.floor(c[h]);for(var j=0;j<c[h];j++)d.rotate(e),f.push(d.x),f.push(d.y)}else if(a.isa(c[h],"str"))switch(d=a.workcols.v2.set(g),c[h]){case"start":f.push(0),f.push(0);break;case"N":d.rotate(-90),f.push(d.x),f.push(d.y);break;case"NE":d.rotate(-45),f.push(d.x),f.push(d.y);break;case"E":f.push(d.x),f.push(d.y);break;case"SE":d.rotate(45),f.push(d.x),f.push(d.y);break;case"S":d.rotate(90),f.push(d.x),f.push(d.y);break;case"SW":d.rotate(135),f.push(d.x),f.push(d.y);break;case"W":d.rotate(180),f.push(d.x),f.push(d.y);break;case"NW":d.rotate(-135),f.push(d.x),f.push(d.y);break;case"center":f.push(0),f.push(0)}else a.isa(c[h],"vector")&&(f.push(c[h].x),f.push(c[h].y))}return this.collisionVectors=f,this},a}(scrawl);