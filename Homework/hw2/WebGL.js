var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_modelMatrix;
        void main(){
            gl_Position = u_modelMatrix * a_Position;
            v_Color = a_Color;
        }    
    `;

var FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
    `;

function createProgram(gl, vertexShader, fragmentShader){
    //create the program and attach the shaders
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //if success, return the program. if not, log the program info, and delete it.
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        return program;
    }
    alert(gl.getProgramInfoLog(program) + "");
    gl.deleteProgram(program);
}

function compileShader(gl, vShaderText, fShaderText){
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText)
    gl.shaderSource(fragmentShader, fShaderText)
    //compile vertex shader
    gl.compileShader(vertexShader)
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('vertex shader ereror');
        var message = gl.getShaderInfoLog(vertexShader); 
        console.log(message);//print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader)
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('fragment shader ereror');
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message);//print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

function initArrayBuffer( gl, data, num, type, attribute){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create the buffere object");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), attribute);

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

var transformMat = new Matrix4();
var matStack = [];
var u_modelMatrix;
function pushMatrix(){
    matStack.push(new Matrix4(transformMat));
}
function popMatrix(){
    transformMat = matStack.pop();
}
//variables for tx, red,green and yellow arms angle 
var tx = 0;
var ty = 0;
var Angle1 = 0;
var Angle2 = 0;
var Angle3 = 0;
var robotSize = 1;

function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    redraw(gl); //call redarw here to show the initial image

    //setup the call back function of tx Sliders
    var txSlider = document.getElementById("Translate-X");
    txSlider.oninput = function() {
        tx = this.value / 100.0; //convert sliders value to -1 to +1
        redraw(gl);
    }

    var tySlider = document.getElementById("Translate-Y");
    tySlider.oninput = function() {
        ty = this.value / 100.0;
        redraw(gl);
    }

    //setup the call back function of red arm rotation Sliders
    var joint1Slider = document.getElementById("jointFor1");
    joint1Slider.oninput = function() {
        Angle1 = this.value * -1;
        redraw(gl);
    }

    //setup the call back function of green arm rotation Sliders
    var joint2Slider = document.getElementById("jointFor2");
    joint2Slider.oninput = function() {
        Angle2 = this.value * -1; //convert sliders value to 0 to 45 degrees
        redraw(gl);
    }

    //setup the call back function of yellow arm rotation Sliders
    var joint3Slider = document.getElementById("jointFor3");
    joint3Slider.oninput = function() {
        Angle3 = this.value *  -1; //convert sliders value to 0 to -45 degrees
        redraw(gl);
    }

    var robotSizeSlider = document.getElementById("sizeForRobot");
    robotSizeSlider.oninput = function() {
        robotSize = this.value ;
        redraw(gl);
    }

}

//Call this funtion when we have to update the screen (eg. user input happens)
function redraw(gl)
{
    console.log(tx+" \n"+ty+" \n"+Angle1+" \n"+Angle2+" \n"+Angle3+" \n"+robotSize);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    u_modelMatrix = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'u_modelMatrix');
    

    triVertices = [0.0, 0.4, 0.3, -0.5, -0.3, -0.5];
    var triRedColor = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 ];
    var triGreenColor = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0 ];
    var triBlueColor = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];
    rectVertices = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5];
    var rectRedColor = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 ];
    var rectGreenColor = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0 ];
    var rectBlueColor = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];
    cirVertices = [0.0, 0.0]
    var cirRedColor = [1.0, 0.0, 0.0 ];
    var cirGreenColor = [0.0, 1.0, 0.0];
    var cirBlueColor = [0.0, 0.0, 1.0];
    var r = 0.1
    for(var i = 0 ; i <= 100 ; i ++){
        var theta = i * 2 * Math.PI / 100;
        var x = r * Math.sin(theta);
        var y = r * Math.cos(theta);
        cirVertices.push(x, y);
        cirRedColor.push(1.0, 0.0, 0.0);
        cirGreenColor.push(0.0, 1.0, 0.0);
        cirBlueColor.push(0.0, 0.0, 1.0);
    } 

    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(rectBlueColor), 3, gl.FLOAT, 'a_Color');

    transformMat.setIdentity();
    //TODO-1: translate whole robot here
    transformMat.translate(0.0, -0.5, 0.0);
    transformMat.translate(tx, ty, 0.0);
    transformMat.scale(robotSize, robotSize, robotSize);
    pushMatrix();
    transformMat.scale(0.4, 0.2, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);

    transformMat.translate(-0.2, 0.85, 0.0);
    transformMat.scale(0.5, 0.7, 0.0)
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(rectGreenColor), 3, gl.FLOAT, 'a_Color');
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);


    popMatrix();
    pushMatrix();
    buffer0 = initArrayBuffer(gl, new Float32Array(cirVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(cirRedColor), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(-0.2, -0.1, 0.0) ;
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, cirVertices.length/2);
    transformMat.translate(0.4, 0.0, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, cirVertices.length/2);
    popMatrix();

    transformMat.translate(0.15, 0.1, 0.0);
    
    pushMatrix();
    transformMat.scale(0.3, 0.3, 0.0);
    buffer0 = initArrayBuffer(gl, new Float32Array(cirVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(cirRedColor), 3, gl.FLOAT, 'a_Color');
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, cirVertices.length/2);
    popMatrix();

    transformMat.rotate(Angle1, 0.0, 0.0, 1.0);

    pushMatrix();
    transformMat.translate(0.0, 0.13, 0.0);
    transformMat.scale(0.05, 0.2, 0.0);
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(rectGreenColor), 3, gl.FLOAT, 'a_Color');
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();

    transformMat.translate(0.0, 0.26, 0.0);
    
    pushMatrix();
    transformMat.scale(0.3, 0.3, 0.0);
    buffer0 = initArrayBuffer(gl, new Float32Array(cirVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(cirRedColor), 3, gl.FLOAT, 'a_Color');
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, cirVertices.length/2);
    popMatrix();

    transformMat.rotate(Angle2, 0.0, 0.0, 1.0);

    pushMatrix();
    transformMat.translate(0.0, 0.13, 0.0);
    transformMat.scale(0.05, 0.2, 0.0);
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(rectGreenColor), 3, gl.FLOAT, 'a_Color');
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();

    transformMat.translate(0.0, 0.26, 0.0);
    
    pushMatrix();
    transformMat.scale(0.3, 0.3, 0.0);
    buffer0 = initArrayBuffer(gl, new Float32Array(cirVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(cirRedColor), 3, gl.FLOAT, 'a_Color');
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, cirVertices.length/2);
    popMatrix();

    transformMat.rotate(Angle3, 0.0, 0.0, 1.0);

    pushMatrix();
    transformMat.translate(0.15, 0.08, 0.0);
    //transformMat.rotate(-45, 0.0, 0.0, 1.0);
    transformMat.scale(0.5, 0.1, 0.0);
    buffer0 = initArrayBuffer(gl, new Float32Array(triVertices), 2, gl.FLOAT, 'a_Position');
    buffer1 = initArrayBuffer(gl, new Float32Array(triGreenColor), 3, gl.FLOAT, 'a_Color');
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, triVertices.length/2);
    popMatrix();
    

    // popMatrix();
    // buffer1 = initArrayBuffer(gl, new Float32Array(redColor), 3, gl.FLOAT, 'a_Color');
    // //TODO-2: make the red arm rotate
    // transformMat.translate(0.0, 0.2, 0.0);
    // transformMat.rotate(redAngle, 0.0, 0.0, 1.0);
    // transformMat.translate(0.0, 0.5, 0.0);
    // pushMatrix();
    // transformMat.scale(0.2, 1.2, 0.0);
    // gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the red one

    // popMatrix();
    // buffer1 = initArrayBuffer(gl, new Float32Array(greenColor), 3, gl.FLOAT, 'a_Color');
    // //TODO-3: you may add some functions here 
    // //        and modify translate() in next line to rotate the green bar
    // transformMat.translate(0.0, 0.5, 0.0);
    // transformMat.rotate(greenAngle, 0.0, 0.0, 1.0);
    // transformMat.translate(0.2, 0.0, 0.0);
    // pushMatrix(); //for one more yellow
    // transformMat.scale(0.6, 0.15, 0.0);
    // gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the green one

    // //TODO-4: add code here to draw and rotate the yelloe block
    // popMatrix();
    // buffer1 = initArrayBuffer(gl, new Float32Array(yellowColor), 3, gl.FLOAT, 'a_Color');
    // transformMat.translate(0.24, 0.075, 0.0);
    // transformMat.rotate(yellowAngle, 0.0, 0.0, 1.0);
    // transformMat.translate(0.0, -0.25, 0.0);
    // pushMatrix();
    // transformMat.scale(0.12, 0.5, 0.0);
    // gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);//draw the yellow one



}
