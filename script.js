let canvas = document.getElementById('circuitBoard');
let context = canvas.getContext('2d');

let canvas_width;
let canvas_height;
let padding_x;
let padding_y;

function responsiveCanvas(){
    console.log("resizing cancas")
    canvas.width = window.innerWidth-10;
    canvas.height = window.innerHeight-10;

    canvas_width = canvas.width;
    canvas_height = canvas.height;
    if (shape.x < 0){
        shape.x = 0;
    }
}

function get_padding(){
    let canvas_padding = canvas.getBoundingClientRect();
    padding_x = canvas_padding.left;
    padding_y = canvas_padding.top;
}

responsiveCanvas();
get_padding();

window.addEventListener('resize', responsiveCanvas);
window.addEventListener('resize', get_padding);
window.addEventListener('scroll', get_padding);
canvas.addEventListener('resize', get_padding);

let shapes = [];
let current_shape_index = null;
let is_dragging = false;
shapes.push( {x: 110, y: 50, width: 100, height: 100, color: 'red'} );
shapes.push( {x: 0, y: 0, width: 50, height: 100, color: 'blue'} );

function draw_shapes(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let shape of shapes){
        check_boundary(shape);
        context.fillStyle = shape.color;
        context.fillRect(shape.x, shape.y, shape.width, shape.height);
    }
}

function check_boundary(shape){
    if (shape.x < 0){
        shape.x = 0;
    }
    if (shape.y < 0){
        shape.y = 0;
    }
    if (shape.x + shape.width > canvas_width){
        shape.x = canvas_width - shape.width;
    }
    if (shape.y + shape.height > canvas_height){
        shape.y = canvas_height - shape.height;
    }
}

function is_mouse_in_shape(x, y, shape){
    let shape_left = shape.x;
    let shape_right = shape.x + shape.width;
    let shape_top = shape.y;
    let shape_bottom = shape.y + shape.height;

    if (x >= shape_left && x <= shape_right && y >= shape_top && y <= shape_bottom){
        return true;
    }

    return false;
}

function mouse_down(event){
    event.preventDefault();
    
    let startX = parseInt(event.clientX);
    let startY = parseInt(event.clientY);
    console.log("mouse:", startX, startY);

    let index = 0;
    for (let shape of shapes){

        if (is_mouse_in_shape(startX, startY, shape)){
            console.log("shape:" , shape.x, shape.y);
            offsetX = startX - shape.x;
            offsetY = startY - shape.y;
            current_shape_index = index;
            is_dragging = true;
            return;

        }
        index++;
    }
}

function mouse_up(event){
    if (!is_dragging){
        return
    }
    event.preventDefault();
    is_dragging = false;    
}

function mouse_out(event){
    if (!is_dragging){
        return
    }
    event.preventDefault();
    is_dragging = false;    
}

function mouse_move(event){
    if (!is_dragging){
        return
    }
    event.preventDefault();

    let currentX = parseInt(event.clientX);
    let currentY = parseInt(event.clientY);
    let shape = shapes[current_shape_index];


    shape.x = currentX - offsetX;
    shape.y = currentY - offsetY;
    draw_shapes();

}



draw_shapes();
canvas.onmousedown = mouse_down;
canvas.onmouseup = mouse_up;
canvas.onmouseout = mouse_out;
canvas.onmousemove = mouse_move;
