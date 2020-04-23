var gl;
var numVertices;
var numTriangles;
var orthographicIsOn;
var myShaderProgram;
var alphaloc;
var ksloc;
var p0loc;
var iDirloc;
var light1Switch;
var light2Switch;
var specularSwitch;
var light1SwitchLocation;
var light2SwitchLocation;

function initGL(){
	var canvas = document.getElementById( "gl-canvas" );
	
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.enable(gl.DEPTH_TEST);
	gl.viewport( 0, 0, 512, 512 );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0);

	myShaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( myShaderProgram );
	
	numVertices = 7452; //really 48163
	numTriangles = 2484; //really 16054?
	//numVerticesPB = 9456;
	//numTrianglesPB = 3152;
	vertices = [];
	vertices = getVerticies();
	indexList = getFaces();
	//verticesPB = getPBVertices();
	//indexListPB = getPBFaces();
	
	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexList), gl.STATIC_DRAW);
	
	var verticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	var vertexPosition = gl.getAttribLocation(myShaderProgram, "vertexPosition");
	gl.vertexAttribPointer( vertexPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(vertexPosition);
		
	//Computer vertex normals. You will need to get normals for each face.
	var faceNormals = getFaceNormals( vertices, indexList, numTriangles);
	//the get normals for each vertex given normals for each face
	var vertexNormals = getVertexNormals( vertices, indexList, faceNormals, numVertices, numTriangles);
	
	//We have attrib called nv in CS. We must provide vertex normals fo each vertex in nv
	
	//Vreate buffer for the normals
	var normalsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexNormals), gl.STATIC_DRAW);
	var vertexNormalPointer = gl.getAttribLocation(myShaderProgram, "nv");
	gl.vertexAttribPointer( vertexNormalPointer, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vertexNormalPointer );
	
	//set up uniforms for viewing
	
	//modelview matrix
	var e = vec3(50.0, 20.0, 30.0); //eye
	var a = vec3(0.0, 0.0, 0.0); // at point
	var vup = vec3(0.0, 1.0, 0.0); //up vector
	var n = normalize( vec3(e[0]-a[0], e[1]-a[1], e[2]-a[2]));
	var u = normalize(cross(vup,n));
	var v = normalize(cross(n,u));
	var modelviewMatrix = [u[0], v[0], n[0], 0.0,
						   u[1], v[1], n[1], 0.0,
						   u[2], v[2], n[2], 0.0,
						   -u[0]*e[0]-u[1]*e[1]-u[2]*e[2],
						   -v[0]*e[0]-v[1]*e[1]-v[2]*e[2],
						   -n[0]*e[0]-n[1]*e[1]-n[2]*e[2], 1.0];
						   
	//modelview inverse transpose
	var modelviewMatrixInverseTranspose = [u[0], v[0], n[0], e[0],
							u[1], v[1], n[1], e[1],
							u[2], v[2], n[2], e[2],
							0.0, 0.0, 0.0, 1.0];
	var modelviewMatrixLocation = gl.getUniformLocation(myShaderProgram, "M");
	gl.uniformMatrix4fv(modelviewMatrixLocation, false, modelviewMatrix);
	var modelviewMatrixInverseTransposeLocation = gl.getUniformLocation(myShaderProgram, "M_inversetranspose");
	gl.uniformMatrix4fv(modelviewMatrixInverseTransposeLocation, false, modelviewMatrixInverseTranspose);
	
	//projection matrix
	var left = -7.0;
	var right = 7.0;
	var top_ = 7.0;
	var bottom = -7.0;
	var near = 50.0;
	var far = 100.0;
	
	//orthographic projection matrix
	var orthographicProjectionMatrix = 
		[2.0/(right-left), .0, .0, .0,
		 0, 2.0/(top_-bottom), .0, .0,
		 .0, .0, -2.0/(far-near), .0,
		 -(left+right)/(right-left), -(top_+bottom)/(top_-bottom), -(far+near)/(far-near), 1.0];
		 
	//perspective projection matrix
	var perspectiveProjectionMatrix = 
		[2.0*near/(right-left), .0, .0, .0,
		 .0, 2.0*near/(top_-bottom), .0, .0,
		 (right+left)/(right-left), (top_+bottom)/(top_-bottom), -(far+near)/(far-near), -1.0,
		 .0, .0, -2.0*far*near/(far-near), .0];
		 
	var orthographicProjectionMatrixLocation = gl.getUniformLocation(myShaderProgram, "P_orth");
	gl.uniformMatrix4fv(orthographicProjectionMatrixLocation, false, orthographicProjectionMatrix);
	var perspectiveProjectionMatrixLocation = gl.getUniformLocation(myShaderProgram, "P_persp");
	gl.uniformMatrix4fv(perspectiveProjectionMatrixLocation, false, perspectiveProjectionMatrix);
	
	orthographicIsOn = 1;
	orthographicIsOnLocation = gl.getUniformLocation(myShaderProgram, "orthIsOn");
	gl.uniform1f(orthographicIsOnLocation, orthographicIsOn);
	
	//coefficients for object
	var kaloc = gl.getUniformLocation(myShaderProgram, "ka");
	var kdloc = gl.getUniformLocation(myShaderProgram, "kd");
	ksloc = gl.getUniformLocation(myShaderProgram, "ks");
	gl.uniform3f(kaloc, 0.5, 0.5, 0.5);
	gl.uniform3f(kdloc, 0.5, 0.5, 0.5);
	gl.uniform3f(ksloc, 1.0, 1.0, 1.0);
	alphaloc = gl.getUniformLocation(myShaderProgram, "alpha");
	gl.uniform1f(alphaloc, 4.0);
	specularSwitch = 1;
	
	//First light source - point light
	//location
	p0loc = gl.getUniformLocation(myShaderProgram, "p0");
	gl.uniform3f(p0loc, 0.0, 0.0, 45.0);
	
	//values for light components
	var Ia1loc = gl.getUniformLocation(myShaderProgram, "Ia1");
	var Id1loc = gl.getUniformLocation(myShaderProgram, "Id1");
	var Is1loc = gl.getUniformLocation(myShaderProgram, "Is1");
	gl.uniform3f(Ia1loc, 0.1, 0.1, 0.1);
	gl.uniform3f(Id1loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is1loc, 0.8, 0.8, 0.8);
	light1Switch = 0;
	
	//Second light source - distant light
	//location
	iDirloc = gl.getUniformLocation(myShaderProgram, "iDir");
	gl.uniform3f(iDirloc, 0.5, 0.7, 1);
	
	//values for light components
	var Ia2loc = gl.getUniformLocation(myShaderProgram, "Ia2");
	var Id2loc = gl.getUniformLocation(myShaderProgram, "Id2");
	var Is2loc = gl.getUniformLocation(myShaderProgram, "Is2");
	gl.uniform3f(Ia2loc, 0.1, 0.1, 0.5);
	gl.uniform3f(Id2loc, 0.8, 0.8, 0.5);
	gl.uniform3f(Is2loc, 0.8, 0.8, 0.8);
	light2Switch = 0;

	//render the object
	drawObject();

};

function getFaceNormals( vertices, indexList, numTriangles){
	console.log("Getting face normals");
	console.log("Length of index list is " + indexList.length);
	console.log("Amount of triangles is " + numTriangles);
	var faceNormals = [];
	for(var i = 0; i < numTriangles; i++){
		
		
		console.log(vertices[indexList[3*i]][2]);
		
		var p0 = vec3(vertices[indexList[3*i]][0],
					  vertices[indexList[3*i]][1],
					  vertices[indexList[3*i]][2] );
		var p1 = vec3(vertices[indexList[3*i+1]][0],
					  vertices[indexList[3*i+1]][1],
					  vertices[indexList[3*i+1]][2] );
		var p2 = vec3(vertices[indexList[3*i+2]][0],
					  vertices[indexList[3*i+2]][1],
					  vertices[indexList[3*i+2]][2] );
		
		console.log(p0+"Last P0");
		
			  
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
			console.log(faceNormals[i][0]);
				vertexNormal[0] = vertexNormal[0] + faceNormals[i][0];
				vertexNormal[1] = vertexNormal[1] + faceNormals[i][1];
				vertexNormal[2] = vertexNormal[2] + faceNormals[i][2];			
			}
		}
		console.log(j);
		
		vertexNormal = normalize(vertexNormal);
		
	}
	return vertexNormals;	
};

function showOrthographic(){
	orthographicIsOn = 1;
	orthographicIsOnLocation = gl.getUniformLocation(myShaderProgram, "orthIsOn");
	gl.uniform1f(orthographicIsOnLocation, orthographicIsOn);
	console.log("orth");	
}

function showPerspective(){
	orthographicIsOn = 0;
	orthographicIsOnLocation = gl.getUniformLocation(myShaderProgram, "orthIsOn");
	gl.uniform1f(orthographicIsOnLocation, orthographicIsOn);
	console.log("persp");		
}

function switchLight1(){
	if(light1Switch == 1){
		light1Switch = 0;
		light1SwitchLocation = gl.getUniformLocation(myShaderProgram, "light1SwitchShader");
		gl.uniform1f(light1SwitchLocation, light1Switch);
	}else{
		light1Switch = 1;
		light1SwitchLocation = gl.getUniformLocation(myShaderProgram, "light1SwitchShader");
		gl.uniform1f(light1SwitchLocation, light1Switch);
	}
	console.log("Light1 switch = " + light1Switch)
}

function switchLight2(){
	if(light2Switch == 1){
		light2Switch = 0;
		light2SwitchLocation = gl.getUniformLocation(myShaderProgram, "light2SwitchShader");
		gl.uniform1f(light2SwitchLocation, light2Switch);
	}else{
		light2Switch = 1;
		light2SwitchLocation = gl.getUniformLocation(myShaderProgram, "light2SwitchShader");
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

function drawObject(){
	//console.log("rendering");
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawElements(gl.TRIANGLES, 3*numTriangles, gl.UNSIGNED_SHORT, 0);
	requestAnimFrame(drawObject);
}