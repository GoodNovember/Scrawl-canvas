/*! scrawl 2014-07-30 */
"use strict";var scrawl=function(a){return a.makeEllipse=function(b){b=a.safeObject(b),b.startX=b.startX||0,b.startY=b.startY||0,b.radiusX=b.radiusX||0,b.radiusY=b.radiusY||0,b.closed=!0;var c="m",d=b.startX,e=b.startY,f=b.startX,g=b.startY-b.radiusY;return c+=d-f+","+(e-g),d=f,e=g,f=b.startX+.55*b.radiusX,g=b.startY-b.radiusY,c+="c"+(d-f)+","+(e-g),f=b.startX+b.radiusX,g=b.startY-.55*b.radiusY,c+=" "+(d-f)+","+(e-g),f=b.startX+b.radiusX,g=b.startY,c+=" "+(d-f)+","+(e-g),d=f,e=g,f=b.startX+b.radiusX,g=b.startY+.55*b.radiusY,c+="c"+(d-f)+","+(e-g),f=b.startX+.55*b.radiusX,g=b.startY+b.radiusY,c+=" "+(d-f)+","+(e-g),f=b.startX,g=b.startY+b.radiusY,c+=" "+(d-f)+","+(e-g),d=f,e=g,f=b.startX-.55*b.radiusX,g=b.startY+b.radiusY,c+="c"+(d-f)+","+(e-g),f=b.startX-b.radiusX,g=b.startY+.55*b.radiusY,c+=" "+(d-f)+","+(e-g),f=b.startX-b.radiusX,g=b.startY,c+=" "+(d-f)+","+(e-g),d=f,e=g,f=b.startX-b.radiusX,g=b.startY-.55*b.radiusY,c+="c"+(d-f)+","+(e-g),f=b.startX-.55*b.radiusX,g=b.startY-b.radiusY,c+=" "+(d-f)+","+(e-g),f=b.startX,g=b.startY-b.radiusY,c+=" "+(d-f)+","+(e-g),c+="z",b.isLine=!1,b.data=c,b.shape?a.newShape(b):a.makePath(b)},a.makeRectangle=function(b){b=a.safeObject(b),b.startX=b.startX||0,b.startY=b.startY||0,b.width=b.width||0,b.height=b.height||0,b.radius=b.radius||0,b.closed=!0;var c=b.radiusTopLeftX||b.radiusTopLeft||b.radiusTopX||b.radiusLeftX||b.radiusTop||b.radiusLeft||b.radiusX||b.radius||0,d=b.radiusTopLeftY||b.radiusTopLeft||b.radiusTopY||b.radiusLeftY||b.radiusTop||b.radiusLeft||b.radiusY||b.radius||0,e=b.radiusTopRightX||b.radiusTopRight||b.radiusTopX||b.radiusRightX||b.radiusTop||b.radiusRight||b.radiusX||b.radius||0,f=b.radiusTopRightY||b.radiusTopRight||b.radiusTopY||b.radiusRightY||b.radiusTop||b.radiusRight||b.radiusY||b.radius||0,g=b.radiusBottomRightX||b.radiusBottomRight||b.radiusBottomX||b.radiusRightX||b.radiusBottom||b.radiusRight||b.radiusX||b.radius||0,h=b.radiusBottomRightY||b.radiusBottomRight||b.radiusBottomY||b.radiusRightY||b.radiusBottom||b.radiusRight||b.radiusY||b.radius||0,i=b.radiusBottomLeftX||b.radiusBottomLeft||b.radiusBottomX||b.radiusLeftX||b.radiusBottom||b.radiusLeft||b.radiusX||b.radius||0,j=b.radiusBottomLeftY||b.radiusBottomLeft||b.radiusBottomY||b.radiusLeftY||b.radiusBottom||b.radiusLeft||b.radiusY||b.radius||0,k=b.width/2,l=b.height/2,m="m",n=b.startX,o=b.startY,p=b.startX-k+g,q=b.startY-l;return m+=n-p+","+(o-q),n=p,o=q,p=b.startX+k-i,q=b.startY-l,m+="l"+(n-p)+","+(o-q),n=p,o=q,p=b.startX+k-i+.55*i,q=b.startY-l,m+="c"+(n-p)+","+(o-q),p=b.startX+k,q=b.startY-l+j-.55*j,m+=" "+(n-p)+","+(o-q),p=b.startX+k,q=b.startY-l+j,m+=" "+(n-p)+","+(o-q),n=p,o=q,p=b.startX+k,q=b.startY+l-d,m+="l"+(n-p)+","+(o-q),n=p,o=q,p=b.startX+k,q=b.startY+l-d+.55*d,m+="c"+(n-p)+","+(o-q),p=b.startX+k-c+.55*c,q=b.startY+l,m+=" "+(n-p)+","+(o-q),p=b.startX+k-c,q=b.startY+l,m+=" "+(n-p)+","+(o-q),n=p,o=q,p=b.startX-k+e,q=b.startY+l,m+="l"+(n-p)+","+(o-q),n=p,o=q,p=b.startX-k+e-.55*e,q=b.startY+l,m+="c"+(n-p)+","+(o-q),p=b.startX-k,q=b.startY+l-f+.55*f,m+=" "+(n-p)+","+(o-q),p=b.startX-k,q=b.startY+l-f,m+=" "+(n-p)+","+(o-q),n=p,o=q,p=b.startX-k,q=b.startY-l+h,m+="l"+(n-p)+","+(o-q),n=p,o=q,p=b.startX-k,q=b.startY-l+h-.55*h,m+="c"+(n-p)+","+(o-q),p=b.startX-k+g-.55*g,q=b.startY-l,m+=" "+(n-p)+","+(o-q),p=b.startX-k+g,q=b.startY-l,m+=" "+(n-p)+","+(o-q),m+="z",b.isLine=!1,b.data=m,b.shape?a.newShape(b):a.makePath(b)},a.makeBezier=function(b){b=a.safeObject(b),b.startX=b.startX||0,b.startY=b.startY||0,b.startControlX=b.startControlX||0,b.startControlY=b.startControlY||0,b.endControlX=b.endControlX||0,b.endControlY=b.endControlY||0,b.endX=b.endX||0,b.endY=b.endY||0,b.closed=!1,b.handleX=b.handleX||"left",b.handleY=b.handleY||"top";var c,d,e,f=b.fixed||"none";if(b.fixed=!1,d="m0,0c"+(b.startControlX-b.startX)+","+(b.startControlY-b.startY)+" "+(b.endControlX-b.startX)+","+(b.endControlY-b.startY)+" "+(b.endX-b.startX)+","+(b.endY-b.startY),b.data=d,b.isLine=!0,b.shape)c=a.newShape(b);else switch(c=a.makePath(b),e=c.name.replace("~","_","g"),f){case"all":a.point[e+"_p1"].setToFixed(b.startX,b.startY),a.point[e+"_p2"].setToFixed(b.startControlX,b.startControlY),a.point[e+"_p3"].setToFixed(b.endControlX,b.endControlY),a.point[e+"_p4"].setToFixed(b.endX,b.endY);break;case"both":a.point[e+"_p1"].setToFixed(b.startX,b.startY),a.point[e+"_p4"].setToFixed(b.endX,b.endY);break;case"start":a.point[e+"_p1"].setToFixed(b.startX,b.startY);break;case"startControl":a.point[e+"_p2"].setToFixed(b.startControlX,b.startControlY);break;case"endControl":a.point[e+"_p3"].setToFixed(b.endControlX,b.endControlY);break;case"end":a.point[e+"_p4"].setToFixed(b.endX,b.endY)}return c},a.makeQuadratic=function(b){b=a.safeObject(b),b.startX=b.startX||0,b.startY=b.startY||0,b.controlX=b.controlX||0,b.controlY=b.controlY||0,b.endX=b.endX||0,b.endY=b.endY||0,b.closed=!1,b.handleX=b.handleX||"left",b.handleY=b.handleY||"top";var c,d,e,f=b.fixed||"none";if(c="m0,0q"+(b.controlX-b.startX)+","+(b.controlY-b.startY)+" "+(b.endX-b.startX)+","+(b.endY-b.startY),b.fixed=!1,b.data=c,b.isLine=!0,b.shape)d=a.newShape(b);else switch(d=a.makePath(b),e=d.name.replace("~","_","g"),f){case"all":a.point[e+"_p1"].setToFixed(b.startX,b.startY),a.point[e+"_p2"].setToFixed(b.controlX,b.controlY),a.point[e+"_p3"].setToFixed(b.endX,b.endY);break;case"both":a.point[e+"_p1"].setToFixed(b.startX,b.startY),a.point[e+"_p3"].setToFixed(b.endX,b.endY);break;case"start":a.point[e+"_p1"].setToFixed(b.startX,b.startY);break;case"control":a.point[e+"_p2"].setToFixed(b.controlX,b.controlY);break;case"end":a.point[e+"_p3"].setToFixed(b.endX,b.endY)}return d},a.makeLine=function(b){b=a.safeObject(b),b.startX=b.startX||0,b.startY=b.startY||0,b.endX=b.endX||0,b.endY=b.endY||0,b.closed=!1,b.handleX=b.handleX||"left",b.handleY=b.handleY||"top";var c,d,e,f=b.fixed||"none";if(c="m0,0 "+(b.endX-b.startX)+","+(b.endY-b.startY),b.fixed=!1,b.data=c,b.isLine=!0,b.shape)d=a.newShape(b);else switch(d=a.makePath(b),e=d.name.replace("~","_","g"),f){case"both":a.point[e+"_p1"].setToFixed(b.startX,b.startY),a.point[e+"_p2"].setToFixed(b.endX,b.endY);break;case"start":a.point[e+"_p1"].setToFixed(b.startX,b.startY);break;case"end":a.point[e+"_p2"].setToFixed(b.endX,b.endY)}return d},a.makeRegularShape=function(b){if(b=a.safeObject(b),a.xto([b.sides,b.angle])){b.startX=b.startX||0,b.startY=b.startY||0,b.radius=b.radius||20,b.closed=!0;var c,d=a.isa(b.sides,"num")&&b.sides>1?360/b.sides:a.isa(b.angle,"num")&&b.angle>0?b.angle:4,e=0,f=0,g=a.worklink.v1.set({x:b.radius,y:0,z:0}),h=a.worklink.v2.set(g),i="m"+g.x.toFixed(4)+","+g.y.toFixed(4)+" ";do f++,e+=d,e%=360,c=e.toFixed(0),g.rotate(d),i+=""+(g.x-h.x).toFixed(4)+","+(g.y-h.y).toFixed(4)+" ",h.set(g);while("0"!==c&&1e3>f);return i+="z",b.data=i,b.isLine=!1,b.shape?a.newShape(b):a.makePath(b)}return!1},a.xt(a.worklink)||(a.worklink={start:a.newVector({name:"scrawl.worklink.start"}),end:a.newVector({name:"scrawl.worklink.end"}),control1:a.newVector({name:"scrawl.worklink.control1"}),control2:a.newVector({name:"scrawl.worklink.control2"}),v1:a.newVector({name:"scrawl.worklink.v1"}),v2:a.newVector({name:"scrawl.worklink.v2"}),v3:a.newVector({name:"scrawl.worklink.v3"})}),a}(scrawl);