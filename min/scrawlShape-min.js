/*! scrawl-canvas 2014-11-01 */
if(window.scrawl&&!window.scrawl.newShape)var scrawl=function(a){"use strict";return a.newShape=function(b){return new a.Shape(b)},a.Shape=function(b){return b=a.isa(b,"obj")?b:{},a.Entity.call(this,b),a.Position.prototype.set.call(this,b),this.isLine=a.isa(b.isLine,"bool")?b.isLine:!0,this.dataSet=a.xt(this.data)?this.buildDataSet(this.data):"",this.registerInLibrary(),a.pushUnique(a.group[this.group].entitys,this.name),this},a.Shape.prototype=Object.create(a.Entity.prototype),a.Shape.prototype.type="Shape",a.Shape.prototype.classname="entitynames",a.d.Shape={dataSet:!1,isLine:!0,method:"draw"},a.mergeInto(a.d.Shape,a.d.Entity),a.Shape.prototype.set=function(b){return a.Entity.prototype.set.call(this,b),b=a.isa(b,"obj")?b:{},a.xt(b.data)&&(this.dataSet=this.buildDataSet(this.data),this.offset.flag=!1),this},a.Shape.prototype.getPivotOffsetVector=function(){return this.isLine?a.Entity.prototype.getPivotOffsetVector.call(this):this.getCenteredPivotOffsetVector()},a.Shape.prototype.buildDataSet=function(b){var c,d,e,f,g,h,i=[],j=999999,k=999999,l=-999999,m=-999999,n=this.start.x,o=this.start.y,p=b.match(/([A-Za-z][0-9. ,\-]*)/g),q=function(a,b){j=j>a?a:j,k=k>b?b:k,l=a>l?a:l,m=b>m?b:m};for(e=0,f=p.length;f>e;e++){if(c=p[e][0],d=p[e].match(/(-?[0-9.]+\b)/g)){for(g=0,h=d.length;h>g;g++)d[g]=parseFloat(d[g]);switch(c){case"H":for(g=0,h=d.length;h>g;g++)n=d[g],q(n,o);break;case"V":for(g=0,h=d.length;h>g;g++)o=d[g],q(n,o);break;case"M":for(g=0,h=d.length;h>g;g+=2)n=d[g],o=d[g+1],q(n,o);break;case"L":case"T":for(g=0,h=d.length;h>g;g+=2)n=d[g],o=d[g+1],q(n,o);break;case"Q":case"S":for(g=0,h=d.length;h>g;g+=4)n=d[g+2],o=d[g+3],q(n,o);break;case"C":for(g=0,h=d.length;h>g;g+=6)n=d[g+4],o=d[g+5],q(n,o);break;case"h":for(g=0,h=d.length;h>g;g++)n+=d[g],q(n,o);break;case"v":for(g=0,h=d.length;h>g;g++)o+=d[g],q(n,o);break;case"m":case"l":case"t":for(g=0,h=d.length;h>g;g+=2)n+=d[g],o+=d[g+1],q(n,o);break;case"q":case"s":for(g=0,h=d.length;h>g;g+=4)n+=d[g+2],o+=d[g+3],q(n,o);break;case"c":for(g=0,h=d.length;h>g;g+=6)n+=d[g+4],o+=d[g+5],q(n,o)}}i.push({c:c,p:d})}for(e=0,f=i.length;f>e;e++){if(a.contains(["M","L","C","Q","S","T"],i[e].c))for(g=0,h=i[e].p.length;h>g;g+=2)i[e].p[g]-=j,i[e].p[g+1]-=k;if("H"===i[e].c)for(g=0,h=i[e].p.length;h>g;g++)i[e].p[g]-=j;if("V"===i[e].c)for(g=0,h=i[e].p.length;h>g;g++)i[e].p[g]-=k}return this.width=l-j,this.height=m-k,i},a.Shape.prototype.doOutline=function(b,c){return a.cell[c].setEngine(this),!this.dataSet&&this.data&&this.buildDataSet(this.data),this.completeOutline(b,c)},a.Shape.prototype.completeOutline=function(b,c){if(this.dataSet){var d,e,f,g,h,i,j,k=this.prepareStamp(),l=0,m=0,n=0,o=0;for(this.rotateCell(b,c),b.translate(k.x,k.y),b.beginPath(),a.contains(["M"],this.dataSet[0].c)||b.moveTo(l,m),g=0,h=this.dataSet.length;h>g;g++)switch(d=this.dataSet[g],d.c){case"M":for(l=d.p[0],m=d.p[1],n=l,o=m,b.moveTo(l*this.scale,m*this.scale),i=2,j=d.p.length;j>i;i+=2)l=d.p[i],m=d.p[i+1],n=l,o=m,b.lineTo(l*this.scale,m*this.scale);break;case"m":for(l+=d.p[0],m+=d.p[1],n=l,o=m,b.moveTo(l*this.scale,m*this.scale),i=2,j=d.p.length;j>i;i+=2)l+=d.p[i],m+=d.p[i+1],n=l,o=m,b.lineTo(l*this.scale,m*this.scale);break;case"Z":case"z":b.closePath();break;case"L":for(i=0,j=d.p.length;j>i;i+=2)l=d.p[i],m=d.p[i+1],n=l,o=m,b.lineTo(l*this.scale,m*this.scale);break;case"l":for(i=0,j=d.p.length;j>i;i+=2)l+=d.p[i],m+=d.p[i+1],n=l,o=m,b.lineTo(l*this.scale,m*this.scale);break;case"H":for(i=0,j=d.p.length;j>i;i++)l=d.p[i],n=l,b.lineTo(l*this.scale,m*this.scale);break;case"h":for(i=0,j=d.p.length;j>i;i++)l+=d.p[i],n=l,b.lineTo(l*this.scale,m*this.scale);break;case"V":for(i=0,j=d.p.length;j>i;i++)m=d.p[i],o=m,b.lineTo(l*this.scale,m*this.scale);break;case"v":for(i=0,j=d.p.length;j>i;i++)m+=d.p[i],o=m,b.lineTo(l*this.scale,m*this.scale);break;case"C":for(i=0,j=d.p.length;j>i;i+=6)b.bezierCurveTo(d.p[i]*this.scale,d.p[i+1]*this.scale,d.p[i+2]*this.scale,d.p[i+3]*this.scale,d.p[i+4]*this.scale,d.p[i+5]*this.scale),n=d.p[i+2],o=d.p[i+3],l=d.p[i+4],m=d.p[i+5];break;case"c":for(i=0,j=d.p.length;j>i;i+=6)b.bezierCurveTo((l+d.p[i])*this.scale,(m+d.p[i+1])*this.scale,(l+d.p[i+2])*this.scale,(m+d.p[i+3])*this.scale,(l+d.p[i+4])*this.scale,(m+d.p[i+5])*this.scale),n=l+d.p[i+2],o=m+d.p[i+3],l+=d.p[i+4],m+=d.p[i+5];break;case"S":for(i=0,j=d.p.length;j>i;i+=4)g>0&&a.contains(["C","c","S","s"],this.dataSet[g-1].c)?(e=l+(l-n),f=m+(m-o)):(e=l,f=m),b.bezierCurveTo(e*this.scale,f*this.scale,d.p[i]*this.scale,d.p[i+1]*this.scale,d.p[i+2]*this.scale,d.p[i+3]*this.scale),n=d.p[i],o=d.p[i+1],l=d.p[i+2],m=d.p[i+3];break;case"s":for(i=0,j=d.p.length;j>i;i+=4)g>0&&a.contains(["C","c","S","s"],this.dataSet[g-1].c)?(e=l+(l-n),f=m+(m-o)):(e=l,f=m),b.bezierCurveTo(e*this.scale,f*this.scale,(l+d.p[i])*this.scale,(m+d.p[i+1])*this.scale,(l+d.p[i+2])*this.scale,(m+d.p[i+3])*this.scale),n=l+d.p[i],o=m+d.p[i+1],l+=d.p[i+2],m+=d.p[i+3];break;case"Q":for(i=0,j=d.p.length;j>i;i+=4)b.quadraticCurveTo(d.p[i]*this.scale,d.p[i+1]*this.scale,d.p[i+2]*this.scale,d.p[i+3]*this.scale),n=d.p[i],o=d.p[i+1],l=d.p[i+2],m=d.p[i+3];break;case"q":for(i=0,j=d.p.length;j>i;i+=4)b.quadraticCurveTo((l+d.p[i])*this.scale,(m+d.p[i+1])*this.scale,(l+d.p[i+2])*this.scale,(m+d.p[i+3])*this.scale),n=l+d.p[i],o=m+d.p[i+1],l+=d.p[i+2],m+=d.p[i+3];break;case"T":for(i=0,j=d.p.length;j>i;i+=2)g>0&&a.contains(["Q","q","T","t"],this.dataSet[g-1].c)?(e=l+(l-n),f=m+(m-o)):(e=l,f=m),b.quadraticCurveTo(e*this.scale,f*this.scale,d.p[i]*this.scale,d.p[i+1]*this.scale),n=e,o=f,l=d.p[i],m=d.p[i+1];break;case"t":for(i=0,j=d.p.length;j>i;i+=2)g>0&&a.contains(["Q","q","T","t"],this.dataSet[g-1].c)?(e=l+(l-n),f=m+(m-o)):(e=l,f=m),b.quadraticCurveTo(e*this.scale,f*this.scale,(l+d.p[i])*this.scale,(m+d.p[i+1])*this.scale),n=e,o=f,l+=d.p[i],m+=d.p[i+1]}}return this},a.Shape.prototype.clip=function(a,b){return a.save(),this.doOutline(a,b),a.clip(),this},a.Shape.prototype.clear=function(b,c){var d=a.cell[c];return this.clip(b,c),b.clearRect(0,0,d.get("actualWidth"),d.get(".actualHeight")),b.restore(),this},a.Shape.prototype.clearWithBackground=function(b,c){var d=a.cell[c];return this.clip(b,c),b.fillStyle=d.backgroundColor,b.fillRect(0,0,d.get("actualWidth"),d.get("actualHeight")),b.fillStyle=a.ctx[c].get("fillStyle"),b.restore(),this},a.Shape.prototype.draw=function(a,b){return this.doOutline(a,b),a.stroke(),this},a.Shape.prototype.fill=function(b,c){return this.doOutline(b,c),b.fill(a.ctx[this.context].get("winding")),this},a.Shape.prototype.drawFill=function(b,c){return this.doOutline(b,c),b.stroke(),this.clearShadow(b,c),b.fill(a.ctx[this.context].get("winding")),this},a.Shape.prototype.fillDraw=function(b,c){return this.doOutline(b,c),b.fill(a.ctx[this.context].get("winding")),this.clearShadow(b,c),b.stroke(),this},a.Shape.prototype.sinkInto=function(b,c){return this.doOutline(b,c),b.fill(a.ctx[this.context].get("winding")),b.stroke(),this},a.Shape.prototype.floatOver=function(b,c){return this.doOutline(b,c),b.stroke(),b.fill(a.ctx[this.context].get("winding")),this},a.Shape.prototype.checkHit=function(b){b=a.isa(b,"obj")?b:{};var c=a.cvx,d=a.xt(b.tests)?[].concat(b.tests):[b.x||!1,b.y||!1],e=!1,f=a.ctx[this.context].winding;c.mozFillRule=f,c.msFillRule=f,this.completeOutline(c,a.group[this.group].cell);for(var g=0,h=d.length;h>g&&!(e=c.isPointInPath(d[g],d[g+1]));g+=2);return e?{x:d[g],y:d[g+1]}:!1},a.Shape.prototype.buildCollisionVectors=function(b){if(this.isLine)a.Entity.prototype.buildCollisionVectors.call(this,b);else{for(var c=a.xt(b)?this.parseCollisionPoints(b):this.collisionPoints,d=this.getOffsetStartVector().reverse(),e=this.width/2,f=this.height/2,g=[],h=0,i=c.length;i>h;h++)if(a.isa(c[h],"str"))switch(c[h]){case"start":g.push(0),g.push(0);break;case"N":g.push(-d.x),g.push(-f-d.y);break;case"NE":g.push(e-d.x),g.push(-f-d.y);break;case"E":g.push(e-d.x),g.push(-d.y);break;case"SE":g.push(e-d.x),g.push(f-d.y);break;case"S":g.push(-d.x),g.push(f-d.y);break;case"SW":g.push(-e-d.x),g.push(f-d.y);break;case"W":g.push(-e-d.x),g.push(-d.y);break;case"NW":g.push(-e-d.x),g.push(-f-d.y);break;case"center":g.push(-d.x),g.push(-d.y)}else a.isa(c[h],"vector")&&(g.push(c[h].x),g.push(c[h].y));this.collisionVectors=g}return this},a}(scrawl);