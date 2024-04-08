class Node {
    constructor(name, numInputs, costume) {
        this.name = name;
        this.numInputs = numInputs;
        this.costume = costume;
        this.input = [];
        this.output = null;
    }
    calculateInput() {
        this.input = Array(this.numInputs).fill(0);

    }
    calculateOutput() {
        switch (this.name) {
            case 'NOT':
                this.output = !this.input[0];
            case 'AND':
                this.output = this.input[0] && this.input[1];
                break;
            case 'OR':
                this.output = this.input[0] || this.input[1];
                break;
            case 'XOR':
                this.output = (this.input[0] || this.input[1]) && !(this.input[0] && this.input[1]);
                break;

        }
    }
}
