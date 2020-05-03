var gl;
var program_MGR, program_PB;
var numVertices_MGR, numTriangles_MGR, vertices_MGR, indexList_MGR;
var numVertices_PB, numTriangles_PB, vertices_PB, indexList_PB;
var indexBuffer_MGR, verticesBuffer_MGR, vertexPointer_MGR, faceNormals_MGR, vertexNormals_MGR, normalsBuffer_MGR, vertexNormalPointer_MGR;
var indexBuffer_PB, verticesBuffer_PB, vertexPointer_PB, faceNormals_PB, vertexNormals_PB, normalsBuffer_PB, vertexNormalPointer_PB;
var alphaloc;
var ksloc;
var p0loc;
var iDirloc;
var light1Switch, light2Switch, specularSwitch;
var light1SwitchLocation, light2SwitchLocation;
var Mx, My, Mz, Mt, Ms, Mf, Mo;
var tx, ty, tz, sx, sy;
var alpha, beta, gamma;
var MxUniform, MyUniform, MzUniform, MtUniform, MsUniform, MtUniform, MoUniform;
var perspectiveProjectionMatrix1, perspectiveProjectionMatrix2, perspectiveProjectionMatrixLocation1, perspectiveProjectionMatrixLocation2;
var modelviewMatrixInverseTranspose, modelviewMatrix
var modelviewMatrixInverseTransposeLocation1 ,modelviewMatrixLocation1, modelviewMatrixInverseTransposeLocation2, modelviewMatrixLocation2;
function initGL(){
	var canvas = document.getElementById( "gl-canvas" );
	
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.enable(gl.DEPTH_TEST);
	gl.viewport( 0, 0, 512, 512 );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0);	
	
	//modelview matrix
	var e = vec3(10.0, 0.0, 10.0); //eye
	var a = vec3(0.0, 0.0, 0.0); // at point
	var vup = vec3(0.0, 1.0, 0.0); //up vector
	var n = normalize( vec3(e[0]-a[0], e[1]-a[1], e[2]-a[2]));
	var u = normalize(cross(vup,n));
	var v = normalize(cross(n,u));
	modelviewMatrix = [u[0], v[0], n[0], 0.0,
					   u[1], v[1], n[1], 0.0,
					   u[2], v[2], n[2], 0.0,
					   -u[0]*e[0]-u[1]*e[1]-u[2]*e[2],
					   -v[0]*e[0]-v[1]*e[1]-v[2]*e[2],
					   -n[0]*e[0]-n[1]*e[1]-n[2]*e[2], 1.0];
	modelviewMatrixInverseTranspose = [u[0], v[0], n[0], e[0],
									   u[1], v[1], n[1], e[1],
									   u[2], v[2], n[2], e[2],
									   0.0, 0.0, 0.0, 1.0];

	initMGL();
	initPB();
	light();
	
	light1Switch = 0;
	light2Switch = 0;

	//render the object
	render();

};

function getFaceNormals( vertices, indexList, numTriangles){
	console.log("Getting face normals");
	console.log("Length of index list is " + indexList.length);
	console.log("Amount of triangles is " + numTriangles);
	var faceNormals = [];
	for(var i = 0; i < numTriangles; i++){		
		var p0 = vec3(vertices[indexList[3*i]][0],
					  vertices[indexList[3*i]][1],
					  vertices[indexList[3*i]][2] );
		var p1 = vec3(vertices[indexList[3*i+1]][0],
					  vertices[indexList[3*i+1]][1],
					  vertices[indexList[3*i+1]][2] );
		var p2 = vec3(vertices[indexList[3*i+2]][0],
					  vertices[indexList[3*i+2]][1],
					  vertices[indexList[3*i+2]][2] );			  
		var p1minusp0 = vec3(p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]);
		var p2minusp0 = vec3(p2[0]-p0[0], p2[1]-p0[1], p2[2]-p0[2]);
		var faceNormal = cross(p1minusp0, p2minusp0);
		faceNormal = normalize(faceNormal);
		faceNormals.push(faceNormal);
	}
	return faceNormals;
};

function getVertexNormals(vertices, indexList, faceNormals, numVertices, numTriangles){
	console.log("Geting vertex normals");
	var vertexNormals = [];
	//itr through all vertices
	for(var j = 0; j < numVertices+1; j++){
		var vertexNormal = vec3(0, 0, 0);
		//itr through triangles
		for(var i = 0; i < numTriangles; i++){
			if(indexList[3*i] == j | indexList[3*i+1] == j | indexList[3*i+2] == j){
				//if the j-th vertex is present in the i-th triangle
				//and the i-th triangles face normal to vertexNormals
			//console.log(faceNormals[i][0]);
				vertexNormal[0] = vertexNormal[0] + faceNormals[i][0];
				vertexNormal[1] = vertexNormal[1] + faceNormals[i][1];
				vertexNormal[2] = vertexNormal[2] + faceNormals[i][2];			
			}
		}		
		if ((vertexNormal[0] == 0)&&(vertexNormal[1] == 0)&&(vertexNormal[2] == 0)) {
			vertexNormal = normalize(vertexNormal);
		}	
	}
	return vertexNormals;	
};

function switchLight1(){
	if(light1Switch == 1){
		light1Switch = 0;
		light1SwitchLocation = gl.getUniformLocation(program_MGR, "light1SwitchShader");
		gl.uniform1f(light1SwitchLocation, light1Switch);
	}else{
		light1Switch = 1;
		light1SwitchLocation = gl.getUniformLocation(program_MGR, "light1SwitchShader");
		gl.uniform1f(light1SwitchLocation, light1Switch);
	}
	console.log("Light1 switch = " + light1Switch)
}

function switchLight2(){
	if(light2Switch == 1){
		light2Switch = 0;
		light2SwitchLocation = gl.getUniformLocation(program_MGR, "light2SwitchShader");
		gl.uniform1f(light2SwitchLocation, light2Switch);
	}else{
		light2Switch = 1;
		light2SwitchLocation = gl.getUniformLocation(program_MGR, "light2SwitchShader");
		gl.uniform1f(light2SwitchLocation, light2Switch);
	}
	console.log("Light2 switch = " + light2Switch)
}

function switchSpecular(){
	if( specularSwitch == 1){
		gl.uniform3f(ksloc, 0.0, 0.0, 0.0);
		specularSwitch = 0;
	}else{
		gl.uniform3f(ksloc, 1.0, 1.0, 1.0);
		specularSwitch = 1;
	}
	console.log("Specular switch = " + specularSwitch)
}

function keys(event){
		gl.useProgram(program_MGR);
	
		var theKeyCode = event.keyCode;
		
		if( theKeyCode == 88 ){ //x
			alpha = alpha + .1;
			Mx = [1.0,
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  Math.cos(alpha),
				  Math.sin(alpha),
				  0.0,
				  0.0,
				  -Math.sin(alpha),
				  Math.cos(alpha),
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  1.0];
			gl.uniformMatrix4fv(MxUniform, false, flatten(Mx));
		}else if(theKeyCode == 89 ){ //y
			beta = beta + .1;
			My = [Math.cos(beta),
				  0.0,
				  Math.sin(beta),
				  0.0,
				  0.0,
				  1.0,
				  0.0,
				  0.0,
				  -Math.sin(beta),
				  0.0,
				  Math.cos(beta),
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  1.0];
			gl.uniformMatrix4fv(MyUniform, false, flatten(My));
		}else if( theKeyCode == 90 ){ //z
			gamma = gamma +.1;
			Mz = [Math.cos(gamma),
				  Math.sin(gamma),
				  0.0,
				  0.0,
				  -Math.sin(gamma),
				  Math.cos(gamma),
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  1.0,
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  1.0];
			gl.uniformMatrix4fv(MzUniform, false, flatten(Mz));
		}
		
		
		if( theKeyCode == 74 ){ //J
			sx = sx - .01;
		}else if(theKeyCode == 76 ){ //L
			sx = sx + .01;
		}else if( theKeyCode == 73 ){ //I
			sy = sy + .01;
		}else if( theKeyCode == 75 ){ //K
			sy = sy - .01;
		}
		
		Ms = [sx,
			  0.0,
			  0.0,
			  0.0,
			  0.0,
			  sy,
			  0.0,
			  0.0,
			  0.0,
			  0.0,
			  1.0,
			  0.0,
			  0.0,
			  0.0,
			  0.0,
			  1.0];
	    
		gl.uniformMatrix4fv(MsUniform, false, flatten(Ms));
		
		if( theKeyCode == 65 ){ //A
			tx = tx - .01;
		}else if(theKeyCode == 68 ){ //D
			tx = tx + .01;
		}else if( theKeyCode == 83 ){ //S
			ty = ty - .01;
		}else if( theKeyCode == 87 ){ //W
			ty = ty + .01;
		}else if( theKeyCode == 81 ){ //Q
			tz = tz + .01;
		}else if( theKeyCode == 69 ){ //E
			tz = tz - .01;
		}
		Mt = [1.0, 
			  0.0, 
			  0.0, 
			  0.0,
			  0.0,
			  1.0,
			  0.0,
			  0.0,
			  0.0,
			  0.0,
			  1.0,
			  0.0,
			  tx,
			  ty,
			  tz,
			  1.0];
		gl.uniformMatrix4fv(MtUniform, false, flatten(Mt));
		
	if( theKeyCode == 80 ){ //P
		console.log("sx sy: " + sx + " " + sy + " //tx ty: " + tx + " " + ty + " //Alpha Gamma Beta: " + alpha + gamma + beta);
	}
}

function light(){
	gl.useProgram(program_MGR );

	//coefficients for object
	var kaloc = gl.getUniformLocation(program_MGR, "ka");
	var kdloc = gl.getUniformLocation(program_MGR, "kd");
	ksloc = gl.getUniformLocation(program_MGR, "ks");
	gl.uniform3f(kaloc, 0.5, 0.5, 0.5);
	gl.uniform3f(kdloc, 0.5, 0.5, 0.5);
	gl.uniform3f(ksloc, 1.0, 1.0, 1.0);
	alphaloc = gl.getUniformLocation(program_MGR, "alpha");
	gl.uniform1f(alphaloc, 4.0);
	specularSwitch = 1;
	
	p0loc = gl.getUniformLocation(program_MGR, "p0");
	gl.uniform3f(p0loc, 0.0, 0.0, 45.0);
	
	//values for light components
	var Ia1loc = gl.getUniformLocation(program_MGR, "Ia1");
	var Id1loc = gl.getUniformLocation(program_MGR, "Id1");
	var Is1loc = gl.getUniformLocation(program_MGR, "Is1");
	gl.uniform3f(Ia1loc, 0.1, 0.1, 0.1);
	gl.uniform3f(Id1loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is1loc, 0.8, 0.8, 0.8);
	
	iDirloc = gl.getUniformLocation(program_MGR, "iDir");
	gl.uniform3f(iDirloc, 0.5, 0.7, 1);
	
	var Ia2loc = gl.getUniformLocation(program_MGR, "Ia2");
	var Id2loc = gl.getUniformLocation(program_MGR, "Id2");
	var Is2loc = gl.getUniformLocation(program_MGR, "Is2");
	gl.uniform3f(Ia2loc, 0.1, 0.1, 0.5);
	gl.uniform3f(Id2loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is2loc, 0.8, 0.8, 0.8);
}

function initMGL(){
	numVertices_MGR = 436;
	numTriangles_MGR = 819;
	vertices_MGR = getVertices();
	indexList_MGR = getFaces();
	
	sx = sy = 1;
	tx = ty = tz = 0;
	alpha = beta = gamma = 0;
	Ms = Mx = My = Mz = Mt = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	
	//projection matrix
	var left = -5.0;
	var right = 5.0;
	var top_ = 5.0;
	var bottom = -5.0;
	var near = 10;
	var far = 20.0;
	
	//perspective projection matrix
	perspectiveProjectionMatrix1 = 
		[2.0*near/(right-left), .0, .0, .0,
		 .0, 2.0*near/(top_-bottom), .0, .0,
		 (right+left)/(right-left), (top_+bottom)/(top_-bottom), -(far+near)/(far-near), -1.0,
		 .0, .0, -(2.0*far*near)/(far-near), .0];
	
	program_MGR = initShaders( gl, "MGR_vertex-shader", "MGR_fragment-shader" );
	gl.useProgram(program_MGR );
	
	perspectiveProjectionMatrixLocation1 = gl.getUniformLocation(program_MGR, "P_persp");
	gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation1, false, perspectiveProjectionMatrix1);
	
	indexBuffer_MGR = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_MGR);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList_MGR), gl.STATIC_DRAW);
	
	verticesBuffer_MGR = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_MGR);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices_MGR), gl.STATIC_DRAW);
	
	vertexPointer_MGR = gl.getAttribLocation(program_MGR, "vertexPosition");
	gl.vertexAttribPointer( vertexPointer_MGR, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vertexPointer_MGR);
		
	faceNormals_MGR = getFaceNormals( vertices_MGR, indexList_MGR, numTriangles_MGR);
	vertexNormals_MGR = getVertexNormals( vertices_MGR, indexList_MGR, faceNormals_MGR, numVertices_MGR, numTriangles_MGR);
	
	normalsBuffer_MGR = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_MGR);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals_MGR), gl.STATIC_DRAW);
	
	vertexNormalPointer_MGR = gl.getAttribLocation(program_MGR, "nv");
	gl.vertexAttribPointer( vertexNormalPointer_MGR, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vertexNormalPointer_MGR );
	
	MsUniform = gl.getUniformLocation(program_MGR, "Ms" );
	MxUniform = gl.getUniformLocation(program_MGR, "Mx" );
	MyUniform = gl.getUniformLocation(program_MGR, "My" );
	MzUniform = gl.getUniformLocation(program_MGR, "Mz" );
	MtUniform = gl.getUniformLocation(program_MGR, "Mt" );
	gl.uniformMatrix4fv( MsUniform, false, flatten(Ms) );
	gl.uniformMatrix4fv( MxUniform, false, flatten(Mx) );
	gl.uniformMatrix4fv( MyUniform, false, flatten(My) );
	gl.uniformMatrix4fv( MzUniform, false, flatten(Mz) );
	gl.uniformMatrix4fv( MtUniform, false, flatten(Mt) );
	modelviewMatrixLocation1 = gl.getUniformLocation(program_MGR, "M");
	modelviewMatrixInverseTransposeLocation1 = gl.getUniformLocation(program_MGR, "M_inversetranspose");
	gl.uniformMatrix4fv(modelviewMatrixLocation1, false, modelviewMatrix);
	gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation1, false, modelviewMatrixInverseTranspose);
}

function initPB(){
	numVertices_PB = 356;
	numTriangles_PB = 743;
	vertices_PB = getPBVertices();
	indexList_PB = getPBFaces();
	
	//projection matrix
	var left = -5.0;
	var right = 5.0;
	var top_ = 5.0;
	var bottom = -5.0;
	var near = 10;
	var far = 20.0;
	
	//perspective projection matrix
	perspectiveProjectionMatrix2 = 
		[2.0*near/(right-left), .0, .0, .0,
		 .0, 2.0*near/(top_-bottom), .0, .0,
		 (right+left)/(right-left), (top_+bottom)/(top_-bottom), -(far+near)/(far-near), -1.0,
		 .0, .0, -(2.0*far*near)/(far-near), .0];	
	
	program_PB = initShaders( gl, "PB_vertex-shader", "PB_fragment-shader" );
	gl.useProgram(program_PB);
	
	perspectiveProjectionMatrixLocation2 = gl.getUniformLocation(program_PB, "P_persp");
	gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation2, false, perspectiveProjectionMatrix2);
	
	indexBuffer_PB = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_PB);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList_PB), gl.STATIC_DRAW);
	
	verticesBuffer_PB = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_PB);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices_PB), gl.STATIC_DRAW);
	
	vertexPointer_PB = gl.getAttribLocation(program_PB, "vertexPosition");
	gl.vertexAttribPointer( vertexPointer_PB, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vertexPointer_PB);
		
	faceNormals_PB = getFaceNormals( vertices_PB, indexList_PB, numTriangles_PB);
	vertexNormals_PB = getVertexNormals( vertices_PB, indexList_PB, faceNormals_PB, numVertices_PB, numTriangles_PB);
	
	normalsBuffer_PB = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_PB);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals_PB), gl.STATIC_DRAW);
	
	modelviewMatrixLocation2 = gl.getUniformLocation(program_PB, "M");
	gl.uniformMatrix4fv(modelviewMatrixLocation2, false, modelviewMatrix);
	
}

function drawMGR(){
	gl.useProgram(program_MGR);
	
	//bind buffers and set up pointer
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_MGR);
	gl.enableVertexAttribArray(vertexPointer_MGR);
	gl.vertexAttribPointer( vertexPointer_MGR, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_MGR);
	gl.enableVertexAttribArray( vertexNormalPointer_MGR );
	gl.vertexAttribPointer( vertexNormalPointer_MGR, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_MGR);
	gl.drawElements(gl.TRIANGLES, 3*numTriangles_MGR, gl.UNSIGNED_SHORT, 0);
}

function drawPB(){
	//console.log("Here");
	gl.useProgram(program_PB);
	
	//bind buffers and set up pointer
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_PB);
	gl.enableVertexAttribArray(vertexPointer_PB);
	gl.vertexAttribPointer( vertexPointer_PB, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_PB);
	gl.enableVertexAttribArray( vertexNormalPointer_PB );
	gl.vertexAttribPointer( vertexNormalPointer_PB, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_PB);
	gl.drawElements(gl.TRIANGLES, 3*numTriangles_PB, gl.UNSIGNED_SHORT, 0);
}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	drawMGR();
	drawPB();
	requestAnimFrame(render);

}