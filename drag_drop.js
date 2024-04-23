////========================VARIABLE DECLERATIONS========================
let padding_x;
let padding_y;
let canvas_height;
let canvas_width

let offset = {x: 0, y: 0};
let lining;
let moving;
let rack = [];
let nodes = [];
let bg;
let rackX = 100;
let rackY = 125;
let nearest = null;


let current_shape_index = null;
let is_dragging = false;


function setup() {
    canvas_width = windowWidth - 6;
    canvas_height = windowHeight - 6;

    createCanvas(canvas_width, canvas_height);
    background(500);

    bg = createBG();
    image(bg, 0, 0);

    for (let node of nodes) {
        node.show();
    }



}

function draw() {
    set_nearest();
}

function set_nearest() {
    if (!nodes) return;
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
    if (!nearest) return;

    
    if (is_mouse_in_shape(nearest.x, nearest.y, nearest.width, nearest.height)) {
        nearest.onclick?.(); 
        moving = nearest;
        offset = {x: nearest.x - mouseX,
                  y: nearest.y - mouseY};


    }

    //For each input box
    for (let i = 0; i < nearest.inputPositions.length; i++) {
        let inputBox = nearest.inputPositions[i];
        if (is_mouse_in_shape(nearest.x + inputBox.x, nearest.y + inputBox.y, 20, 20)) {
            if (nearest.inputNodes[i] == null) {
                lining = { 
                    node: nearest,
                    index: i, 
                    type: 'input', 
                    x: nearest.x + inputBox.x, 
                    y: nearest.y + inputBox.y };
                moving = null;
            } else {
                //Disconnects line on click if there already is one
                outputIndex = nearest.inputNodes[i].index;

                nearest.inputNodes[i].node.outputNodes[outputIndex] = null;
                nearest.inputNodes[i] = null;
                nearest.inputValues[i] = 0;
            
            }
        }
    }

    //For each output box
    for (let i = 0; i < nearest.outputPositions.length; i++) {
        let outputBox = nearest.outputPositions[i];
        //Checks if connection box is clicked
        if (is_mouse_in_shape(nearest.x + outputBox.x, nearest.y + outputBox.y, 12, 12)) {
            //If there is no connection yet, starts drawing line
            if (nearest.outputNodes[i] == null) {
                lining = { 
                    node: nearest,
                    index: i, 
                    type: 'output', 
                    x: nearest.x + outputBox.x, 
                    y: nearest.y + outputBox.y };

                moving = null;

            } else {
                //Disconnects line on click if there already is one
                if (nearest.type != types.splitter){
                    inputIndex = nearest.outputNodes[i].index;
                    
                    nearest.outputNodes[i].node.inputValues[inputIndex] = 0;
                    nearest.outputNodes[i].node.inputNodes[i] = null;
                    nearest.outputNodes[i] = null;


                }
            }
        }
    }
}

function mouseReleased() {
    set_nearest();
    moving = null;

    //If line is coming from an output connection box
    if (lining?.type == 'output') {
        for (let i = 0; i < nearest.inputPositions.length; i++) {
            //Checks if input box already has another connection
            if (nearest.inputNodes[i] != null) continue;
            let inputBox = nearest.inputPositions[i];

            //If mouse is in input box, connects the two nodes
            if (is_mouse_in_shape(nearest.x + inputBox.x, nearest.y + inputBox.y, 12, 12)) {

                if (lining.node.type == types.splitter) {

                    lining.node.outputPositions.push(lining.node.outputPositions[0]);
                    lining.node.outputNodes.push({ node: nearest, index: i });
                    nearest.inputNodes[i] = {node: lining.node, index: lining.index};
                }

                else{
                    lining.node.outputNodes[lining.index] = {node: nearest, index: i};
                    nearest.inputNodes[i] = {node: lining.node, index: lining.index};
                }


            }
        }
    }
    //If line is coming from an input connection box
    else if (lining?.type == 'input') {
        
        for (let i = 0; i < nearest.outputPositions.length; i++) {

            if (nearest.outputNodes[i] != null) continue;
            let outputBox = nearest.outputPositions[i];

            if (is_mouse_in_shape(nearest.x + outputBox.x, nearest.y + outputBox.y, 12, 12)) {

                if (nearest.type == types.splitter) {
                    nearest.outputPositions.push(nearest.outputPositions[0]);
                    nearest.outputNodes.push({ node: lining.node, index: lining.index });
                    lining.node.inputNodes[lining.index] = {node: nearest, index: i};
                    break

                } else {    
                    nearest.outputNodes[i] = {node: lining.node, index: lining.index};
                }

                lining.node.inputNodes[lining.index] = {node: nearest, index: i};
            }
        }
    }
    lining = null;
    image(bg, 0, 0);
    
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

function is_mouse_in_shape(shapeX, shapeY, shapeWidth, shapeHeight){
    if (mouseX < shapeX - (shapeWidth/2) || //Left
        mouseX > shapeX + (shapeWidth/2) || //Right
        mouseY < shapeY - (shapeHeight/2) || //Top
        mouseY > shapeY + (shapeHeight/2)){ //Bottom
        
        return false
    } 
    else {
        return true
    }
}

function addNode(node){

    if (rack.length > 0){
        rackX = (rack[rack.length-1].x) + (rack[rack.length-1].width / 2) + 100;
 
        if (rack.length % 5 == 0){
            rackX = 100;
            rackY += 100;
        }
    }

    node.x = rackX;
    node.y = rackY;

    rack.push(node);
    nodes.push(node);
}


function createBG(){
    let bg = createGraphics(7500, 7500);
    bg.background('#fff')
    bg.stroke('#888')
    size = 50;
    for (let j = 0; j < 7500; j += size) bg.line(0, j, 7500, j);
    for (let i = 0; i < 7500; i += size) bg.line(i, 0, i, 7500);

  
    return bg;
}

function windowResized(){
    if (windowHeight > canvas_height){
        canvas_height = windowHeight - 6;
    }

    if (windowWidth > canvas_width){
        canvas_width = windowWidth - 6;
    }

    resizeCanvas(canvas_width, canvas_height);
    image(bg, 0, 0);

}

function changeSize(){
    heightInput = document.getElementById('height-input');
    widthInput = document.getElementById('width-input');

    let height = parseInt(heightInput.value);
    let width = parseInt(widthInput.value);

    heightInput.value = '';
    widthInput.value = '';



    if (isNaN(height) || isNaN(width)){
        alert('Please enter a number');
        return;
    } else {

        if (height > 7500 || width > 7500){
            alert('Please enter a number less than 7500');
            return;
        } else {
            resizeCanvas(width, height);
            image(bg, 0, 0);


        }
    
    }

}




