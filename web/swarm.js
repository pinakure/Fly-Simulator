"use strict";

var Swarm = {
	width						: 320,
	height						: 240,
    FLOOR_HEIGHT                : 220,
	depth						: 100,
	simulation					: undefined,
    starting_fly_count	        : 128,
    fly                         : undefined, /* Fly */
    elder                       : undefined, /* Fly */
    flies                       : [],
    food 						: [],
    update_speed                : 20,
	redraw_speed                : 16,
	FLY_AVOID_INCREMENT			: 0.8,
    MAX_FLY_COUNT               : 1024,
    MATURE_AGE 					: 50,
    HUNGER_PROCREATION_BARRIER	: 50.0,
    HUNGER_INCREMENT			: 0.243,
    HUNGER_TOLERABLE_LEVEL		: 15.0,
    HUNGER_EAT_THRESHOLD		: 11,
    MAX_RATIO		            : 3.33,
    HUNGER_LETHAL_LEVEL			: 100.0,
    fly_max_speed				: 1.75,
    FLY_MAX_SIZE			    : 2.77,
    FLY_AGE_LIMIT				: 150,
	HORIZONTAL_BOUNCE			: false,
    VERTICAL_BOUNCE				: false,
	
	log : function(msg="You should specify a message..."){
		console.log(msg);
	},

    init : function(simulation=undefined){
        if(simulation == undefined)simulation = Simulation;
        Swarm.simulation = simulation;
        Swarm.elder = undefined;
        Swarm.fly = undefined;
        for(var i=0; i < Swarm.starting_fly_count; i++){
			Swarm.insertFly( new Fly() );
		}
        Swarm.log("Initialization ok.");
    },

    cleanup : function(){
		Swarm.flies = [];
		Swarm.drawnFlies = [];
    },

	randomFood : function(){
        return new Vector();
    },
    foodAt : function(pos){
		for(var fa_fi in Swarm.food){
			var fa_food = Swarm.food[fa_fi];
			if ( (parseInt(pos.x) == parseInt(fa_food.x)) && (parseInt(pos.y) == parseInt(fa_food.y)) ) return fa_food;
		}
    },
    randomFly : function(){
        for(var rf_fi in Swarm.flies){
            var rf_fly = Swarm.flies[rf_fi];
            if(parseInt(Math.random() *  Swarm.simulation.population.value) == 0) return rf_fly;
        } 
        return undefined;
    },
    insertFly : function(if_f){
		if(Swarm.flies.length > 1) Swarm.simulation.births++;
		Swarm.flies[Swarm.flies.length] = if_f;
       	Swarm.simulation.population.sample(1);
   },
   
    deleteFly                   : function(df_f){
		for(var df_fi in Swarm.flies){
			var df_fly = Swarm.flies[df_fi];
			if(df_fly == df_f) {
				Swarm.flies.splice(df_fi, 1);
				Swarm.simulation.population.sample(-1);
				Swarm.simulation.deaths.sample(1);
				Swarm.simulation.natality.sample(-1);
				return;
			}
		}	
    },

    deleteFood                   : function(df_f){
		for(var df_fi in Swarm.food){
			var df_fly = Swarm.food[df_fi];
			if(df_fly == df_f) {
				Swarm.food.splice(df_fi, 1);
				return;
			}
		}	
    },

    drawPercentileBar           : function(bx, by, fillValue, color, fillValueMax=44){
        var palette = [
            [ color[0] >> 3 , color[1] >> 3 , color[2]>>3   ],
            [ color[0] >> 2 , color[1] >> 2 , color[2]>>2   ],
            [ color[0] >> 1 , color[1] >> 1 , color[2]>>1   ],
            [ color[0]      , color[1]      , color[2]      ],
        ];
        const bw = fillValueMax
        const bh = fillValueMax
        VPU.line(bx     , by    , bx + bw           , by     , palette[1] ); 
        VPU.line(bx+1   , by+1  , bx + bw + 1       , by + 1 , palette[0] ); 
        VPU.line(bx     , by    , bx + fillValue    , by     , palette[3] ); 
        VPU.line(bx+1   , by+1  , bx + fillValue+1  , by + 1 , palette[2] );         
    },

    dropFood    : function(x,y){
        Swarm.food[Swarm.food.length] = new Vector(x, y, Math.random()*100);
    },

	loop : function(){
        
        if(Swarm.flies.length==0) {
            location.reload();
        }

        var fCount = 0;
        var oldest = 0;
        
        for(var l_fi in Swarm.food){
            var l_p = Swarm.food[l_fi];
            if( l_p.y < Swarm.FLOOR_HEIGHT) l_p.y+=3.725;
            //Swarm.food[l_fi] = l_p;
        }

        for(var l_fi in Swarm.flies){
            var l_p = Swarm.flies[l_fi];

            if(l_p.age > oldest){
                oldest = l_p.age;
                Swarm.elder = l_p;
                if(oldest >= Swarm.simulation.oldestSpecimen){
                    if(Swarm.elder.age > Swarm.simulation.oldestSpecimen) Swarm.simulation.oldestSpecimen = Swarm.elder.age;
                }
            }
    
            // Switch between simulation and formation logic
            if(Swarm.simulation.fly_in_formation) l_p.inFormation();
            else l_p.instinct();
            
            // Elemental logic
            l_p.logic();
            
            if(l_p == Swarm.elder)
                if(!(Swarm.simulation.clock.moment % 20))
                if(l_p.target) l_p.shoot( l_p.target.x , l_p.target.y);
                //if(l_p.enemy) l_p.shoot(l_p.enemy.position.x , l_p.enemy.position.y);
                
            // REMOVE DYING SPECIMENES            
            if( l_p.age < 0) {
                l_p.die();
                Swarm.deleteFly( l_p );
            } else {
                Swarm.flies[l_fi] = l_p;
            }         
        }
                
        // Give the elder a extra boost, for the experience taken...
        if(Swarm.elder){
            Swarm.elder.move();
            if(Swarm.elder.target){
                var x = Swarm.elder.target.x
                var y = Swarm.elder.target.y
                VPU.pset(x-1, y-1, [255, 255, 0] );
                VPU.pset(x+1, y-1, [255, 255, 0] );
                VPU.pset(x  , y  , [255, 255, 0] );
                VPU.pset(x-1, y+1, [255, 255, 0] );
                VPU.pset(x+1, y+1, [255, 255, 0] );
            }
            //VPU.line(Swarm.elder.position.x, Swarm.elder.position.y, Swarm.elder.target.x, Swarm.elder.target.y, [100,100,0]);
        }
        //if(Swarm.simulation.clock.moment % 125 == 0) srand(time(NULL));        
    },

    render : function(){
        var p;
        var c;
        var h;
        
        for(var r_fi in Swarm.food){
            var rp = Swarm.food[r_fi];
            if(rp)
            VPU.pset(rp.x, rp.y, [(rp.z),(rp.z),(rp.z)]);
        }
        //var li = (Swarm.simulation.population.value < Swarm.MAX_FLY_COUNT) ? Swarm.simulation.population.value : Swarm.MAX_FLY_COUNT;
        for(var r_fi in Swarm.flies){
            var rp = Swarm.flies[r_fi];
            
            c = ((rp.age) / Swarm.simulation.oldestSpecimen )*256.0;
            if(c>255)c=255;
            rp.ratio = ((rp.age)/350.0) * Swarm.MAX_RATIO;
            if(rp.ratio> Swarm.MAX_RATIO) rp.ratio = Swarm.MAX_RATIO;
            
            c=128+(c>>1);
            h = ((Math.abs(rp.hunger))/130.0) * 255.0;
            c = [h, c - h, 0];
            
            var ex= rp.position.x - rp.ratio
            var ey= rp.position.y - rp.ratio
            
            //VPU.line(ex, ey, ex + 4, ey - 8, c);
            //VPU.line(ex + 4, ey - 8, ex + 48, ey - 8, c);
            //VPU.print(ex + 4, ey - 16, c, 0, `H:${rp.hunger}`);
            //VPU.print(ex + 4, ey - 24, c, 0, `M:${rp.metabolism}`);
            
            rp.draw(c);
            Swarm.flies[r_fi] = rp;
        }
        
        if(Swarm.elder){
            var c = (Swarm.elder.age /  Swarm.simulation.oldestSpecimen) * 256.0;
            var h = (Math.abs(Swarm.elder.hunger / 100.0 ) * 255.0);
            var c = [ h, c - h, 255-h];
            if(Swarm.simulation.clock.moment % 30 == 0) c = [255, 255, 255];
            if(Swarm.simulation.show_info){
                var bw = 44;
                var bh = 44;
                var bx = Swarm.width - (bw + 10);
                var by = Swarm.FLOOR_HEIGHT - 28;
                var hungerWidth     = (((Math.abs(Swarm.elder.hunger                )/100.0                 )      )*bw);
                var ageWidth        = (((Math.abs(Swarm.elder.age                   )/Swarm.FLY_AGE_LIMIT   )      )*bw);
                var metabolismWidth = (((Math.abs(Swarm.elder.metabolism-1.0*10     )/10.0                  )      )*bw);
                var moodWidth       = (((Math.abs(Swarm.elder.mood+1.0              )*10.0                  )/20.0 )*bw);
                var healthWidth     = (((Math.abs(Swarm.elder.health                )/100.0                 )      )*bw);
                Swarm.drawPercentileBar(bx, by+(bh-15)  , healthWidth    , [32  ,200 ,130] );
                Swarm.drawPercentileBar(bx, by+(bh-12)  , hungerWidth    , [255 ,  0 ,  0] );
                Swarm.drawPercentileBar(bx, by+(bh-9)   , ageWidth       , [0   ,128 ,255] );
                Swarm.drawPercentileBar(bx, by+(bh-6)   , metabolismWidth, [255 ,255 ,  0] );
                Swarm.drawPercentileBar(bx, by+(bh-3)   , moodWidth      , [255 ,128 ,  0] );
            }
            Swarm.elder.draw(c);
        }
        VPU.render();
        // if(Swarm.simulation.clock.moment %2==0) VPU.clear();
        VPU.clear();
    },

}
