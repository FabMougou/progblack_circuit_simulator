////========================VARIABLE DECLERATIONS========================
let canvas = document.getElementById('circuitCanvas');
let context = canvas.getContext('2d');

let canvas_width;
let canvas_height;
let padding_x;
let padding_y;
let shapes = [];
let current_shape_index = null;
let is_dragging = false;


//Test shapes
shapes.push( {x: 1000, y: 300, width: 350, height: 350, color: 'yellow'} );
shapes.push( {x: 110, y: 50, width: 100, height: 100, color: 'red'} );
shapes.push( {x: 0, y: 0, width: 50, height: 100, color: 'blue'} );

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
function is_mouse_in_shape(x, y, shape){
    let shape_left = shape.x;
    let shape_right = shape.x + shape.width;
    let shape_top = shape.y;
    let shape_bottom = shape.y + shape.height;

    //if the mouse is within all of the boundaries of the shape, return true
    if (x >= shape_left && x <= shape_right && y >= shape_top && y <= shape_bottom){
        return true;
    }
    return false;
}

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

//========================EVENT LISTENERS========================
//Listeners for mouse actions on the canvas
canvas.onmousedown = mouse_down; 
canvas.onmouseup = mouse_up;
canvas.onmouseout = mouse_out;
canvas.onmousemove = mouse_move;

//Listeners for window resize to alter canvas boundaries and padding
window.addEventListener('resize', responsive_canvas);
window.addEventListener('resize', get_padding);
window.addEventListener('scroll', get_padding);
canvas.addEventListener('resize', get_padding);

//========================INITIAL CALL FUNCTIONS========================
responsive_canvas();
get_padding();
