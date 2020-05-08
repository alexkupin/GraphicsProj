var gl;
var program_MGR, program_PB, program_Swing, program_TC;
var numVertices_MGR, numTriangles_MGR, vertices_MGR, indexList_MGR;
var numVertices_PB, numTriangles_PB, vertices_PB, indexList_PB;
var numVertices_TC, numTriangles_TC, vertices_TC, indexList_TC;
var numVertices_Swing, numTriangles_Swing, vertices_Swing, indexList_Swing;
var indexBuffer_MGR, verticesBuffer_MGR, vertexPointer_MGR, faceNormals_MGR, vertexNormals_MGR, normalsBuffer_MGR, vertexNormalPointer_MGR;
var indexBuffer_PB, verticesBuffer_PB, vertexPointer_PB, faceNormals_PB, vertexNormals_PB, normalsBuffer_PB, vertexNormalPointer_PB;
var indexBuffer_TC, verticesBuffer_TC, vertexPointer_TC, faceNormals_TC, vertexNormals_TC, normalsBuffer_TC, vertexNormalPointer_TC;
var indexBuffer_Swing, verticesBuffer_Swing, vertexPointer_Swing, faceNormals_Swing, vertexNormals_Swing, normalsBuffer_Swing, vertexNormalPointer_Swing;
var textureVertexbuffer_PB, textureCoordinate_PB;
var textureVertexbuffer_TC, textureCoordinate_TC;
var textureVertexbuffer_MGR, textureCoordinate_MGR;
var textureVertexbuffer_Swing, textureCoordinate_Swing;
var alphaloc;
var ksloc;
var p0loc;
var iDirloc;
var light1Switch, light2Switch, specularSwitch;
var light1SwitchLocation, light2SwitchLocation;
var Px, Py, Pz, Pt, Ps, Pf, Po;
var TCx, TCy, TCz, TCt, TCs, TCf, TCo;
var Swx, Swy, Swz, Swt, Sws, Swf, Swo;
var Mx, My, Mz, Mt, Ms, Mf, Mo;
var tx, ty, tz, sx, sy;
var Ptx, Pty, Ptz, Psx, Psy;
var TCtx, TCty, TCtz, TCsx, TCsy;
var Swtx, Swty, Swtz, Swsx, Swsy;
var alpha, beta, gamma;
var Palpha, Pbeta, Pgamma;
var TCalpha, TCbeta, TCgamma;
var Swalpha, Swbeta, Swgamma;
var TCxUniform, TCyUniform, TCzUniform, TCtUniform, TCsUniform, TCtUniform, TCUniform;
var SwxUniform, SwyUniform, SwzUniform, SwtUniform, SwsUniform, SwtUniform, SwoUniform;
var PxUniform, PyUniform, PzUniform, PtUniform, PsUniform, PtUniform, PoUniform;
var MxUniform, MyUniform, MzUniform, MtUniform, MsUniform, MtUniform, MoUniform;
var perspectiveProjectionMatrix1, perspectiveProjectionMatrix2, perspectiveProjectionMatrixLocation1, perspectiveProjectionMatrixLocation2;
var modelviewMatrixInverseTranspose, modelviewMatrix
var modelviewMatrixInverseTransposeLocation1 ,modelviewMatrixLocation1, modelviewMatrixInverseTransposeLocation2, modelviewMatrixLocation2;
var leftMG,rightMG,nearMG,bottomMG,topMG,farMG;
var myImageMetal;
var textureImageMetal;

function initGL(){
	var canvas = document.getElementById( "gl-canvas" );
	
	
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.enable(gl.DEPTH_TEST);
	gl.viewport( 0, 0, 512, 512 );
	gl.clearColor( 0.0, 0.0, 0.0, 1.0);	
	
	//modelview matrix
	var e = vec3(10.0, 5.0, 10.0); //eye
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

	initMGR();
	initPB();
	initTC();
	initSwing();
	
	light1Switch = 0;
	light2Switch = 0;
	switchLight1();
	switchLight2();

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
gl.useProgram(program_MGR);
gl.uniform1f(light1SwitchLocation, light1Switch);

var light1SwitchLocation2 = gl.getUniformLocation(program_PB, "light1SwitchShader");
gl.useProgram(program_PB);
gl.uniform1f(light1SwitchLocation2, light1Switch);

var light1SwitchLocation3 = gl.getUniformLocation(program_TC, "light1SwitchShader");
gl.useProgram(program_TC);
gl.uniform1f(light1SwitchLocation3, light1Switch);

var light1SwitchLocation4 = gl.getUniformLocation(program_Swing, "light1SwitchShader");
gl.useProgram(program_Swing);
gl.uniform1f(light1SwitchLocation4, light1Switch);
}else{
light1Switch = 1;
var light1SwitchLocation = gl.getUniformLocation(program_MGR, "light1SwitchShader");
gl.useProgram(program_MGR);
gl.uniform1f(light1SwitchLocation, light1Switch);

var light1SwitchLocation2 = gl.getUniformLocation(program_PB, "light1SwitchShader");
gl.useProgram(program_PB);
gl.uniform1f(light1SwitchLocation2, light1Switch);

var light1SwitchLocation3 = gl.getUniformLocation(program_TC, "light1SwitchShader");
gl.useProgram(program_TC);
gl.uniform1f(light1SwitchLocation3, light1Switch);

var light1SwitchLocation4 = gl.getUniformLocation(program_Swing, "light1SwitchShader");
gl.useProgram(program_Swing);
gl.uniform1f(light1SwitchLocation4, light1Switch);
}
console.log("Light1 switch = " + light1Switch)
}

function switchLight2(){
if(light2Switch == 1){
light2Switch = 0;
var light2SwitchLocation = gl.getUniformLocation(program_MGR, "light2SwitchShader");
gl.useProgram(program_MGR);
gl.uniform1f(light2SwitchLocation, light2Switch);

var light2SwitchLocation2 = gl.getUniformLocation(program_PB, "light2SwitchShader");
gl.useProgram(program_PB);
gl.uniform1f(light2SwitchLocation2, light2Switch);

var light2SwitchLocation3 = gl.getUniformLocation(program_TC, "light2SwitchShader");
gl.useProgram(program_TC);
gl.uniform1f(light2SwitchLocation3, light2Switch);

var light2SwitchLocation4 = gl.getUniformLocation(program_Swing, "light2SwitchShader");
gl.useProgram(program_Swing);
gl.uniform1f(light2SwitchLocation4, light2Switch);
}else{
light2Switch = 1;

var light2SwitchLocation = gl.getUniformLocation(program_MGR, "light2SwitchShader");
gl.useProgram(program_MGR);
gl.uniform1f(light2SwitchLocation, light2Switch);

var light2SwitchLocation2 = gl.getUniformLocation(program_PB, "light2SwitchShader");
gl.useProgram(program_PB);
gl.uniform1f(light2SwitchLocation2, light2Switch);

var light2SwitchLocation3 = gl.getUniformLocation(program_TC, "light2SwitchShader");
gl.useProgram(program_TC);
gl.uniform1f(light2SwitchLocation3, light2Switch);

var light2SwitchLocation4 = gl.getUniformLocation(program_Swing, "light2SwitchShader");
gl.useProgram(program_Swing);
gl.uniform1f(light2SwitchLocation4, light2Switch);
}
console.log("Light2 switch = " + light2Switch)
}

function switchSpecular(){
	if( specularSwitch == 1){
		gl.uniform3f(ksloc, 0.0, 0.0, 0.0);
		specularSwitch = 0;
	}else{
		gl.uniform3f(ksloc, 0.5, 0.5, 0.5);
		specularSwitch = 1;
	}
	console.log("Specular switch = " + specularSwitch)
}

function keys(event){
		gl.useProgram(program_MGR);
	
		var theKeyCode = event.keyCode;
		
		 if(theKeyCode == 65 ){ //A
			beta = beta + .1;
			My = [Math.cos(beta),
				  0.0,
				 -Math.sin(beta),
				  0.0,
				  0.0,
				  1.0,
				  0.0,
				  0.0,
				  Math.sin(beta),
				  0.0,
				  Math.cos(beta),
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  1.0];
		 gl.uniformMatrix4fv(MyUniform, false, flatten(My));}
		 else if(theKeyCode == 68){ //D
			beta = beta - .1;
			My = [Math.cos(beta),
				  0.0,
				 -Math.sin(beta),
				  0.0,
				  0.0,
				  1.0,
				  0.0,
				  0.0,
				  Math.sin(beta),
				  0.0,
				  Math.cos(beta),
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  1.0];
		 gl.uniformMatrix4fv(MyUniform, false, flatten(My));}
		
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
			  sz,
			  0.0,
			  0.0,
			  0.0,
			  0.0,
			  1.0];
	    
		gl.uniformMatrix4fv(MsUniform, false, flatten(Ms));
		
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
	
}

function initMGR(){
	numVertices_MGR = 436;
	numTriangles_MGR = 819;
	vertices_MGR = getMGRVertices();
	indexList_MGR = getMGRFaces();
	textureCoordinates_MGR = getMGRTextureCoord();

	 leftMG = -5.0;
	 rightMG = 5.0;
	 topMG = 5.0;
	 bottomMG = -5.0;
	 nearMG = 10;
	 farMG = 30.0;
	
	sx = sy = sz = 2;
	tx = 1;
	ty = 0;
	tz = 1;
	alpha = beta = gamma = 0;
    Mx = My = Mz = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	Mt = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
	Ms = [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
	
	//perspective projection matrix
	perspectiveProjectionMatrix1 = 
		[2.0*nearMG/(rightMG-leftMG), .0, .0, .0,
		 .0, 2.0*nearMG/(topMG-bottomMG), .0, .0,
		 (rightMG+leftMG)/(rightMG-leftMG), (topMG+bottomMG)/(topMG-bottomMG), -(farMG+nearMG)/(farMG-nearMG), -1.0,
		 .0, .0, -(2.0*farMG*nearMG)/(farMG-nearMG), .0];
	
	program_MGR = initShaders( gl, "MGR_vertex-shader", "MGR_fragment-shader" );
	gl.useProgram(program_MGR );
	
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
	gl.uniform3f(Ia2loc, 1.0, 1.0, 1.0);
	gl.uniform3f(Id2loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is2loc, 0.8, 0.8, 0.8);
	
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
	
	textureVertexbuffer_MGR = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer_MGR);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates_MGR), gl.STATIC_DRAW);
	
	textureCoordinate_MGR = gl.getAttribLocation(program_MGR, "textureCoordinate");
	gl.vertexAttribPointer(textureCoordinate_MGR, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureCoordinate_MGR);
	
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
	
	myImageMetal = document.getElementById("metal");
	textureImageMetal = gl.createTexture();
	
	gl.bindTexture(gl.TEXTURE_2D, textureImageMetal);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImageMetal);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	
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
	textureCoordinates_PB = getPBTextureCoord();
	
	//projection matrix
	var left = -5.0;
	var right = 5.0;
	var top_ = 5.0;
	var bottom = -5.0;
	var near = 10;
	var far = 40.0;
	
	Psx = Psy = 1;
	Ptx =1;
	Pty =0;
	Ptz =-6;
	Palpha = 0;
	Pbeta =  80;
	Pgamma = 0;
	Ps = Py = Pz = Pt = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	Pt=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, Ptx, Pty, Ptz, 1];
	Px = [		  1.0,
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  Math.cos(Palpha),
				 -Math.sin(Palpha),
				  0.0,
				  0.0,
				  Math.sin(Palpha),
				  Math.cos(Palpha),
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  1.0];
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
	
	textureVertexbuffer_PB = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer_PB);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates_PB), gl.STATIC_DRAW);
	
	textureCoordinate_PB = gl.getAttribLocation(program_PB, "textureCoordinate");
	gl.vertexAttribPointer(textureCoordinate_PB, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureCoordinate_PB);
	
	modelviewMatrixLocation2 = gl.getUniformLocation(program_PB, "M");
	gl.uniformMatrix4fv(modelviewMatrixLocation2, false, modelviewMatrix);
	
	gl.useProgram(program_PB );

	//coefficients for object
	var kaloc = gl.getUniformLocation(program_PB, "ka");
	var kdloc = gl.getUniformLocation(program_PB, "kd");
	ksloc = gl.getUniformLocation(program_PB, "ks");
	gl.uniform3f(kaloc, 0.5, 0.5, 0.5);
	gl.uniform3f(kdloc, 0.5, 0.5, 0.5);
	gl.uniform3f(ksloc, 1.0, 1.0, 1.0);
	alphaloc = gl.getUniformLocation(program_PB, "alpha");
	gl.uniform1f(alphaloc, 4.0);
	specularSwitch = 1;
	
	p0loc = gl.getUniformLocation(program_PB, "p0");
	gl.uniform3f(p0loc, 0.0, 0.0, 45.0);
	
	//values for light components
	var Ia1loc = gl.getUniformLocation(program_PB, "Ia1");
	var Id1loc = gl.getUniformLocation(program_PB, "Id1");
	var Is1loc = gl.getUniformLocation(program_PB, "Is1");
	gl.uniform3f(Ia1loc, 0.1, 0.1, 0.1);
	gl.uniform3f(Id1loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is1loc, 0.8, 0.8, 0.8);
	
	iDirloc = gl.getUniformLocation(program_PB, "iDir");
	gl.uniform3f(iDirloc, 0.5, 0.7, 1);
	
	var Ia2loc = gl.getUniformLocation(program_PB, "Ia2");
	var Id2loc = gl.getUniformLocation(program_PB, "Id2");
	var Is2loc = gl.getUniformLocation(program_PB, "Is2");
	gl.uniform3f(Ia2loc, 1.0, 1.0, 1.0);
	gl.uniform3f(Id2loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is2loc, 0.8, 0.8, 0.8);
	
	modelviewMatrixLocation2 = gl.getUniformLocation(program_PB, "M");
	modelviewMatrixInverseTransposeLocation2 = gl.getUniformLocation(program_PB, "M_inversetranspose");
	gl.uniformMatrix4fv(modelviewMatrixLocation2, false, modelviewMatrix);
	gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation2, false, modelviewMatrixInverseTranspose);
	
	vertexNormalPointer_PB = gl.getAttribLocation(program_PB, "nv");
	gl.vertexAttribPointer( vertexNormalPointer_PB, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vertexNormalPointer_PB );
	
	PsUniform = gl.getUniformLocation(program_PB, "Ps" );
	PxUniform = gl.getUniformLocation(program_PB, "Px" );
	PyUniform = gl.getUniformLocation(program_PB, "Py" );
	PzUniform = gl.getUniformLocation(program_PB, "Pz" );
	PtUniform = gl.getUniformLocation(program_PB, "Pt" );
	gl.uniformMatrix4fv( PsUniform, false, flatten(Ps) );
	gl.uniformMatrix4fv( PxUniform, false, flatten(Px) );
	gl.uniformMatrix4fv( PyUniform, false, flatten(Py) );
	gl.uniformMatrix4fv( PzUniform, false, flatten(Pz) );
	gl.uniformMatrix4fv( PtUniform, false, flatten(Pt) );
	
	myImage = document.getElementById("wood");
	
	textureImage = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, textureImage);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImage);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	
}

function initTC(){
	numVertices_TC = 356;
	numTriangles_TC = 743;
	vertices_TC = getTCVertices();
	indexList_TC = getTCFaces();
	textureCoordinates_TC = getTCTextureCoord();
	
	//projection matrix
	var left = -5.0;
	var right = 5.0;
	var top_ = 5.0;
	var bottom = -5.0;
	var near = 10;
	var far = 30.0;
	
	TCsx = TCsy = 1;
	TCtx =-2;
	TCty =0;
	TCtz =-5.6;
	TCalpha = 0;
	TCbeta =  0;
	TCgamma = 0;
	TCs = TCy = TCz = TCt = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	TCt=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, TCtx, TCty, TCtz, 1];
	TCx = [		  1.0,
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  Math.cos(TCalpha),
				 -Math.sin(TCalpha),
				  0.0,
				  0.0,
				  Math.sin(TCalpha),
				  Math.cos(TCalpha),
				  0.0,
				  0.0,
				  0.0,
				  0.0,
				  1.0];
	//perspective projection matrix
	perspectiveProjectionMatrix2 = 
		[2.0*near/(right-left), .0, .0, .0,
		 .0, 2.0*near/(top_-bottom), .0, .0,
		 (right+left)/(right-left), (top_+bottom)/(top_-bottom), -(far+near)/(far-near), -1.0,
		 .0, .0, -(2.0*far*near)/(far-near), .0];	
	
	program_TC = initShaders( gl, "TC_vertex-shader", "TC_fragment-shader" );
	gl.useProgram(program_TC);
	
	perspectiveProjectionMatrixLocation2 = gl.getUniformLocation(program_TC, "P_persp");
	gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation2, false, perspectiveProjectionMatrix2);
	
	indexBuffer_TC = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_TC);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList_TC), gl.STATIC_DRAW);
	
	verticesBuffer_TC = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_TC);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices_TC), gl.STATIC_DRAW);
	
	vertexPointer_TC = gl.getAttribLocation(program_TC, "vertexPosition");
	gl.vertexAttribPointer( vertexPointer_TC, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vertexPointer_TC);
		
	faceNormals_TC = getFaceNormals( vertices_TC, indexList_TC, numTriangles_TC);
	vertexNormals_TC = getVertexNormals( vertices_TC, indexList_TC, faceNormals_TC, numVertices_TC, numTriangles_TC);
	
	normalsBuffer_TC = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_TC);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals_TC), gl.STATIC_DRAW);
	
	textureVertexbuffer_TC = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer_TC);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates_TC), gl.STATIC_DRAW);
	
	textureCoordinate_TC = gl.getAttribLocation(program_TC, "textureCoordinate");
	gl.vertexAttribPointer(textureCoordinate_TC, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureCoordinate_TC);
	
	modelviewMatrixLocation2 = gl.getUniformLocation(program_TC, "M");
	gl.uniformMatrix4fv(modelviewMatrixLocation2, false, modelviewMatrix);
	
	gl.useProgram(program_TC);

	//coefficients for object
	var kaloc = gl.getUniformLocation(program_TC, "ka");
	var kdloc = gl.getUniformLocation(program_TC, "kd");
	ksloc = gl.getUniformLocation(program_TC, "ks");
	gl.uniform3f(kaloc, 0.5, 0.5, 0.5);
	gl.uniform3f(kdloc, 0.5, 0.5, 0.5);
	gl.uniform3f(ksloc, 1.0, 1.0, 1.0);
	alphaloc = gl.getUniformLocation(program_TC, "alpha");
	gl.uniform1f(alphaloc, 4.0);
	specularSwitch = 1;
	
	p0loc = gl.getUniformLocation(program_TC, "p0");
	gl.uniform3f(p0loc, 0.0, 0.0, 45.0);
	
	//values for light components
	var Ia1loc = gl.getUniformLocation(program_TC, "Ia1");
	var Id1loc = gl.getUniformLocation(program_TC, "Id1");
	var Is1loc = gl.getUniformLocation(program_TC, "Is1");
	gl.uniform3f(Ia1loc, 0.1, 0.1, 0.1);
	gl.uniform3f(Id1loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is1loc, 0.8, 0.8, 0.8);
	
	iDirloc = gl.getUniformLocation(program_TC, "iDir");
	gl.uniform3f(iDirloc, 0.5, 0.7, 1);
	
	var Ia2loc = gl.getUniformLocation(program_TC, "Ia2");
	var Id2loc = gl.getUniformLocation(program_TC, "Id2");
	var Is2loc = gl.getUniformLocation(program_TC, "Is2");
	gl.uniform3f(Ia2loc, 1.0, 1.0, 1.0);
	gl.uniform3f(Id2loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is2loc, 0.8, 0.8, 0.8);
	
	modelviewMatrixLocation2 = gl.getUniformLocation(program_TC, "M");
	modelviewMatrixInverseTransposeLocation2 = gl.getUniformLocation(program_TC, "M_inversetranspose");
	gl.uniformMatrix4fv(modelviewMatrixLocation2, false, modelviewMatrix);
	gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation2, false, modelviewMatrixInverseTranspose);
	
	vertexNormalPointer_TC = gl.getAttribLocation(program_TC, "nv");
	gl.vertexAttribPointer( vertexNormalPointer_TC, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vertexNormalPointer_TC );
	
	TCsUniform = gl.getUniformLocation(program_TC, "TCs" );
	TCxUniform = gl.getUniformLocation(program_TC, "TCx" );
	TCyUniform = gl.getUniformLocation(program_TC, "TCy" );
	TCzUniform = gl.getUniformLocation(program_TC, "TCz" );
	TCtUniform = gl.getUniformLocation(program_TC, "TCt" );
	gl.uniformMatrix4fv( TCsUniform, false, flatten(TCs) );
	gl.uniformMatrix4fv( TCxUniform, false, flatten(TCx) );
	gl.uniformMatrix4fv( TCyUniform, false, flatten(TCy) );
	gl.uniformMatrix4fv( TCzUniform, false, flatten(TCz) );
	gl.uniformMatrix4fv( TCtUniform, false, flatten(TCt) );
	
	myImageMetal = document.getElementById("metal");
	textureImageMetal = gl.createTexture();
	
	gl.bindTexture(gl.TEXTURE_2D, textureImageMetal);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImageMetal);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	
}

function initSwing(){
	numVertices_Swing = 996;
	numTriangles_Swing = 1894;
	vertices_Swing = getSwingVertices();
	indexList_Swing = getSwingFaces();
	textureCoordinates_Swing = getSwingTextureCoord();

	//projection matrix
	var left = -5.0;
	var right = 5.0;
	var top_ = 5.0;
	var bottom = -5.0;
	var near = 10;
	var far = 30.0;
	
	
	Swsx = Swsy = 1;
	Swtx=-7;
	Swty=-1;
	Swtz=1.5;
	Swalpha = Swbeta = Swgamma = 0;
	Sws = Swx = Swy = Swz = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	Swt=[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, Swtx, Swty, Swtz, 1];
	
	//perspective projection matrix
	perspectiveProjectionMatrix2 = 
		[2.0*near/(right-left), .0, .0, .0,
		 .0, 2.0*near/(top_-bottom), .0, .0,
		 (right+left)/(right-left), (top_+bottom)/(top_-bottom), -(far+near)/(far-near), -1.0,
		 .0, .0, -(2.0*far*near)/(far-near), .0];	
	
	program_Swing = initShaders( gl, "Swing_vertex-shader", "Swing_fragment-shader" );
	gl.useProgram(program_Swing);
	
	perspectiveProjectionMatrixLocation2 = gl.getUniformLocation(program_Swing, "P_persp");
	gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation2, false, perspectiveProjectionMatrix2);
	
	indexBuffer_Swing = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_Swing);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList_Swing), gl.STATIC_DRAW);
	
	verticesBuffer_Swing = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Swing);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices_Swing), gl.STATIC_DRAW);
	
	vertexPointer_Swing = gl.getAttribLocation(program_Swing, "vertexPosition");
	gl.vertexAttribPointer( vertexPointer_Swing, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vertexPointer_Swing);
		
	faceNormals_Swing = getFaceNormals( vertices_Swing, indexList_Swing, numTriangles_Swing);
	vertexNormals_Swing = getVertexNormals( vertices_Swing, indexList_Swing, faceNormals_Swing, numVertices_Swing, numTriangles_Swing);
	
	normalsBuffer_Swing = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_Swing);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals_Swing), gl.STATIC_DRAW);
	
	textureVertexbuffer_Swing = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureVertexbuffer_Swing);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoordinates_Swing), gl.STATIC_DRAW);
	
	textureCoordinate_Swing = gl.getAttribLocation(program_Swing, "textureCoordinate");
	gl.vertexAttribPointer(textureCoordinate_Swing, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureCoordinate_Swing);
	
	modelviewMatrixLocation2 = gl.getUniformLocation(program_Swing, "M");
	gl.uniformMatrix4fv(modelviewMatrixLocation2, false, modelviewMatrix);
	
	gl.useProgram(program_Swing );

	//coefficients for object
	var kaloc = gl.getUniformLocation(program_Swing, "ka");
	var kdloc = gl.getUniformLocation(program_Swing, "kd");
	ksloc = gl.getUniformLocation(program_Swing, "ks");
	gl.uniform3f(kaloc, 0.5, 0.5, 0.5);
	gl.uniform3f(kdloc, 0.5, 0.5, 0.5);
	gl.uniform3f(ksloc, 1.0, 1.0, 1.0);
	alphaloc = gl.getUniformLocation(program_Swing, "alpha");
	gl.uniform1f(alphaloc, 4.0);
	specularSwitch = 1;
	
	p0loc = gl.getUniformLocation(program_Swing, "p0");
	gl.uniform3f(p0loc, 0.0, 0.0, 45.0);
	
	//values for light components
	var Ia1loc = gl.getUniformLocation(program_Swing, "Ia1");
	var Id1loc = gl.getUniformLocation(program_Swing, "Id1");
	var Is1loc = gl.getUniformLocation(program_Swing, "Is1");
	gl.uniform3f(Ia1loc, 0.1, 0.1, 0.1);
	gl.uniform3f(Id1loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is1loc, 0.8, 0.8, 0.8);
	
	iDirloc = gl.getUniformLocation(program_Swing, "iDir");
	gl.uniform3f(iDirloc, 0.5, 0.7, 1);
	
	var Ia2loc = gl.getUniformLocation(program_Swing, "Ia2");
	var Id2loc = gl.getUniformLocation(program_Swing, "Id2");
	var Is2loc = gl.getUniformLocation(program_Swing, "Is2");
	gl.uniform3f(Ia2loc, 1.0, 1.0, 1.0);
	gl.uniform3f(Id2loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is2loc, 0.8, 0.8, 0.8);
	
	modelviewMatrixLocation2 = gl.getUniformLocation(program_Swing, "M");
	modelviewMatrixInverseTransposeLocation2 = gl.getUniformLocation(program_Swing, "M_inversetranspose");
	gl.uniformMatrix4fv(modelviewMatrixLocation2, false, modelviewMatrix);
	gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation2, false, modelviewMatrixInverseTranspose);
	
	vertexNormalPointer_Swing = gl.getAttribLocation(program_Swing, "nv");
	gl.vertexAttribPointer( vertexNormalPointer_Swing, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vertexNormalPointer_Swing );
	
	SwsUniform = gl.getUniformLocation(program_Swing, "Sws" );
	SwxUniform = gl.getUniformLocation(program_Swing, "Swx" );
	SwyUniform = gl.getUniformLocation(program_Swing, "Swy" );
	SwzUniform = gl.getUniformLocation(program_Swing, "Swz" );
	SwtUniform = gl.getUniformLocation(program_Swing, "Swt" );
	gl.uniformMatrix4fv( SwsUniform, false, flatten(Sws) );
	gl.uniformMatrix4fv( SwxUniform, false, flatten(Swx) );
	gl.uniformMatrix4fv( SwyUniform, false, flatten(Swy) );
	gl.uniformMatrix4fv( SwzUniform, false, flatten(Swz) );
	gl.uniformMatrix4fv( SwtUniform, false, flatten(Swt) );
	
	
	gl.bindTexture(gl.TEXTURE_2D, textureImageMetal);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, myImageMetal);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
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
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,  textureImageMetal);
	gl.uniform1i(gl.getUniformLocation(program_MGR, "texMap0"), 0);
	
	perspectiveProjectionMatrix1 = 
		[2.0*nearMG/(rightMG-leftMG), .0, .0, .0,
		 .0, 2.0*nearMG/(topMG-bottomMG), .0, .0,
		 (rightMG+leftMG)/(rightMG-leftMG), (topMG+bottomMG)/(topMG-bottomMG), -(farMG+nearMG)/(farMG-nearMG), -1.0,
		 .0, .0, -(2.0*farMG*nearMG)/(farMG-nearMG), .0];

	
	perspectiveProjectionMatrixLocation1 = gl.getUniformLocation(program_MGR, "P_persp");
	gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation1, false, perspectiveProjectionMatrix1);
	
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
	
	//var temp = 0
	//while(temp == 0)
	//	console.log("here");
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,  textureImage);
	gl.uniform1i(gl.getUniformLocation(program_PB, "texMap0"), 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_PB);
	gl.drawElements(gl.TRIANGLES, 3*numTriangles_PB, gl.UNSIGNED_SHORT, 0);
	
}

function drawTC(){
	//console.log("Here");
	gl.useProgram(program_TC);
	
	//bind buffers and set up pointer
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_TC);
	gl.enableVertexAttribArray(vertexPointer_TC);
	gl.vertexAttribPointer( vertexPointer_TC, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_TC);
	gl.enableVertexAttribArray( vertexNormalPointer_TC );
	gl.vertexAttribPointer( vertexNormalPointer_TC, 3, gl.FLOAT, false, 0, 0);
	
	//var temp = 0
	//while(temp == 0)
	//	console.log("here");
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,  textureImage);
	gl.uniform1i(gl.getUniformLocation(program_TC, "texMap0"), 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_TC);
	gl.drawElements(gl.TRIANGLES, 3*numTriangles_TC, gl.UNSIGNED_SHORT, 0);
	
}

function drawSwing(){
	//console.log("Here");
	gl.useProgram(program_Swing);
	
	//bind buffers and set up pointer
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer_Swing);
	gl.enableVertexAttribArray(vertexPointer_Swing);
	gl.vertexAttribPointer( vertexPointer_Swing, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_Swing);
	gl.enableVertexAttribArray( vertexNormalPointer_Swing );
	gl.vertexAttribPointer( vertexNormalPointer_Swing, 3, gl.FLOAT, false, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,  textureImageMetal);
	gl.uniform1i(gl.getUniformLocation(program_Swing, "texMap0"), 0);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_Swing);
	gl.drawElements(gl.TRIANGLES, 3*numTriangles_Swing, gl.UNSIGNED_SHORT, 0);
	
	
}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	drawMGR();
	drawPB();
	drawTC();
	drawSwing();
	requestAnimFrame(render);
}

 