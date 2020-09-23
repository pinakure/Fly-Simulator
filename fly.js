"use strict";

function Fly(x=undefined,y=undefined){
    this.position 		= new Vector(x,y);
	this.speed 			= new Vector(1-(Math.random()*3), 1-(Math.random()*3));	
	this.metabolism 	= 1.0 + ((Math.random() * 10)/10.0);// the higher the value, the fastest hunger increases
	this.generation 	= 0;
	this.subdivide      = false;
	this.target         = new Vector(x,y);
	this.mood           = 0.0;
    this.hunger         = 0.0;
	this.health         = 100;
	this.age            = 0;
	this.flash          = false;
	this.next           = undefined;// *Fly() instance;
	this.enemy          = undefined;// *Fly() instance;
	this.target         = undefined;// Vector
    this.targetAvoid    = undefined;// Vector
	this.targetFlyAvoid = undefined;// *Fly() instance;
    this.targetFly      = undefined;// *Fly() instance;
    this.ratio          = 0.5;//used to cache the size ratio
}

Fly.prototype.drawToTemperatureMap = function(){
	// Mantain warm map
	VPU.pset(this.position.x+1	, this.position.y+1,VPU.lighter(VPU.getp(this.position.x+1, this.position.y+1, VPU.wbuffer), 2), VPU.wbuffer	);
	VPU.pset(this.position.x	, this.position.y+1,VPU.lighter(VPU.getp(this.position.x  , this.position.y+1, VPU.wbuffer), 2), VPU.wbuffer	);
	VPU.pset(this.position.x+1	, this.position.y,  VPU.lighter(VPU.getp(this.position.x+1, this.position.y  , VPU.wbuffer), 2), VPU.wbuffer	);
	VPU.pset(this.position.x+2	, this.position.y+1,VPU.lighter(VPU.getp(this.position.x+2, this.position.y+1, VPU.wbuffer), 2), VPU.wbuffer	);
	VPU.pset(this.position.x+1	, this.position.y+2,VPU.lighter(VPU.getp(this.position.x+1, this.position.y+2, VPU.wbuffer), 2), VPU.wbuffer	);
}

Fly.prototype.move = function(){
     
    this.speed.x += (1-(Math.random()*3))/16.0;
	this.speed.y += (1-(Math.random()*3))/16.0;
	this.speed.z += (1-(Math.random()*3))/16.0;

	var velocity = Swarm.fly_max_speed/16.0;

	if(this.speed.x >  Swarm.fly_max_speed ) this.speed.x =  velocity;
	if(this.speed.y >  Swarm.fly_max_speed ) this.speed.y =  velocity;
	if(this.speed.z >  Swarm.fly_max_speed ) this.speed.z =  velocity;
	if(this.speed.x < -Swarm.fly_max_speed ) this.speed.x = -velocity;
	if(this.speed.y < -Swarm.fly_max_speed ) this.speed.y = -velocity;
	if(this.speed.z < -Swarm.fly_max_speed ) this.speed.z = -velocity;

	this.position.x += this.speed.x;
	this.position.y += this.speed.y;
	this.position.z += this.speed.z;

	if(Swarm.HORIZONTAL_BOUNCE){
		if(this.position.x <= 0.0){
			this.position.x += 1.0;
			this.speed.x = -(this.speed.x/2);
		} else if(this.position.x > Swarm.width){
			this.position.x -= 1.0;
			this.speed.x = -(this.speed.x/2);
		}
	} else {
		if(this.position.x < 0.0		) this.position.x += Swarm.width;
		if(this.position.x > Swarm.width) this.position.x -= Swarm.width;
	}
	
	if(Swarm.VERTICAL_BOUNCE){
		if(this.position.y <= 0.0){
			this.position.y += 1.0;
			this.speed.y = -(this.speed.y/2);
		} else if(this.position.y > Swarm.height-50){
			this.position.y -= 1.0;
			this.speed.y = -(this.speed.y/2);
		} 
	} else {
		if(this.position.y < 0.0) this.position.y += Swarm.height;
		if(this.position.y > Swarm.height) this.position.y -= Swarm.height;
	}
}

Fly.prototype.eat = function(p/*food*/){
    this.target = undefined;
	if(p == undefined) return;
	if(p.z > 0) { // Z means 'energy' for food vectors
		this.mood += 0.1;
		this.hunger -= p.z;
		this.speed.x *= 0.5;
		this.speed.y *= 0.5;
		if((this.hunger < Swarm.HUNGER_TOLERABLE_LEVEL) && (this.health < 100)){
			this.heal(Math.abs(this.hunger));
			this.hunger = 0.0;
		}
	}
    Swarm.deleteFood(p);
}

Fly.prototype.logic = function(){
	this.drawToTemperatureMap()
	this.move();
	
	if(this.target) this.follow( this.target );
	else if(this.targetAvoid) this.avoid(this.targetAvoid);
	else if(this.targetFlyAvoid) this.avoid(this.targetFlyAvoid.position);
	else if(this.targetFly) this.follow(this.targetFly.position);
    else if(Swarm.elder) this.follow(Swarm.elder.position);
}


Fly.prototype.shoot = function(x,y){
	var dx;
	var dy;
	var distance;
	
	if(x > this.position.x) dx = x - this.position.x; else dx = this.position.x - x;
	if(y > this.position.y) dy = y - this.position.y; else dy = this.position.y - y;
	if(dy > dx) distance = dy + dx; else distance = dx + dy;
	if(x < this.position.x)dx = -dx;
	if(y < this.position.y)dy = -dy;
	distance *= 0.25;

	dx /= distance;
	dy /= distance;
	
	//Swarm.insertShot(new Shot(this.position.x + this.speed.x, this.position.y + this.speed.y, dx, dy, this));

	VPU.pset(x-1, y-1, [255, 0, 0]);
	VPU.pset(x+1, y-1, [255, 0, 0]);
	VPU.pset( x ,  y , [255, 0, 0]);
	VPU.pset(x-1, y+1, [255, 0, 0]);
	VPU.pset(x+1, y+1, [255, 0, 0]);
}

Fly.prototype.die = function(){
    //Dereference this instance and its position member from every other fly
	for(var fi in Swarm.flies){
		var f = Swarm.flies[fi];
		if(f.targetFly == this) f.targetFly = undefined;
		if(f.targetFlyAvoid == this) f.targetFlyAvoid = undefined;
		if(f.target == this.position) f.target = undefined;
		if(f.targetAvoid == this.position) f.targetAvoid = undefined;
		Swarm.flies[fi] = f;
	}

	var ratio = ((350.0 / this.age)*5);
	if(this.age <= -Swarm.FLY_AGE_LIMIT){
		Swarm.dropFood(this.position.x + ratio + ( -2 + (Math.random() * 5 )), this.position.y + ratio + ( -2 + (Math.random() * 5 )));
		Swarm.dropFood(this.position.x + ratio + ( -2 + (Math.random() * 5 )), this.position.y + ratio + ( -2 + (Math.random() * 5 )));
		Swarm.dropFood(this.position.x + ratio + ( -2 + (Math.random() * 5 )), this.position.y + ratio + ( -2 + (Math.random() * 5 )));
		Swarm.dropFood(this.position.x + ratio + ( -2 + (Math.random() * 5 )), this.position.y + ratio + ( -2 + (Math.random() * 5 )));
		Swarm.dropFood(this.position.x + ratio + ( -2 + (Math.random() * 5 )), this.position.y + ratio + ( -2 + (Math.random() * 5 )));
	} else {
		Swarm.dropFood(this.position.x + ratio + ( -2 + (Math.random() * 5 )), this.position.y + ratio + ( -2 + (Math.random() * 5)));
		Swarm.dropFood(this.position.x + ratio + ( -2 + (Math.random() * 5 )), this.position.y + ratio + ( -2 + (Math.random() * 5)));
	}
	if(this == Swarm.elder) Swarm.elder = undefined;
	this.age = -1000;
}

Fly.prototype.hurt = function(q){
    this.health -= Math.abs(q);
	this.health = Math.clamp(this.health, 100, 0);
    if(this.health == 0) this.age =- this.age;
}

Fly.prototype.heal = function(q){
    this.health += Math.abs(q);
    this.health = Math.clamp(this.health, 100, 0);
}

Fly.prototype.calve = function(){
	var child = new Fly(this.position.x, this.position.y);
	child.age = 0;
	child.subdivide = false;
	child.generation = this.generation + 1;
	Swarm.insertFly(child);
	Swarm.simulation.natality.sample(1);
	this.subdivide = false;
    this.hunger = this.HUNGER_PROCREATION_BARRIER;
}

Fly.prototype.inFormation = function(){
    if(this == Swarm.elder){
		if(!this.target) this.target = new Vector();
		if(Swarm.elder.near(this.elder.target, 30)){
			Swarm.elder.target=new Position;
		}
		return;
	}
	
	this.target = undefined;
	if(Swarm.elder){
		this.targetFly = Swarm.elder;
		if(this.near(Swarm.elder.position, 5)) this.target = Swarm.elder.position;
		if(!this.near(Swarm.elder.position, 50)) {
			this.targetFly = Swarm.randomFly();
			this.target = undefined;
		}
    } else this.targetFly = undefined;
}

Fly.prototype.follow = function(pos){
    if(		this.position.x > pos.x) this.speed.x -= 0.1;
	else if(this.position.x < pos.x) this.speed.x += 0.1;
	if(		this.position.y > pos.y) this.speed.y -= 0.1;
	else if(this.position.y < pos.y) this.speed.y += 0.1;
}

Fly.prototype.avoid = function(p){
    if(this.target){
		
		// AVOID POSITION WITH TARGET SET
		
		if(p.x > this.target.x){
			if(this.position.x > p.x) {
				// [TARGET] [P] [THIS]
				this.speed.x -= Swarm.FLY_AVOID_INCREMENT;
			} else {
				// [THIS] [TARGET] [P]
				this.speed.x += Swarm.FLY_AVOID_INCREMENT;
			}
		} else {
			if(this.position.x > p.x) {
				// [P]  [TARGET]  [THIS]
				this.speed.x -= Swarm.FLY_AVOID_INCREMENT;
			} else {
				// [THIS] [P] [TARGET]
				this.speed.x += Swarm.FLY_AVOID_INCREMENT;
			}
		}
		if(p.y > this.target.y){
			if(this.position.y > p.y) {
				// [P]  [THIS]  [TARGET]
				this.speed.y -= Swarm.FLY_AVOID_INCREMENT;
			} else {
				// [THIS] [P] [TARGET]
				this.speed.y += Swarm.FLY_AVOID_INCREMENT;
			}
		} else {
			if(this.position.y > p.y) {
				// [TARGET]  [THIS]  [P]
				this.speed.y -= Swarm.FLY_AVOID_INCREMENT;
			} else {
				// [TARGET] [P] [THIS]
				this.speed.y += Swarm.FLY_AVOID_INCREMENT;
			}
		}
	} else {
		
		// NO TARGET SET
		
		if(this.position.x > p.x) {
			// [P]  [THIS]
			this.speed.x += Swarm.FLY_AVOID_INCREMENT;
		} else {
			// [THIS] [P]
			this.speed.x -= Swarm.FLY_AVOID_INCREMENT;
		}
		if(this.position.y > p.y) {
			// [THIS]  [P]
			this.speed.y -= Swarm.FLY_AVOID_INCREMENT;
		} else {
			// [P] [THIS]
			this.speed.y += Swarm.FLY_AVOID_INCREMENT;
		}
    }
}

Fly.prototype.near = function(pos, distance){
	return(	
		(this.position.x >= pos.x - distance)&&
		(this.position.y >= pos.y - distance)&&
		(this.position.x <= pos.x + distance)&&
		(this.position.y <= pos.y + distance)
	);
}

Fly.prototype.locateFood = function(){
	var nearest = undefined;
	var min_distance = 65535;
	
	for(var ffi in Swarm.food){
		var ff = Swarm.food[ffi];
		if(ff.position){
			var ox = ff.position.x;
			var oy = ff.position.y;
			var dx = position.x;
			var dy = position.y;
			var distance = Math.abs(ox - dx) + Math.abs(oy - dy);
			if(distance < min_distance){
				nearest = ff;
				min_distance = distance;	
			}
		}
	}
	if(nearest == undefined)return undefined;
	return nearest.position;
}

Fly.prototype.findFood = function(){
	if(Swarm.food.length == 0){	
		// Forget about eating...
		this.target = undefined;
	} else {
		// Find food to eat
		if(this.target){
			// Check if last target still exists
			if(Swarm.foodAt(this.target) == undefined){
				// Target not anymore there
				this.target = undefined;
				this.mood-=0.1;
			} else {
				this.follow(this.target);
			}
		} else {
			// Find a new target
			this.target = this.locateFood(); 
			if(Swarm.simulation.show_info & (this == Swarm.elder) && this.target) VPU.line(this.position.x, this.position.y, this.target.x, this.target.y, [255,255,0]);
		}
    } 	
}
Fly.prototype.draw = function(c){
    var pxr = this.position.x - this.ratio;
	var pyr = this.position.y - this.ratio;
	var sxr = this.speed.x * this.ratio * Swarm.FLY_MAX_SIZE;
	var syr = this.speed.y * this.ratio * Swarm.FLY_MAX_SIZE;
	
	var deltaX = pxr + sxr, deltaY = pyr + syr;
	var topX = pxr,	topY = pyr - this.ratio;
	var rightX = pxr+this.ratio+1,rightY = pyr;
	var bottomX = pxr, bottomY = pyr + 1 + this.ratio;
	var leftX = pxr-this.ratio, leftY = pyr;
	if(this.flash) c = [255,200,200]; this.flash = false;
	
	        
	if(VPU.WIREFRAME){
		var vertices = [ 
			deltaX, deltaY, topX, topY, rightX, rightY, deltaX, deltaY ,
			rightX, rightY, bottomX, bottomY, deltaX, deltaY ,
			bottomX, bottomY, leftX, leftY, deltaX, deltaY ,
			leftX, leftY, topX, topY, deltaX, deltaY
		];
		VPU.polygon(13, vertices, c);
	} else {
		var vertices = [
			[ deltaX	, deltaY	, topX		, topY		, rightX	, rightY	, deltaX	, deltaY ],
			[ deltaX	, deltaY	, rightX	, rightY	, bottomX	, bottomY	, deltaX	, deltaY ],
			[ deltaX	, deltaY	, bottomX	, bottomY	, leftX		, leftY		, deltaX	, deltaY ],
			[ deltaX	, deltaY	, leftX		, leftY		, topX		, topY		, deltaX	, deltaY ]
		];
		
		VPU.polygon(4, vertices[0], c);
		VPU.polygon(4, vertices[1], [c[0]/1.5	, c[1]/1.5	, c[2]/1.5	] );
		VPU.polygon(4, vertices[2], [c[0]/3		, c[1]/3	, c[2]/3	] );
		VPU.polygon(4, vertices[3], [c[0]/2		, c[1]/2	, c[2]/2	] );
	}
}

Fly.prototype.instinct = function(){

	// The mood is lowered by frustation when the specimen reaches its
	// targetted position and discovers the food it was looking for does
	// not exist anymore. It can be raised by eating food, and will make
	// the specimen play with another ones when it is over 0.0f.
	// When mood is -1.0f, the specimen will get angry and try to get 
	// food from another specimen, attacking and pursuiting him.
		
	this.mood = Math.clamp(this.mood, 1.0, -1.0);
	if(this.mood == -1.0){
		// Attack a fly to obtain food!
		if(!this.enemy){
			this.enemy = Swarm.randomFly();
		}
		
		if(this.enemy == this){
			this.enemy = undefined;
			this.target = undefined;
		} else if (this.enemy) {
			this.target = this.enemy.position;
			if(Swarm.simulation.show_info & (this == Swarm.elder)){
				VPU.line(this.position.x-1	, this.position.y-1	, this.target.x, this.target.y, [255,0,0]);
				VPU.line(this.position.x-1	, this.position.y	, this.target.x, this.target.y, [128,0,0]);
				VPU.line(this.position.x	, this.position.y-1	, this.target.x, this.target.y, [128,0,0]);
			}
			
			if((this.enemy.health == 0)||(this.enemy.hunger < 100)){
				this.target = undefined;
				this.enemy = undefined;
			} else if(this.near(this.enemy.position, 5)) {
				this.enemy.hurt(10); 
				this.enemy.flash = true;
				this.enemy.avoid(this.enemy.position);
				this.enemy.avoid(this.position);
			}			
		} else {
			this.target = undefined;
		}
	}

	// Hunger 
			
	if(this.hunger > Swarm.HUNGER_TOLERABLE_LEVEL){
		if(this.target)
			this.follow(this.target);
	} else {
		if(this.mood > 0.0) {
			var f = Swarm.randomFly();
			if(f != this){
				this.target = f.position;
				if(Swarm.simulation.show_info & (this == Swarm.elder)) 
					VPU.line(this.position.x, this.position.y, f.position.x, f.position.y, f.position.x);
			}
		}
	}
	
	this.hunger += Swarm.HUNGER_INCREMENT * this.metabolism;
	if(this.hunger > 100.0) this.hunger = 100.0;
	
	if(this.hunger >= Swarm.HUNGER_TOLERABLE_LEVEL) this.findFood();
	
	// Follow either a target food or the elder specimen
	if(this.target) {
		this.follow(this.target);
		if(this.near( this.target, Swarm.HUNGER_EAT_THRESHOLD)) this.eat( Swarm.foodAt(this.target));
	} else if(Swarm.elder){
		if((Swarm.elder!=this) && ((Math.random() * 250) > this.age)) this.follow(Swarm.elder.position);
	}	

	// Have descendency (Probability decreases as the age increases)
	if(this.age >= Swarm.MATURE_AGE) {
		if(parseInt(Math.random() * this.age) == 0)
			if(this.hunger < Swarm.HUNGER_PROCREATION_BARRIER) this.calve();
	}

	// Make death happen in the right moments
		
	// Die by hunger
	if(this.hunger >= Swarm.HUNGER_LETHAL_LEVEL){
		this.hunger = Swarm.HUNGER_LETHAL_LEVEL;
		this.hurt(1);
	} else {
		this.age++;
	}
	
	// Die by age
	if(this.age > Swarm.FLY_AGE_LIMIT) this.age =- Swarm.FLY_AGE_LIMIT;

	// Statistics need these values updated each cycle 
	// Compute total hunger
	if(this.hunger > 0.0) Swarm.simulation.hunger.sample(this.hunger); 

	//Extra boost to children...
	if(this.age < 100)this.move();
}