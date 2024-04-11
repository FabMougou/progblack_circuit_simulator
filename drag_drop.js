////========================VARIABLE DECLERATIONS========================
//let canvas = document.getElementById('circuitCanvas');
//let context = canvas.getContext('2d');

let canvas_width;
let canvas_height;
let padding_x;
let padding_y;

let offset = {x: 0, y: 0};
let lining;
let moving;
let rack = [];
let nodes = [];
let bg;


let current_shape_index = null;
let is_dragging = false;


//===========================P5.JS==============================
function setup() {
    console.log(windowWidth, windowHeight)
    createCanvas(windowWidth, windowHeight);
    background(500);

    bg = createBG();
    image(bg, 0, 0);

    addNode(new AND());
    addNode(new AND());
    addNode(new AND());
    addNode(new AND());
    addNode(new OR());
    addNode(new BULB());
    addNode(new SWITCH());

    for (let node of nodes) {
        node.show();
    }



}

function draw() {
    set_nearest();

}

function set_nearest() {
    let minDistance = 10000000;
    for (let node of nodes) {
        let distance = dist(mouseX, mouseY, node.x, node.y);

        if (distance < minDistance) {
            minDistance = distance;
            nearest = node;
        }
        node.show();
        node.operate();
    }
}

function mousePressed() {
    set_nearest();
    console.log(nearest)
    if (!nearest) return;

    if (is_mouse_in_shape(nearest.x, nearest.y, nearest.width, nearest.height)) {
        nearest.onclick?.(); 
        moving = nearest;
        offset = {x: nearest.x - mouseX,
                  y: nearest.y - mouseY};

    }

    for (let i = 0; i < nearest.inputPositions.length; i++) {
        let inputBox = nearest.inputPositions[i];
        if (is_mouse_in_shape(nearest.x + inputBox.x, nearest.y + inputBox.y, 20, 20)) {
            lining = { 
                node: nearest,
                index: i, 
                type: 'input', 
                x: nearest.x + inputBox.x, 
                y: nearest.y + inputBox.y };

            moving = null;
        }
    }

    for (let i = 0; i < nearest.outputPositions.length; i++) {
        let outputBox = nearest.outputPositions[i];
        if (is_mouse_in_shape(nearest.x + outputBox.x, nearest.y + outputBox.y, 12, 12)) {
            if (nearest.outputNodes[i] == null) {
                lining = { 
                    node: nearest,
                    index: i, 
                    type: 'output', 
                    x: nearest.x + outputBox.x, 
                    y: nearest.y + outputBox.y };

                moving = null;
            }
        }
    }
}

let line_end;
function mouseDragged() {
    image(bg, 0, 0);
    line_end = {x: mouseX, y: mouseY};

    if (moving){
        if (rack.includes(moving)){
         rack.splice(rack.indexOf(moving), 1)
        }
        moving.move(mouseX + offset.x, mouseY + offset.y);

    } else if (lining) {
        line(lining.x, lining.y, line_end.x, line_end.y);
    }
}

function mouseReleased() {
    moving = null;
    if (lining?.type == 'output') {
        for (let i = 0; i < nearest.inputPositions.length; i++) {
            let inputBox = nearest.inputPositions[i];
            if (is_mouse_in_shape(nearest.x + inputBox.x, nearest.y + inputBox.y, 12, 12)) {
                lining.node.outputNodes[lining.index] = {node: nearest, index: i};
            }
        }
    }

    else if (lining?.type == 'input') {
        for (let i = 0; i < nearest.outputPositions.length; i++) {
            let outputBox = nearest.outputPositions[i];
            if (is_mouse_in_shape(nearest.x + outputBox.x, nearest.y + outputBox.y, 12, 12)) {
                nearest.outputNodes[i] = {node: lining.node, index: lining.index};
            }
        }
    }
    lining = null;
    image(bg, 0, 0);
    
}

function is_mouse_in_shape(shapeX, shapeY, shapeHeight, shapeWidth){

    if (mouseX < shapeX - shapeWidth/2 || //Left
        mouseX > shapeX + shapeWidth/2 || //Right
        mouseY < shapeY - shapeHeight/2 || //Top
        mouseY > shapeY + shapeHeight/2){ //Bottom

        return false
    } 
    else {
        return true
    }
}

function addNode(node){
    let x = 100, y = 100;

    if (rack.length > 0){
        x = (rack[rack.length-1].x) + (rack[rack.length-1].width / 2) + 75;

        if (rack.length == 5){
            x = 100;
            y += 100;
        }
    }

    node.x = x;
    node.y = y;

    rack.push(node);
    nodes.push(node);
}


function createBG(){
    console.log("YAYAAA")
    let bg = createGraphics(3000, 3000);
    bg.background('#fff')
    bg.stroke('#888')
    size = 50;
    for (let j = 0; j < 3000; j += size) bg.line(0, j, 3000, j);
    for (let i = 0; i < 3000; i += size) bg.line(i, 0, i, 3000);

  
    return bg;
}

function windowResized(){
    
    console.log("test")
    console.log(windowWidth, windowHeight)
    resizeCanvas(windowWidth, windowHeight);
    image(bg, 0, 0);

}

window.addEventListener('resize', windowResized);







//========================CANVAS FUNCTIONS========================
//Function to make the canvas responsive to the window size
function responsive_canvas(){
    canvas.width = window.innerWidth-10;
    canvas.height = window.innerHeight-10;

    canvas_width = canvas.width;
    canvas_height = canvas.height;
    //Redraws shapes as they get deleted when the canvas resizes
    draw_shapes();
}

function get_padding(){ //Not used for anything yet but may be useful in the future
    let canvas_padding = canvas.getBoundingClientRect();
    padding_x = canvas_padding.left; //Gets the length between left size of the screen and the left side of the canvas
    padding_y = canvas_padding.top; //Gets the length between the top of the screen and the top of the canvas
}

function draw_shapes(){
    context.clearRect(0, 0, canvas.width, canvas.height); //Clears the canvas before redrawing the shapes

    //For each shape, check if it is within the canvas boundaries and then draw it
    //Will be altered to be for each node in the future
    for (let shape of shapes){
        check_boundary(shape);
        context.fillStyle = shape.color;
        context.fillRect(shape.x, shape.y, shape.width, shape.height);
    }
}

//Function to keep the shapes within the canvas boundaries
//x=0, left side of the screen
//y=0, top of the screen

function check_boundary(shape){
    //Left boundary
    if (shape.x < 0){ 
        shape.x = 0;
    }
    //Right boundary
    if (shape.x + shape.width > canvas_width){
        shape.x = canvas_width - shape.width;
    }
    //Top boundary
    if (shape.y < 0){
        shape.y = 0;
    }
    //Bottom boundary
    if (shape.y + shape.height > canvas_height){
        shape.y = canvas_height - shape.height;
    }
}

//========================MOUSE FUNCTIONS========================

//Checks if the mouse is over the shape passed into the function


//When the mouse is clicked, check if it is over a shape and if so, set the shape to be dragged
function mouse_down(event){
    event.preventDefault();
    
    //Gets x and y coordinates of mouse at the time of click
    let startX = parseInt(event.clientX), startY = parseInt(event.clientY);   

    let index = 0;
    //For each shape, check if the mouse is over it and if so, set it to be dragged
    for (let shape of shapes){
        if (is_mouse_in_shape(startX, startY, shape)){
            //Declares the offset of the mouse from the top left corner of the shape
            //Used to keep the shape in the same position relative to the mouse when being dragged
            offsetX = startX - shape.x;
            offsetY = startY - shape.y;

            current_shape_index = index;
            is_dragging = true;
            return;
        }
        index++;
    }
}

//Sets the shape to not be dragged when the mouse is released
function mouse_up(event){
    event.preventDefault();
    if (!is_dragging){
        return
    }
    is_dragging = false;    
}

//Sets the shape to not be dragged when the mouse leaves the screen
function mouse_out(event){
    event.preventDefault();
    if (!is_dragging){
        return
    }
    is_dragging = false;    
}

//If a shape is being dragged, move the shape to the mouse's position
function mouse_move(event){
    event.preventDefault();
    if (!is_dragging){
        return
    }

    //Gets the x and y coordinates of the mouse at the time of the event
    let currentX= parseInt(event.clientX), currentY = parseInt(event.clientY);

    let shape = shapes[current_shape_index];
    //Sets the x and y coordinates of the shape to move with the mouse, relative to where the shape was originally clicked
    shape.x = currentX - offsetX;
    shape.y = currentY - offsetY;
    //Redraws shape in new position
    draw_shapes();
}



// //========================EVENT LISTENERS========================
// //Listeners for mouse actions on the canvas
// canvas.onmousedown = mouse_down; 
// canvas.onmouseup = mouse_up;
// canvas.onmouseout = mouse_out;
// canvas.onmousemove = mouse_move;

// //Listeners for window resize to alter canvas boundaries and padding
// window.addEventListener('resize', responsive_canvas);
// window.addEventListener('resize', get_padding);
// window.addEventListener('scroll', get_padding);
// canvas.addEventListener('resize', get_padding);

// //========================INITIAL CALL FUNCTIONS========================
// responsive_canvas();
// get_padding();
