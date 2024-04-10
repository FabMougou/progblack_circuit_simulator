let types = {
    switch: 'SWITCH',
    bulb: 'BULB',
    and: 'AND',
    or: 'OR',
    not: 'NOT',
}

let operations = {
    SWITCH: '',
    BULB: 'a',
    AND: '(a & b)',
    OR: '(a | b)',
    NOT: '(!a)',
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
        this.height = (Math.max(this.input, this.output) * 15);
        this.width = this.type.length * 10; //Width is the length of the type string times 10 (so it fits name in it)

        this.outputNodes = new Array(output).fill(null);
        this.inputValues = new Array(input).fill(0);

        this.inputPositions = evenlySpreadPoints(-this.width/2, -this.height/2, -this.width/2, this.height/2, this.input);
        this.outputPositions = evenlySpreadPoints(this.width/2, -this.height/2, this.width/2, this.height/2, this.output);

    }
    move(x, y){
        this.x = x;
        this.y = y;
    }
    setInput(value, index){
        this.inputValues[index] = value;
    }

    show(col){
        fill(col?? '#333')
        rectMode(CENTER)
        rect(this.x, this.y, this.w, this.h)
        fill('#fff')
        textAlign(CENTER, CENTER)
        text(this.type.replace("_", "\n"), this.x, this.y)
    
        for (let i = 0; i < this.outputPos.length; i++) {
            rect(this.x+this.outputPos[i].x, this.y+this.outputPos[i].y, 12, 10);
        }

        for (let i = 0; i < this.inputPos.length; i++) {
            rect(this.x+this.inputPos[i].x, this.y+this.inputPos[i].y, 12, 10);
        }

        if(this.outputNodes){
            for (let i = 0; i < this.outputNodes.length; i++) {
                let out = this.outputNodes[i];
                if(!out) continue;
                line(this.x+this.outputPos[i].x, this.y+this.outputPos[i].y, out.node.x+out.node.inputPos[out.index].x, out.node.y+out.node.inputPos[out.index].y);
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
        super.show(this.state? '#922' : '#333');
    }
}

class BULB extends Node{
    constructor(x, y){
        super(types.bulb, 1, 0, x, y);
        this.state = false;
    }
    operate(){
        this.state = Boolean(this.inputVal[0])
    }
    show(){
        super.show(this.state? '#922' : '#333');
    }
}
class AND extends Node{
    constructor(x, y){
        super(types.and, 2, 1, x, y);
    }
    operate(){
        let a = this.inputVal[0], b = this.inputVal[1];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]), this.gateDelay)
    }
}
class OR extends Node{
    constructor(x, y) {
        super(types.or, 2, 1, x, y);
    }
    operate(){
        let a = this.inputVal[0], b = this.inputVal[1];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]), this.gateDelay)
    }
}

class NOT extends Node{
    constructor(x, y) {
        super(types.not, 1, 1, x, y);
    }
    operate(){
        let a = this.inputVal[0];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]), this.gateDelay)
    }
}