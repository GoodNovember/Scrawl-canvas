/*! scrawl 2014-07-30 */
"use strict";var scrawl=function(a){return a.pathDeleteSprite=function(b){var c,d;if("Path"===b.type){c=b.getFullPointList(),d=b.getFullLinkList();for(var e=0,f=c.length;f>e;e++)a.removeItem(a.pointnames,c[e]),delete a.point[c[e]];for(var e=0,f=d.length;f>e;e++)a.removeItem(a.linknames,d[e]),delete a.link[d[e]]}},a.Base.prototype.clone=function(b){var c=a.mergeOver(this.parse(),a.safeObject(b));return delete c.context,"Path"===this.type?a.makePath(c):new a[this.type](c)},a.d.Position.pathPlace=0,a.d.Position.pathRoll=0,a.d.Position.addPathRoll=!1,a.d.Position.path="",a.mergeInto(a.d.Cell,a.d.Position),a.mergeInto(a.d.Sprite,a.d.Position),a.xt(a.d.Block)&&a.mergeInto(a.d.Block,a.d.Sprite),a.xt(a.d.Shape)&&a.mergeInto(a.d.Shape,a.d.Sprite),a.xt(a.d.Wheel)&&a.mergeInto(a.d.Wheel,a.d.Sprite),a.xt(a.d.Picture)&&a.mergeInto(a.d.Picture,a.d.Sprite),a.xt(a.d.Phrase)&&a.mergeInto(a.d.Phrase,a.d.Sprite),a.Position.prototype.pathPositionInit=function(b){this.path=b.path||a.d[this.type].path,this.pathRoll=b.pathRoll||a.d[this.type].pathRoll,this.addPathRoll=b.addPathRoll||a.d[this.type].addPathRoll,this.pathPlace=b.pathPlace||a.d[this.type].pathPlace},a.Position.prototype.pathPositionSetDelta=function(a){a.pathPlace&&(this.pathPlace+=a.pathPlace)},a.Cell.prototype.pathPrepareToCopyCell=function(){var b;a.contains(a.spritenames,this.path)&&"Path"===a.sprite[this.path].type&&(b=a.sprite[this.path].getPerimeterPosition(this.pathPlace,this.pathSpeedConstant,this.addPathRoll),this.start.x=this.lockX?this.start.x:b.x,this.start.y=this.lockY?this.start.y:b.y,this.pathRoll=b.r||0)},a.Sprite.prototype.pathStamp=function(){var b;a.contains(a.spritenames,this.path)&&"Path"===a.sprite[this.path].type&&(b=a.sprite[this.path].getPerimeterPosition(this.pathPlace,this.pathSpeedConstant,this.addPathRoll),this.start.x=this.lockX?this.start.x:b.x,this.start.y=this.lockY?this.start.y:b.y,this.pathRoll=b.r||0)},a.newPoint=function(b){return new a.Point(b)},a.newLink=function(b){return new a.Link(b)},a.newPath=function(b){return new a.Path(b)},a.makePath=function(b){b=a.isa(b,"obj")?b:{};var c,d,e,f,g,h,i,j,k,l=999999,m=999999,n=-999999,o=-999999,p=0,q=0,r=0,s=0,t=a.xt(b.pivot)?a.point[t]||a.sprite[t]:!1;b.start=a.xt(b.start)?b.start:{},b.scaleX=b.scaleX||1,b.scaleY=b.scaleY||1,b.startX=t?"Point"===t.type?t.local.x:t.start.x:b.startX||b.start.x||0,b.startY=t?"Point"===t.type?t.local.y:t.start.y:b.startY||b.start.y||0,b.isLine=a.isa(b.isLine,"bool")?b.isLine:!0;var u=function(a,b){l=l>a?a:l,m=m>b?b:m,n=a>n?a:n,o=b>o?b:o},v=function(a){var b=a.match(/(-?[0-9.]+\b)/g);if(b){for(var c=0,d=b.length;d>c;c++)b[c]=parseFloat(b[c]);return b}return!1},w=function(b,c,d,e,f,g,h,i){a.newPoint({name:b+"_p"+c,sprite:d,currentX:e*h,currentY:f*i,startLink:b+"_l"+g})},x=function(c,d,e,f,g,h,i,j,k){i=a.xt(i)?i:{},j=a.xt(j)?j:{},k=a.xt(k)?k:{},a.newLink({name:c+"_l"+d,sprite:e,species:f,startPoint:h.name,endPoint:i.name||!1,controlPoint1:j.name||!1,controlPoint2:k.name||!1,precision:b.precision||!1,action:g})};if(a.xt(b.data)&&(c=a.newPath(b),d=c.name,e=d.replace("~","_","g"),f=a.point,g=b.scaleX,h=b.scaleY,c)){i=b.data.match(/([A-Za-z][0-9. ,\-]*)/g),w(e,q,d,r,s,p,g,h),q++;for(var y=0,z=i.length;z>y;y++)switch(k=i[y][0],j=v(i[y]),k){case"M":r=j[0],s=j[1],u(r,s),w(e,q,d,r,s,p+1,g,h),q++,x(e,p,d,!1,"move",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++;for(var A=2,B=j.length;B>A;A+=2)w(e,q,d,j[A],j[A+1],p+1,g,h),q++,x(e,p,d,"line","add",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++,r=j[A],s=j[A+1],u(r,s);break;case"m":0===y?(r=j[0],s=j[1]):(r+=j[0],s+=j[1]),u(r,s),w(e,q,d,r,s,p+1,g,h),q++,x(e,p,d,!1,"move",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++;for(var A=2,B=j.length;B>A;A+=2)w(e,q,d,r+j[A],s+j[A+1],p+1,g,h),q++,x(e,p,d,"line","add",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++,r+=j[A],s+=j[A+1],u(r,s);break;case"Z":case"z":w(e,q,d,c.start.x,c.start.y,p+1,g,h),q++,x(e,p,d,!1,"close",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++;break;case"L":for(var A=0,B=j.length;B>A;A+=2)w(e,q,d,j[A],j[A+1],p+1,g,h),q++,x(e,p,d,"line","add",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++,r=j[A],s=j[A+1],u(r,s);break;case"l":for(var A=0,B=j.length;B>A;A+=2)w(e,q,d,r+j[A],s+j[A+1],p+1,g,h),q++,x(e,p,d,"line","add",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++,r+=j[A],s+=j[A+1],u(r,s);break;case"H":for(var A=0,B=j.length;B>A;A++)w(e,q,d,j[A],s,p+1,g,h),q++,x(e,p,d,"line","add",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++,r=j[A],u(r,s);break;case"h":for(var A=0,B=j.length;B>A;A++)w(e,q,d,r+j[A],s,p+1,g,h),q++,x(e,p,d,"line","add",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++,r+=j[A],u(r,s);break;case"V":for(var A=0,B=j.length;B>A;A++)w(e,q,d,r,j[A],p+1,g,h),q++,x(e,p,d,"line","add",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++,s=j[A],u(r,s);break;case"v":for(var A=0,B=j.length;B>A;A++)w(e,q,d,r,s+j[A],p+1,g,h),q++,x(e,p,d,"line","add",f[e+"_p"+(q-2)],f[e+"_p"+(q-1)]),p++,s+=j[A],u(r,s);break;case"C":for(var A=0,B=j.length;B>A;A+=6)w(e,q,d,j[A],j[A+1],p+1,g,h),q++,w(e,q,d,j[A+2],j[A+3],p+1,g,h),q++,w(e,q,d,j[A+4],j[A+5],p+1,g,h),q++,x(e,p,d,"bezier","add",f[e+"_p"+(q-4)],f[e+"_p"+(q-1)],f[e+"_p"+(q-3)],f[e+"_p"+(q-2)]),p++,r=j[A+4],s=j[A+5],u(r,s);break;case"c":for(var A=0,B=j.length;B>A;A+=6)w(e,q,d,r+j[A],s+j[A+1],p+1,g,h),q++,w(e,q,d,r+j[A+2],s+j[A+3],p+1,g,h),q++,w(e,q,d,r+j[A+4],s+j[A+5],p+1,g,h),q++,x(e,p,d,"bezier","add",f[e+"_p"+(q-4)],f[e+"_p"+(q-1)],f[e+"_p"+(q-3)],f[e+"_p"+(q-2)]),p++,r+=j[A+4],s+=j[A+5],u(r,s);break;case"S":for(var A=0,B=j.length;B>A;A+=4)y>0&&a.contains(["C","c","S","s"],i[y-1][0])?(f[e+"_p"+(q-2)].clone({name:e+"_p"+q,currentX:r+(r-f[e+"_p"+(q-2)].currentX),currentY:s+(s-f[e+"_p"+(q-2)].currentY)}),q++):(w(e,q,d,r,s,p+1,g,h),q++),w(e,q,d,j[A],j[A+1],p+1,g,h),q++,w(e,q,d,j[A+2],j[A+3],p+1,g,h),q++,x(e,p,d,"bezier","add",f[e+"_p"+(q-4)],f[e+"_p"+(q-1)],f[e+"_p"+(q-3)],f[e+"_p"+(q-2)]),p++,r=j[A+2],s=j[A+3],u(r,s);break;case"s":for(var A=0,B=j.length;B>A;A+=4)y>0&&a.contains(["C","c","S","s"],i[y-1][0])?(f[e+"_p"+(q-2)].clone({name:e+"_p"+q,currentX:r+(r-f[e+"_p"+(q-2)].currentX),currentY:s+(s-f[e+"_p"+(q-2)].currentY)}),q++):(w(e,q,d,r,s,p+1,g,h),q++),w(e,q,d,j[A],j[A+1],p+1,g,h),q++,w(e,q,d,j[A+2],j[A+3],p+1,g,h),q++,x(e,p,d,"bezier","add",f[e+"_p"+(q-4)],f[e+"_p"+(q-1)],f[e+"_p"+(q-3)],f[e+"_p"+(q-2)]),p++,r+=j[A+2],s+=j[A+3],u(r,s);break;case"Q":for(var A=0,B=j.length;B>A;A+=4)w(e,q,d,j[A],j[A+1],p+1,g,h),q++,w(e,q,d,j[A+2],j[A+3],p+1,g,h),q++,x(e,p,d,"quadratic","add",f[e+"_p"+(q-3)],f[e+"_p"+(q-1)],f[e+"_p"+(q-2)]),p++,r=j[A+2],s=j[A+3],u(r,s);break;case"q":for(var A=0,B=j.length;B>A;A+=4)w(e,q,d,r+j[A],s+j[A+1],p+1,g,h),q++,w(e,q,d,r+j[A+2],s+j[A+3],p+1,g,h),q++,x(e,p,d,"quadratic","add",f[e+"_p"+(q-3)],f[e+"_p"+(q-1)],f[e+"_p"+(q-2)]),p++,r+=j[A+2],s+=j[A+3],u(r,s);break;case"T":for(var A=0,B=j.length;B>A;A+=2)y>0&&a.contains(["Q","q","T","t"],i[y-1][0])?(f[e+"_p"+(q-2)].clone({name:e+"_p"+q,currentX:r+(r-f[e+"_p"+(q-2)].currentX),currentY:s+(s-f[e+"_p"+(q-2)].currentY)}),q++):(w(e,q,d,r,s,p+1,g,h),q++),w(e,q,d,j[A],j[A+1],p+1,g,h),q++,x(e,p,d,"quadratic","add",f[e+"_p"+(q-3)],f[e+"_p"+(q-1)],f[e+"_p"+(q-2)]),p++,r=j[A],s=j[A+1],u(r,s);break;case"t":for(var A=0,B=j.length;B>A;A+=2)y>0&&a.contains(["Q","q","T","t"],i[y-1][0])?(f[e+"_p"+(q-2)].clone({name:e+"_p"+q,currentX:r+(r-f[e+"_p"+(q-2)].currentX),currentY:s+(s-f[e+"_p"+(q-2)].currentY)}),q++):(w(e,q,d,r,s,p+1,g,h),q++),w(e,q,d,j[A],j[A+1],p+1,g,h),q++,x(e,p,d,"quadratic","add",f[e+"_p"+(q-3)],f[e+"_p"+(q-1)],f[e+"_p"+(q-2)]),p++,r+=j[A],s+=j[A+1],u(r,s)}return x(e,p,d,!1,"end",f[e+"_p"+(q-1)],f[e+"_p"+q]),c.set({firstPoint:e+"_p0",width:(n-l)*b.scaleX,height:(o-m)*b.scaleY}),c.buildPositions(),c}return!1},a.pushUnique(a.sectionlist,"point"),a.pushUnique(a.nameslist,"pointnames"),a.pushUnique(a.sectionlist,"link"),a.pushUnique(a.nameslist,"linknames"),a.Path=function(b){return b=a.safeObject(b),a.Sprite.call(this,b),a.Position.prototype.set.call(this,b),this.isLine=a.isa(b.isLine,"bool")?b.isLine:!0,this.linkList=[],this.linkDurations=[],this.pointList=[],this.registerInLibrary(),a.pushUnique(a.group[this.group].sprites,this.name),this},a.Path.prototype=Object.create(a.Sprite.prototype),a.Path.prototype.type="Path",a.Path.prototype.classname="spritenames",a.d.Path={firstPoint:"",isLine:!0,closed:!0,linkList:[],linkDurations:[],pointList:[],perimeterLength:0,markStart:"",markMid:"",markEnd:"",mark:"",method:"draw",precision:10},a.mergeInto(a.d.Path,a.d.Sprite),a.Path.prototype.prepareShape=function(b,c){var d;return a.cell[c].setEngine(this),this.firstPoint&&(d=this.prepareStamp(),this.rotateCell(b),b.translate(d.x,d.y),b.beginPath(),a.link[a.point[this.firstPoint].startLink].sketch(b)),this},a.Path.prototype.getPivotOffsetVector=function(){return this.isLine?a.Sprite.prototype.getPivotOffsetVector.call(this):this.getCenteredPivotOffsetVector()},a.Path.prototype.stampMark=function(a,b,c,d){var e,f,g,h;return e=a.path,f=a.pathPlace,g=a.group,h=a.handle,a.set({path:this.name,pathPlace:b,group:d,handle:this.handle}).forceStamp(),a.set({path:e,pathPlace:f,group:g,handle:h}),this},a.Path.prototype.addMarks=function(b,c){var d,e,f=this.get("mark"),g=this.get("markStart"),h=this.get("markMid"),i=this.get("markEnd"),j=!1;if(f||g||h||i){if(this.buildPositions(),e=this.get("linkDurations"),j=g||f||!1,j&&a.contains(a.spritenames,j)&&this.stampMark(a.sprite[j],0,b,c),j=h||f||!1,j&&a.contains(a.spritenames,j)){d=a.sprite[j];for(var k=0,l=e.length-1;l>k;k++)this.stampMark(d,e[k],b,c)}j=i||f||!1,j&&a.contains(a.spritenames,j)&&this.stampMark(a.sprite[j],1,b,c)}return this},a.Path.prototype.clip=function(a,b){return this.closed&&(this.prepareShape(a,b),a.clip()),this},a.Path.prototype.clear=function(b,c){return this.prepareShape(b,c),b.globalCompositeOperation="destination-out",b.stroke(),b.fill(a.ctx[this.context].get("winding")),b.globalCompositeOperation=a.ctx[c].get("globalCompositeOperation"),this},a.Path.prototype.clearWithBackground=function(b,c){{var d=a.cell[c],e=d.get("backgroundColor"),f=a.ctx[c],g=f.get("fillStyle"),h=f.get("strokeStyle");f.get("globalAlpha")}return this.prepareShape(b,c),b.fillStyle=e,b.strokeStyle=e,b.globalAlpha=1,b.stroke(),b.fill(a.ctx[this.context].get("winding")),b.fillStyle=g,b.strokeStyle=h,b.globalAlpha=globalAlpha,this},a.Path.prototype.fill=function(b,c){return this.get("closed")&&(this.prepareShape(b,c),b.fill(a.ctx[this.context].get("winding")),this.addMarks(b,c)),this},a.Path.prototype.draw=function(a,b){return this.prepareShape(a,b),a.stroke(),this.addMarks(a,b),this},a.Path.prototype.drawFill=function(b,c){return this.prepareShape(b,c),b.stroke(),this.get("closed")&&(this.clearShadow(b,c),b.fill(a.ctx[this.context].get("winding"))),this.addMarks(b,c),this},a.Path.prototype.fillDraw=function(b,c){return this.prepareShape(b,c),this.get("closed")&&(b.fill(a.ctx[this.context].get("winding")),this.clearShadow(b,c)),b.stroke(),this.addMarks(b,c),this},a.Path.prototype.sinkInto=function(b,c){return this.prepareShape(b,c),this.get("closed")&&b.fill(a.ctx[this.context].get("winding")),b.stroke(),this.addMarks(b,c),this},a.Path.prototype.floatOver=function(b,c){return this.prepareShape(b,c),b.stroke(),this.get("closed")&&b.fill(a.ctx[this.context].get("winding")),this.addMarks(b,c),this},a.Path.prototype.none=function(a,b){return this.prepareShape(a,b),this},a.Path.prototype.getFullPointList=function(){for(var b=[],c=new RegExp(this.name+"_.*"),d=0,e=a.pointnames.length;e>d;d++)c.test(a.pointnames[d])&&b.push(a.pointnames[d]);return b},a.Path.prototype.getFullLinkList=function(){for(var b=[],c=new RegExp(this.name+"_.*"),d=0,e=a.linknames.length;e>d;d++)c.test(a.linknames[d])&&b.push(a.linknames[d]);return b},a.Path.prototype.getPerimeterLength=function(a){return(a||!this.get("perimeterLength")||0===this.get("linkDurations").length)&&this.buildPositions(),this.get("perimeterLength")},a.Path.prototype.buildPositions=function(){for(var b,c,d,e=this.get("linkList"),f=[],g=0,h=0,i=e.length;i>h;h++)a.link[e[h]].setPositions();for(var h=0,i=e.length;i>h;h++)c=a.link[e[h]],d=c.get("positions"),b=d[d.length-1].cumulativeLength,g+=b,f.push(g);for(var h=0,i=e.length;i>h;h++)f[h]/=g;return a.Base.prototype.set.call(this,{perimeterLength:g,linkDurations:f}),this},a.Path.prototype.getPerimeterPosition=function(b,c,d,e){b=a.isa(b,"num")?b:1,c=a.isa(c,"bool")?c:!0,d=a.isa(d,"bool")?d:!1,e=a.isa(e,"bool")?e:!1;var f,g,h,i,j,k,l,m,n,o,p,q,r;this.getPerimeterLength(),h=this.get("linkList"),i=this.get("linkDurations");for(var s=0,t=h.length;t>s;s++)if(f=a.link[h[s]],i[s]>=b)return g=0===s?b/i[s]:(b-i[s-1])/(i[s]-i[s-1]),g=0>g?0:g>1?1:g,l=0>g-1e-7?0:g-1e-7,o=g+1e-7>1?1:g+1e-7,c?d?(r=e?f.getLocalSteadyPositionOnLink(l):f.getSteadyPositionOnLink(l),j=r.x,k=r.y,r=e?f.getLocalSteadyPositionOnLink(o):f.getSteadyPositionOnLink(o),m=r.x,n=r.y,q=Math.atan2(n-k,m-j)/a.radian,p=e?f.getLocalSteadyPositionOnLink(g):f.getSteadyPositionOnLink(g),{x:p.x,y:p.y,r:q}):e?f.getLocalSteadyPositionOnLink(g):f.getSteadyPositionOnLink(g):d?(r=e?f.getLocalPositionOnLink(l):f.getPositionOnLink(l),j=r.x,k=r.y,r=e?f.getLocalPositionOnLink(o):f.getPositionOnLink(o),m=r.x,n=r.y,q=Math.atan2(n-k,m-j)/a.radian,p=e?f.getLocalPositionOnLink(g):f.getPositionOnLink(g),{x:p.x,y:p.y,r:q}):e?f.getLocalPositionOnLink(g):f.getPositionOnLink(g);return!1},a.Path.prototype.checkHit=function(b){b=a.safeObject(b);var c,d=a.cvx,e=a.xt(b.tests)?[].concat(b.tests):[b.x||!1,b.y||!1],f=!1,g=a.ctx[this.context].winding;d.mozFillRule=g,d.msFillRule=g,this.firstPoint&&(c=this.prepareStamp(),this.rotateCell(d),d.translate(c.x,c.y),d.beginPath(),a.link[a.point[this.firstPoint].startLink].sketch(d));for(var h=0,i=e.length;i>h&&!(f=d.isPointInPath(e[h],e[h+1]));h+=2);return f?{x:e[h],y:e[h+1]}:!1},a.Path.prototype.buildCollisionVectors=function(b){if(a.xt(a.d.Path.fieldChannel))for(var c,d,e=a.xt(b)?this.parseCollisionPoints(b):this.collisionPoints,f=[],g=0,h=0,i=e.length;i>h;h++)if(a.isa(e[h],"num")&&e[h]>=0)if(e[h]>1){c=1/e[h];for(var j=0;j<e[h];j++)d=this.getPerimeterPosition(g,!0,!1,!0),f.push(d.x),f.push(d.y),g+=c}else d=this.getPerimeterPosition(e[h],!0,!1,!0),f.push(d.x),f.push(d.y);else if(a.isa(e[h],"str"))switch(e[h]){case"start":f.push(0),f.push(0)}else a.isa(e[h],"vector")&&(f.push(e[h].x),f.push(e[h].y));return this.collisionVectors=f,this},a.Point=function(b){b=a.safeObject(b),a.Base.call(this,b);var c=a.xt(b.local)?b.local:{};return this.sprite=b.sprite||"",this.local=b.local||a.newVector({x:b.startX||b.currentX||c.x||0,y:b.startY||b.currentY||c.y||0}),this.work.local=a.newVector({name:this.type+"."+this.name+".work.local"}),this.work.local.name=this.type+"."+this.name+".work.local",this.startLink=b.startLink||"",this.fixed=b.fixed||!1,a.xto([b.angle,b.distance])&&this.setPolar(b),a.point[this.name]=this,a.pushUnique(a.pointnames,this.name),this.sprite&&"Path"===a.sprite[this.sprite].type&&a.pushUnique(a.sprite[this.sprite].pointList,this.name),this},a.Point.prototype=Object.create(a.Base.prototype),a.Point.prototype.type="Point",a.Point.prototype.classname="pointnames",a.d.Point={sprite:"",local:{x:0,y:0,z:0},startLink:"",fixed:!1},a.mergeInto(a.d.Point,a.d.Base),a.Point.prototype.set=function(b){a.Base.prototype.set.call(this,b),b=a.safeObject(b);var c=a.xt(b.local)?b.local:{};return a.xto([b.distance,b.angle])?this.setPolar(b):a.xto([b.startX,b.startY,b.currentX,b.currentY,b.local])&&(this.local.x=a.xt(b.startX)?b.startX:a.xt(b.currentX)?b.currentX:a.xt(c.x)?c.x:this.local.x,this.local.y=a.xt(b.startY)?b.startY:a.xt(b.currentY)?b.currentY:a.xt(c.y)?c.y:this.local.y),this},a.Point.prototype.setDelta=function(b){var c,d,e,f=a.xt(b.local)?b.local:{};return b=a.safeObject(b),a.xto([b.startX,b.startY,b.currentX,b.currentY,b.local])&&(this.local.x+=a.xt(b.startX)?b.startX:a.xt(b.currentX)?b.currentX:a.xt(f.x)?f.x:0,this.local.y+=a.xt(b.startY)?b.startY:a.xt(b.currentY)?b.currentY:a.xt(f.y)?f.y:0),a.xt(b.distance)&&(c=this.local.getMagnitude(),this.local.scalarMultiply((b.distance+c)/c)),a.xt(b.angle)&&(d=this.local.getMagnitude(),e=Math.atan2(this.local.y,this.local.x),e+=b.angle*a.radian,this.local.x=d*Math.cos(e),this.local.y=d*Math.sin(e)),this},a.Point.prototype.setPolar=function(b){var c,d,e;return a.Base.prototype.set.call(this,b),b=a.safeObject(b),a.xta([b.distance,b.angle])?(e=b.angle*a.radian,this.local.x=b.distance*Math.cos(e),this.local.y=b.distance*Math.sin(e)):(a.xt(b.distance)&&(c=this.local.getMagnitude(),c=a.xt(c)&&c>1e-7?c:1,this.local.scalarMultiply(b.distance/c)),a.xt(b.angle)&&(d=this.local.getMagnitude(),e=b.angle*a.radian,this.local.x=d*Math.cos(e),this.local.y=d*Math.sin(e))),this},a.Point.prototype.getData=function(){var b,c,d=a.sprite[this.sprite],e=this.fixed,f=d.scale;return this.resetWork(),a.xt(this.local)&&"Vector"===this.local.type?(b=this.work.local,a.isa(e,"str")&&(a.contains(a.spritenames,e)||a.contains(a.pointnames,e))?(c=a.sprite[e]||a.point[e],"Point"===c.type?(b.set(c.local),b.scalarMultiply(f||1)):"Particle"===c.type?b.set(c.get("place")):b.set(c.start)):e?(b.vectorSubtract(d.start||{}),b.scalarMultiply(f||1),b.rotate(-d.roll)):b.scalarMultiply(f||1),{name:this.name,current:b,startLink:this.startLink}):!1},a.Point.prototype.getCurrentCoordinates=function(){return this.getData().current},a.Point.prototype.setToFixed=function(b,c){var d,e;return a.isa(b,"str")?this.fixed=b:(d=a.isa(b,"obj")&&a.xt(b.x)?b.x:a.isa(b,"num")?b:0,e=a.isa(b,"obj")&&a.xt(b.y)?b.y:a.isa(c,"num")?c:0,this.local.set({x:d,y:e}),this.fixed=!0),this},a.Link=function(b){return b=a.safeObject(b),a.Base.call(this,b),a.Base.prototype.set.call(this,b),this.startPoint=b.startPoint||a.d.Link.startPoint,this.sprite=a.xt(a.point[this.startPoint])?a.point[this.startPoint].sprite:a.d.Link.sprite,this.endPoint=b.endPoint||a.d.Link.endPoint,this.species=b.species||a.d.Link.species,this.action=b.action||a.d.Link.action,a.link[this.name]=this,a.pushUnique(a.linknames,this.name),this.positions=[],this.startPoint&&this.sprite&&"add"===this.action&&a.pushUnique(a.sprite[this.sprite].linkList,this.name),this},a.Link.prototype=Object.create(a.Base.prototype),a.Link.prototype.type="Link",a.Link.prototype.classname="linknames",a.xt(a.worklink)||(a.worklink={start:a.newVector({name:"scrawl.worklink.start"}),end:a.newVector({name:"scrawl.worklink.end"}),control1:a.newVector({name:"scrawl.worklink.control1"}),control2:a.newVector({name:"scrawl.worklink.control2"}),v1:a.newVector({name:"scrawl.worklink.v1"}),v2:a.newVector({name:"scrawl.worklink.v2"}),v3:a.newVector({name:"scrawl.worklink.v3"})}),a.d.Link={species:"",startPoint:"",sprite:"",endPoint:"",controlPoint1:"",controlPoint2:"",action:"add",length:0,positions:[]},a.mergeInto(a.d.Link,a.d.Base),a.Link.prototype.set=function(b){return a.Base.prototype.set.call(this,b),b=a.safeObject(b),a.isa(b.sprite,"str")&&b.sprite!==this.sprite&&this.sprite&&a.removeItem(a.sprite[this.sprite].linkList,this.name),a.isa(b.action,"str")&&this.sprite&&a.contains(a.spritenames,this.sprite)&&("add"===b.action?a.pushUnique(a.sprite[this.sprite].linkList,this.name):a.removeItem(a.sprite[this.sprite].linkList,this.name)),this},a.Link.prototype.pointOnLine=function(b,c,d){return b&&c&&a.isa(d,"num")?c.vectorSubtract(b).scalarMultiply(d).vectorAdd(b):!1},a.Link.prototype.getPointCoordinates=function(){return a.worklink.start.set(this.startPoint?a.point[this.startPoint].getCurrentCoordinates():{x:0,y:0,z:0}),a.worklink.end.set(this.endPoint?a.point[this.endPoint].getCurrentCoordinates():{x:0,y:0,z:0}),a.worklink.control1.set(this.controlPoint1?a.point[this.controlPoint1].getCurrentCoordinates():{x:0,y:0,z:0}),a.worklink.control2.set(this.controlPoint2?a.point[this.controlPoint2].getCurrentCoordinates():{x:0,y:0,z:0}),a.worklink},a.Link.prototype.getLocalPositionOnLink=function(b){b=a.isa(b,"num")?b:1;var c,d,e,f,g,h,i;switch(this.getPointCoordinates(),this.species){case"line":a.worklink.v1.set(this.pointOnLine(a.worklink.start,a.worklink.end,b));break;case"quadratic":d=this.pointOnLine(a.worklink.control1,a.worklink.end,b),c=this.pointOnLine(a.worklink.start,a.worklink.control1,b),a.worklink.v1.set(this.pointOnLine(c,d,b));break;case"bezier":g=this.pointOnLine(a.worklink.control2,a.worklink.end,b),f=this.pointOnLine(a.worklink.control1,a.worklink.control2,b),e=this.pointOnLine(a.worklink.start,a.worklink.control1,b),i=this.pointOnLine(f,g,b),h=this.pointOnLine(e,f,b),a.worklink.v1.set(this.pointOnLine(h,i,b));break;default:a.worklink.v1.set({x:0,y:0,z:0})}return a.worklink.v1},a.Link.prototype.getPositionOnLink=function(b){var c,d=a.sprite[this.sprite],e=(d.scale,d.roll);return a.isa(b,"num")?(c=this.getLocalPositionOnLink(b),c.rotate(e).vectorAdd(d.start)):!1},a.Link.prototype.getLocalSteadyPositionOnLink=function(b){b=a.isa(b,"num")?b:1;var c,d,e,f=a.sprite[this.sprite].get("precision"),g=this.positions,h=this.length,i=h*b;i=i>g[f].cumulativeLength?g[f].cumulativeLength:0>i?0:i;for(var j=1;f>=j;j++)if(i<=g[j].cumulativeLength)return c=a.worklink.v1.set(g[j-1].p),d=a.worklink.v2.set(g[j].p),d.vectorSubtract(c),e=(i-g[j-1].cumulativeLength)/g[j].length,d.scalarMultiply(e).vectorAdd(c);return!1},a.Link.prototype.getSteadyPositionOnLink=function(b){var c=a.sprite[this.sprite],d=this.getLocalSteadyPositionOnLink(b);return d.rotate(c.roll).vectorAdd(c.start),d},a.Link.prototype.getLength=function(){return this.setPositions(),this.length},a.Link.prototype.setPositions=function(b){if("add"===this.action){var c,d,e,f=this.getPointCoordinates(),g=a.isa(b,"num")&&b>0?b:a.sprite[this.sprite].get("precision"),h=1/g,i=a.worklink.v3,j=0,k=a.worklink.v2.set(f.start),l=a.sprite[this.sprite],m=l.roll;if(this.positions.length!==g+1){this.positions.length=0;for(var n=0;g>=n;n++)this.positions[n]={p:a.newVector(),length:0,cumulativeLength:0}}this.positions[0].p.set(k),l.set({roll:0});for(var n=1;g>=n;n++)c=h*(n-1+1),d=this.getPositionOnLink(c),d.vectorSubtract(l.start),i.set(d),e=d.vectorSubtract(k).getMagnitude(),k.set(i),j+=e,this.positions[n].p.set(k),this.positions[n].length=e,this.positions[n].cumulativeLength=j;this.length=this.positions[g].cumulativeLength,l.roll=m}return this},a.Link.prototype.sketch=function(b){var c,d,e,f;switch(this.action){case"close":b.closePath();break;case"move":try{c=a.point[this.endPoint].getCurrentCoordinates(),b.moveTo(c.x,c.y)}catch(g){return!0}break;case"add":try{switch(this.species){case"line":c=a.point[this.endPoint].getCurrentCoordinates(),b.lineTo(c.x,c.y);break;case"quadratic":d=a.point[this.get("controlPoint1")].getCurrentCoordinates(),c=a.point[this.endPoint].getCurrentCoordinates(),b.quadraticCurveTo(d.x,d.y,c.x,c.y);break;case"bezier":d=a.point[this.get("controlPoint1")].getCurrentCoordinates(),e=a.point[this.get("controlPoint2")].getCurrentCoordinates(),c=a.point[this.endPoint].getCurrentCoordinates(),b.bezierCurveTo(d.x,d.y,e.x,e.y,c.x,c.y);break;default:return!0}}catch(g){return!0}break;default:return!0}try{f=a.link[a.point[this.endPoint].startLink].sketch(b)}catch(g){return!0}return!0},a}(scrawl);