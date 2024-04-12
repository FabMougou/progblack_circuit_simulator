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
let rackX = 100;
let rackY = 100;


let current_shape_index = null;
let is_dragging = false;


//===========================P5.JS==============================
function setup() {
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
    addNode(new BULB());
    addNode(new SWITCH());
    addNode(new SWITCH());
    addNode(new XOR());
    addNode(new JUNCTION());
    addNode(new JUNCTION());

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
        if (is_mouse_in_shape(nearest.x + outputBox.x, nearest.y + outputBox.y, 12, 12)) {
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
                if (nearest.type != types.junction){
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
    console.log(nearest, nearest.inputNodes)
    moving = null;

    if (lining?.type == 'output') {

        for (let i = 0; i < nearest.inputPositions.length; i++) {
            if (nearest.inputNodes[i] != null) continue;
            let inputBox = nearest.inputPositions[i];

            if (is_mouse_in_shape(nearest.x + inputBox.x, nearest.y + inputBox.y, 12, 12)) {

                if (lining.node.type == types.junction) {

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

    else if (lining?.type == 'input') {

        for (let i = 0; i < nearest.outputPositions.length; i++) {
            let outputBox = nearest.outputPositions[i];

            if (is_mouse_in_shape(nearest.x + outputBox.x, nearest.y + outputBox.y, 12, 12)) {

                if (nearest.type == types.junction) {
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
    let bg = createGraphics(3000, 3000);
    bg.background('#fff')
    bg.stroke('#888')
    size = 50;
    for (let j = 0; j < 3000; j += size) bg.line(0, j, 3000, j);
    for (let i = 0; i < 3000; i += size) bg.line(i, 0, i, 3000);

  
    return bg;
}

function windowResized(){
    
    resizeCanvas(windowWidth, windowHeight);
    image(bg, 0, 0);

}

