let types = {
    switch: 'SWITCH',
    bulb: 'BULB',
    and: 'AND',
    or: 'OR',
    not: 'NOT',
    xor: 'XOR',
}

let operations = {
    SWITCH: '',
    BULB: 'a',
    AND: '(a & b)',
    OR: '(a | b)',
    NOT: '(!a)',
    XOR: '(a ^ b)',
}
let nodeData = {};
let id = 0;
class Node{
    constructor(type, input, output, x = 100, y = 100, w, h){
        this.id = Date.now() + id++;
        this.type = type;
        this.input = input;
        this.output = output;
        this.x = x; this.y = y;
        this.h = h ?? (Math.max(this.input, this.output) * 15) + 20;
        this.w = w ?? this.type.length * 10 + 30;

        this.outputNodes = new Array(out).fill(null);
        this.inputVal = new Array(this.input).fill(0);
        this.inputPos = evenlySpreadPoints(-this.w/2, -this.h/2, -this.w/2, this.h/2, this.input);
        this.outputPos = evenlySpreadPoints(this.w/2, -this.h/2, this.w/2, this.h/2, this.output);
        this.isCombinational = true;
        this.gateDelay = 10;
    }
    move(x, y){
        this.x = x;
        this.y = y;
    }
    setInput(val, index){
        this.inputVal[index] = val;
    }
    show(col){
        fill(col?? '#333')
        rectMode(CENTER)
        rect(this.x, this.y, this.w, this.h)
        fill('#fff')
        textAlign(CENTER, CENTER)
        text(this.name != undefined? this.name.replace("_", "\n") : this.type.replace("_", "\n"), this.x, this.y)
        push();
        textAlign(RIGHT);
        textSize(10)
        for (let i = 0; i < this.outputPos.length; i++) {
            rect(this.x+this.outputPos[i].x, this.y+this.outputPos[i].y, 12, 10);
            if(this.outputNames?.[i]){
                text(this.outputNames[i], this.x+this.outputPos[i].x - 10, this.y+this.outputPos[i].y);
            }
        }
        textAlign(LEFT);
        for (let i = 0; i < this.inputPos.length; i++) {
            rect(this.x+this.inputPos[i].x, this.y+this.inputPos[i].y, 12, 10);
            if(this.inputNames?.[i]){
                text(this.inputNames[i], this.x+this.inputPos[i].x + 10, this.y+this.inputPos[i].y);
            }
        }
        pop();
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

class XOR extends Node{
    constructor(x, y) {
        super(types.xor, 2, 1, x, y);
    }
    operate(){
        let a = this.inputVal[0], b = this.inputVal[1];
        propagateOutput(this.outputNodes[0], eval(operations[this.type]), this.gateDelay)
    }
}