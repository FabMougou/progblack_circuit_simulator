let types = {
    switch: 'SWITCH',
    bulb: 'BULB',
    and: 'AND',
    or: 'OR',
    not: 'NOT',
    xor: 'XOR',
    splitter: 'SPLITTER',
    nand: 'NAND',
}

let operations = {
    SWITCH: '',
    BULB: 'a',
    AND: '(a & b)',
    OR: '(a | b)',
    NOT: '(!a)',
    XOR: '(a ^ b)',
    SPLITTER: 'a',
    NAND: '!(a & b)',
}


let id = 0;

class Node{
    constructor(type, input, output, x = 100, y = 100){
        this.id = Date.now() + id++;
        this.type = type;
        this.input = input;
        this.output = output;
        this.x = x; 
        this.y = y;
        this.height = (Math.max(this.input, this.output) * 15) + 50;
        this.width = (this.type.length * 10) + 75; //Width is the length of the type string times 10 (so it fits name in it)

        this.inputNodes = new Array(input).fill(null);
        this.outputNodes = new Array(output).fill(null);
        this.inputValues = new Array(input).fill(0);

        this.inputPositions = evenlySpreadPoints(-this.width/2, -this.height/2, this.height/2, this.input);
        this.outputPositions = evenlySpreadPoints(this.width/2, -this.height/2, this.height/2, this.output);

    }
    move(x, y){
        this.x = x;
        this.y = y;
    }
    setInput(value, index){
        this.inputValues[index] = value;
    }

    show(col){
        fill(col ?? '#777');
        rectMode(CENTER);
        rect(this.x, this.y, this.width, this.height);

       
        fill('#fff');
        textAlign(CENTER, CENTER);
        text(this.type.replace("_", "\n"), this.x, this.y);

    
        for (let outputBox of this.outputPositions) {
            rect(this.x + outputBox.x, this.y + outputBox.y, 12, 12);
        }


        for (let inputBox of this.inputPositions) {
            rect(this.x+ inputBox.x, this.y + inputBox.y, 12, 12);
        }

        if(this.outputNodes){
            for (let i = 0; i < this.outputNodes.length; i++) {
                let out = this.outputNodes[i];
                if(!out || !out.node) continue;
                line(this.x+this.outputPositions[0].x, this.y+this.outputPositions[0].y, out.node.x+out.node.inputPositions[out.index].x, out.node.y+out.node.inputPositions[out.index].y);
            }
        }

    }
}
    
class SWITCH extends Node{
    constructor(x, y){
        super(types.switch, 0, 1, x, y);
        this.state = false;
    }
    operate(){
        this.outputNodes[0]?.node.setInput(this.state? 1:0, this.outputNodes[0].index)
    }
    onclick(){
        this.state = !this.state;
    }
    show(){
        super.show(this.state? '#B00' : '#777');
    }
}

class BULB extends Node{
    constructor(x, y){
        super(types.bulb, 1, 0, x, y);
        this.state = false;
    }
    operate(){
        this.state = Boolean(this.inputValues[0])
    }
    show(){
        super.show(this.state? '#B00' : '#777');
    }
}
class AND extends Node{
    constructor(x, y){
        super(types.and, 2, 1, x, y);
    }
    operate(){
        let a = this.inputValues[0], b = this.inputValues[1];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]))
    }
}
class OR extends Node{
    constructor(x, y) {
        super(types.or, 2, 1, x, y);
    }
    operate(){
        let a = this.inputValues[0], b = this.inputValues[1];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]))
    }
}

class XOR extends Node{
    constructor(x, y){
        super(types.xor, 2, 1, x, y);
    }

    operate(){
        let a = this.inputValues[0], b = this.inputValues[1];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]))
    }
}

class NOT extends Node{
    constructor(x, y) {
        super(types.not, 1, 1, x, y);
    }
    operate(){
        let a = this.inputValues[0];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]))
    }
}

class SPLITTER extends Node{
    constructor(x, y){
        super(types.splitter, 1, 1, x, y)
        this.outputNodes = [];

    }
    operate(){
        for (let node of this.outputNodes){
            let a = this.inputValues[0];
            propagateOutput(node, this.inputValues[0]);
        }
    }
}

class NAND extends Node{
    constructor(x, y){
        super(types.nand, 2, 1, x, y)
    }
    operate(){
        
        let a = this.inputValues[0];
        let b = this.inputValues[1];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]))
        
    }
}

function evenlySpreadPoints(x, y1, y2, n){

    //Difference between y of two I/O points
    let dty = abs(y1 - y2) / n;
    let points = [];

    for(let i = 1; i <= n; i++){
        let obj = {
            x: x,
            y: y1 + (i * dty) - (dty / 2),
        }
        points.push(obj);
    }

    return points;
}

function propagateOutput(outputNode, value){
    if (!outputNode) return;
    outputNode.node.setInput(value, outputNode.index);
}