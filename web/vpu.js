"use strict";

var VPU = {
    WIREFRAME   : false,
	cbuffer  	: undefined,
	pbuffer  	: undefined,
    wbuffer 	: undefined,
    context     : undefined,
    canvas      : undefined,
    cbuffer_data: undefined,
    pbuffer_data: undefined,
    wbuffer_data: undefined,

    init  : function(){
        VPU.canvas = document.getElementById('canvas');
        VPU.context = VPU.canvas.getContext('2d');
        VPU.cbuffer = VPU.context.createImageData(Swarm.width, Swarm.height);
        VPU.pbuffer = VPU.context.createImageData(Swarm.width, Swarm.height);
        VPU.wbuffer = VPU.context.createImageData(Swarm.width, Swarm.height);
        VPU.cbuffer_data = VPU.cbuffer.data;
        VPU.pbuffer_data = VPU.pbuffer.data;
        VPU.wbuffer_data = VPU.wbuffer.data;
    },

    getp        : function(x,y,bitmap=VPU.pbuffer){
        x = parseInt(x);
        y = parseInt(y);
        var pos = (((y*(Swarm.width*4))) + (x*4));
        var v = bitmap.data;
        return [
            v[ pos ],
            v[pos+1],
            v[pos+2]
        ];
    },

	pset	 	: function(x,y,color,bitmap=VPU.pbuffer){
        // Draw to pbuffer
        x = parseInt(x);
        y = parseInt(y);
        var pos = (((y*(Swarm.width*4))) + (x*4));
        var v = bitmap.data;
        v[pos+0] = parseInt(color[0]);
        v[pos+1] = parseInt(color[1]);
        v[pos+2] = parseInt(color[2]);
        v[pos+3] = 255;
    },

    lighter  : function(c,q){
        return [
            Math.clamp(c[0]+q,0,255),
            Math.clamp(c[1]+(q/(q/4)),0,255),
            Math.clamp(c[2]+q,0,255),
        ];
    },

    clear   : function(){
        for(var i=0; i<Swarm.width*Swarm.height*4;i+=4){
            VPU.pbuffer_data[i]=0;
            VPU.pbuffer_data[i+1]=0;
            VPU.pbuffer_data[i+2]=0;
            VPU.pbuffer_data[i+3]=0;
        }
    },
    
	wset	 	: function(x,y){
		// Draw to wbuffer
	},

    line        : function(X1,Y1,X2,Y2,color){
        var Mx = Math.max(X1, X2);
        var My = Math.max(Y1, Y2);
        var mx = Math.min(X1, X2);
        var my = Math.min(Y1, Y2);
        var dx = Mx - mx;
        var dy = My - my;
        // Calculate the line equation based on deltas
        var D = (2 * dy) - dx;
        var y = my;

        // Draw the line based on arguments provided
        for(var x=mx; x<Mx;x++){
        
            // Draw pixel at this location
            VPU.pset(x,y,color);

            // Progress the line drawing algorithm parameters
            if(D > 0){
                y = y + 1;
                D = D - 2*dx;
            }
            D = D + 2*dy;
        }
    },

    polygon     : function(pair_count, vertices, color){
        var lx = vertices[0];
        var ly = vertices[1];        
        var ix = lx;
        var iy = ly;
        for(var i = 0; i<pair_count*2; i+=2){
            var x = vertices[i];
            var y = vertices[i+1];
            VPU.line(lx,ly,x,y,color);
            lx = x;
            ly = y;
        }
        VPU.line(lx,ly,ix,iy,color);
        
    },

	cool		: function(){
		// Cool warmmap
	},

	squash		: function(){
        // Draw all buffers as layers to cbuffer
        var i=0;
        for(var tx=0;tx<Swarm.width*4;tx++){
            for(var ty=0;ty<Swarm.height;ty++){
                VPU.pbuffer.data[i] = Math.clamp(VPU.wbuffer.data[i]+VPU.pbuffer.data[i],0,255);
                i++;
            }
        }
	},

	render		: function(){
        VPU.context=document.getElementById('canvas').getContext('2d');
        VPU.squash();
        VPU.context.putImageData(VPU.pbuffer, 0, 0);
        VPU.cbuffer_data = VPU.cbuffer.data;
        VPU.pbuffer_data = VPU.pbuffer.data;
        VPU.wbuffer_data = VPU.wbuffer.data;
    },
    
};

