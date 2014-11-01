/*! scrawl-canvas 2014-11-01 */
if(window.scrawl&&!window.scrawl.newParticle)var scrawl=function(a){"use strict";return a.physics={gravity:9.8,airDensity:1.23,deltaTime:0},a.workphys={v1:a.newVector(),v2:a.newVector(),v3:a.newVector(),v4:a.newVector(),v5:a.newVector()},a.updateSprings=function(b){if(a.springnames.length>0){var c=[];b=a.isa(b,"arr")?b:a.springnames;for(var d=0,e=b.length;e>d;d++)c.push(a.isa(b[d],"obj")?b[d]:a.isa(b[d],"str")?a.spring[b[d]]:!1);for(var f=0,g=c.length;g>f;f++)c[f]&&c[f].update();return!0}return!1},a.physicsInit=function(){a.newForce({name:"gravity",fn:function(b){b.load.vectorAdd({y:b.mass*a.physics.gravity})}}),a.newForce({name:"drag",fn:function(b){var c,d,e;b.resetWork(),c=b.work.velocity.reverse().normalize(),d=b.velocity.getMagnitude(),e=.5*a.physics.airDensity*d*d*b.get("area")*b.get("drag"),c.scalarMultiply(e),b.load.vectorAdd(c)}})},a.newParticle=function(b){return new a.Particle(b)},a.newSpring=function(b){return new a.Spring(b)},a.newForce=function(b){return new a.Force(b)},a.Particle=function(b){return a.Base.call(this,b),b=a.safeObject(b),this.place=a.newVector(),this.work.place=a.newVector(),this.velocity=a.newVector(),this.work.velocity=a.newVector(),this.set(b),this.priorPlace=a.newVector(this.place),this.engine=b.engine||"euler",this.userVar=b.userVar||{},this.mobile=a.isa(b.mobile,"bool")?b.mobile:!0,this.forces=b.forces||[],this.springs=b.springs||[],this.mass=b.mass||a.d.Particle.mass,this.elasticity=b.elasticity||a.d.Particle.elasticity,this.radius=b.radius||a.d.Particle.radius,(b.radius||b.area)&&(this.area=b.area||2*Math.PI*this.get("radius")*this.get("radius")||a.d.Particle.area),this.load=a.newVector(),a.entity[this.name]=this,a.pushUnique(a.entitynames,this.name),this.group=a.Entity.prototype.getGroup.call(this,b),a.group[this.group].addEntitysToGroup(this.name),this},a.Particle.prototype=Object.create(a.Base.prototype),a.Particle.prototype.type="Particle",a.Particle.prototype.classname="entitynames",a.Particle.prototype.order=0,a.d.Particle={group:"",order:0,mobile:!0,mass:1,radius:.1,area:.03,drag:.42,elasticity:1,userVar:{},place:{x:0,y:0,z:0},velocity:{x:0,y:0,z:0},engine:"euler",forces:[],springs:[],load:a.newVector()},a.mergeInto(a.d.Particle,a.d.Scrawl),a.Particle.prototype.set=function(b){b=a.safeObject(b);var c;return a.Base.prototype.set.call(this,b),this.place.type&&"Vector"===this.place.type||(this.place=a.newVector(b.place||this.place)),a.xto([b.start,b.startX,b.startY])&&(c=a.isa(b.start,"obj")?b.start:{},this.place.x=a.xt(b.startX)?b.startX:a.xt(c.x)?c.x:this.place.x,this.place.y=a.xt(b.startY)?b.startY:a.xt(c.y)?c.y:this.place.y),this.velocity.type&&"Vector"===this.velocity.type||(this.velocity=a.newVector(b.velocity||this.velocity)),a.xto([b.delta,b.deltaX,b.deltaY])&&(c=a.isa(b.delta,"obj")?b.delta:{},this.velocity.x=a.xt(b.deltaX)?b.deltaX:a.xt(c.x)?c.x:this.velocity.x,this.velocity.y=a.xt(b.deltaY)?b.deltaY:a.xt(c.y)?c.y:this.velocity.y),this},a.Particle.prototype.clone=function(b){var c=a.Base.prototype.clone.call(this,b);c.place=a.newVector(c.place),c.velocity=a.newVector(c.velocity),c.forces=[];for(var d=0,e=this.forces.length;e>d;d++)c.forces.push(this.forces[d]);return c},a.Particle.prototype.addForce=function(b){return a.xt(b)&&this.forces.push(b),this},a.Particle.prototype.revert=function(){return this.place.set(this.priorPlace),this},a.Particle.prototype.stamp=function(){if(this.mobile)switch(this.calculateLoads(),this.engine){case"improvedEuler":this.updateImprovedEuler();break;case"rungeKutter":this.updateRungeKutter();break;default:this.updateEuler()}return this},a.Particle.prototype.forceStamp=function(){return this.stamp()},a.Particle.prototype.update=function(){return this.stamp()},a.Particle.prototype.calculateLoads=function(){var b=0,c=0;for(this.load.zero(),b=0,c=this.forces.length;c>b;b++)a.isa(this.forces[b],"str")&&a.contains(a.forcenames,this.forces[b])?a.force[this.forces[b]].run(this):this.forces[b](this);for(b=0,c=this.springs.length;c>b;b++)a.spring[this.springs[b]].start===this.name?this.load.vectorAdd(a.spring[this.springs[b]].force):a.spring[this.springs[b]].end===this.name&&this.load.vectorSubtract(a.spring[this.springs[b]].force);return this},a.Particle.prototype.updateEuler=function(){this.resetWork();var b=a.workphys.v1.set(this.load).scalarDivide(this.mass).scalarMultiply(a.physics.deltaTime);return this.work.velocity.vectorAdd(b),this.velocity.set(this.work.velocity),this.priorPlace.set(this.place),this.place.vectorAdd(this.work.velocity.scalarMultiply(a.physics.deltaTime)),this},a.Particle.prototype.updateImprovedEuler=function(){this.resetWork();var b=a.workphys.v1.set(this.load).scalarDivide(this.mass).scalarMultiply(a.physics.deltaTime),c=a.workphys.v2.set(this.load).vectorAdd(b).scalarDivide(this.mass).scalarMultiply(a.physics.deltaTime),d=b.vectorAdd(c).scalarDivide(2);return this.work.velocity.vectorAdd(d),this.velocity.set(this.work.velocity),this.priorPlace.set(this.place),this.place.vectorAdd(this.work.velocity.scalarMultiply(a.physics.deltaTime)),this},a.Particle.prototype.updateRungeKutter=function(){this.resetWork();var b=a.workphys.v1.set(this.load).scalarDivide(this.mass).scalarMultiply(a.physics.deltaTime).scalarDivide(2),c=a.workphys.v2.set(this.load).vectorAdd(b).scalarDivide(this.mass).scalarMultiply(a.physics.deltaTime).scalarDivide(2),d=a.workphys.v3.set(this.load).vectorAdd(c).scalarDivide(this.mass).scalarMultiply(a.physics.deltaTime),e=a.workphys.v4.set(this.load).vectorAdd(d).scalarDivide(this.mass).scalarMultiply(a.physics.deltaTime),f=a.workphys.v5;return c.scalarMultiply(2),d.scalarMultiply(2),f.set(b).vectorAdd(c).vectorAdd(d).vectorAdd(e).scalarDivide(6),this.work.velocity.vectorAdd(f),this.velocity.set(this.work.velocity),this.priorPlace.set(this.place),this.place.vectorAdd(this.work.velocity.scalarMultiply(a.physics.deltaTime)),this},a.Particle.prototype.linearCollide=function(b){this.resetWork();var c=a.workphys.v1.set(this.place).vectorSubtract(b.place).normalize(),d=a.workphys.v2.set(this.velocity).vectorSubtract(b.velocity),e=d.getDotProduct(c),f=a.workphys.v3;return e=-e*(1+(this.elasticity+b.elasticity)/2),e/=1/this.mass+1/b.mass,f.set(c).scalarMultiply(e),this.velocity.vectorAdd(f.scalarDivide(this.mass)),b.velocity.vectorAdd(f.scalarDivide(b.mass).reverse()),this},a.Particle.prototype.addSpring=function(b){var c=!1,d=!1;if(a.isa(b,"str")&&a.contains(a.entitynames,b)){d=b;var e={};e.start=this.name,e.end=b,c=a.newSpring(e)}else b=a.isa(b,"obj")?b:{},d=b.end||!1,d&&a.contains(a.entitynames,d)&&(b.start=this.name,c=a.newSpring(b));return c&&(a.pushUnique(this.springs,c.name),a.pushUnique(a.entity[d].springs,c.name)),this},a.Particle.prototype.removeSprings=function(){for(var b=this.springs.slice(0),c=0,d=b.length;d>c;c++)a.spring[b[c]].kill();return this},a.Particle.prototype.removeSpringsTo=function(b){if(a.xt(b)&&a.contains(a.entitynames,b)){var c,d,e,f=[];for(d=0,e=this.springs.length;e>d;d++)c=a.spring[this.springs[d]],(c.start===this.name||c.end===this.name)&&f.push(this.springs[d]);for(d=0,e=f.length;e>d;d++)a.spring[f[d]].kill()}return this},a.Particle.prototype.pickupEntity=function(){return this},a.Particle.prototype.dropEntity=function(){return this},a.Particle.prototype.updateStart=function(){return this},a.pushUnique(a.sectionlist,"spring"),a.pushUnique(a.nameslist,"springnames"),a.Spring=function(b){if(b=a.safeObject(b),a.xta([b.start,b.end])){var c=a.entity[b.start],d=a.entity[b.end];if(a.Base.call(this,b),this.start=b.start,this.end=b.end,this.springConstant=b.springConstant||1e3,this.damperConstant=b.damperConstant||100,a.xt(b.restLength))this.restLength=b.restLength;else{var e=a.workphys.v1.set(d.place);e.vectorSubtract(c.place),this.restLength=e.getMagnitude()}return this.currentLength=b.currentLength||this.restLength,this.force=a.newVector(),this.work.force=a.newVector(),a.spring[this.name]=this,a.pushUnique(a.springnames,this.name),this}return!1},a.Spring.prototype=Object.create(a.Base.prototype),a.Spring.prototype.type="Spring",a.Spring.prototype.classname="springnames",a.d.Spring={start:"",end:"",springConstant:1e3,damperConstant:100,restLength:1,currentLength:1,force:{x:0,y:0,z:0}},a.mergeInto(a.d.Spring,a.d.Scrawl),a.Spring.prototype.update=function(){var b=a.workphys.v1.set(a.entity[this.end].velocity).vectorSubtract(a.entity[this.start].velocity),c=a.workphys.v2.set(a.entity[this.end].place).vectorSubtract(a.entity[this.start].place),d=a.workphys.v3.set(c).normalize(),e=a.workphys.v4.set(d);return this.force.set(d.scalarMultiply(this.springConstant*(c.getMagnitude()-this.restLength)).vectorAdd(b.vectorMultiply(e).scalarMultiply(this.damperConstant).vectorMultiply(e))),this},a.Spring.prototype.kill=function(){return a.removeItem(a.entity[this.start].springs,this.name),a.removeItem(a.entity[this.end].springs,this.name),delete a.spring[this.name],a.removeItem(a.springnames,this.name),!0},a.pushUnique(a.sectionlist,"force"),a.pushUnique(a.nameslist,"forcenames"),a.Force=function(b){return a.Base.call(this,b),b=a.safeObject(b),this.fn=b.fn||function(){},a.force[this.name]=this,a.pushUnique(a.forcenames,this.name),this},a.Force.prototype=Object.create(a.Base.prototype),a.Force.prototype.type="Force",a.Force.prototype.classname="forcenames",a.d.Force={fn:function(){}},a.mergeInto(a.d.Force,a.d.Scrawl),a.Force.prototype.run=function(a){return this.fn(a)},a.Force.prototype.kill=function(){return delete a.force[this.name],a.removeItem(a.forcenames,this.name),!0},a}(scrawl);