"use strict";

Math.clamp = function(number, min, max){
    if(number<min)return min;
    if(number>max)return max;
    return number;
}

function Vector(x=undefined,y=undefined, z=undefined){
    this.x = x;
	this.y = y;
	this.z = z;
	if(this.x == undefined){ this.x = parseInt(Math.random()*Swarm.width); }
	if(this.y == undefined){ this.y = parseInt(Math.random()*Swarm.height); }
	if(this.z == undefined){ this.z = parseInt(Math.random()*Swarm.depth); }
}

function Statistic(initial_value=0){
	this.samples = [];
	this.accumulated = 0;
	this.value = 0;	
	this.average = 0;
	this.sample(initial_value);
}

Statistic.prototype.sample = function(s){
	this.samples[this.samples.length] = s;
	this.accumulated += s;
	this.average = this.accumulated / this.samples.length; 
	this.value = s;	
}

var the_clock;
function Clock(){
    this.moment = 0;
    this.seconds = 0;
    this.minutes = 0;
    this.hours = 0;
    this.days = 0;
    the_clock = this;
    setInterval(function(){ the_clock.update(); }, 10);
}

Clock.prototype.update = function(){
    this.moment++;
    this.seconds = (this.moment/100) % 60;
    this.minutes = ((this.moment/100) / 60)%60;
    this.hours =  (((this.moment/100) / 60)/60)%24;
    this.days =   (((this.moment/100) / 60)/60)/24;
}

var Simulation = {
	population					: new Statistic(),
	births 						: new Statistic(),
	deaths 						: new Statistic(),
    natality					: new Statistic(),
    hunger  					: new Statistic(),
    clock                       : new Clock(),
    fly_in_formation            : false,
    oldestSpecimen              : 0,
    show_info                   : false,//true,
};

