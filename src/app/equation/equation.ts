import { MathNode } from './math-node';

export class Equation {
    uuid: string;
    leftSide: MathNode;
    rightSide: MathNode;

    constructor(leftSide: string, rightSide: string) {
        this.leftSide = new MathNode('', leftSide, true);
        this.rightSide = new MathNode('', rightSide, true);
    }

    swapSides(): void {
        let temp = this.leftSide
        this.leftSide = this.rightSide;
        this.rightSide = temp;
    }

    multiply(expression: MathNode) {
        this.leftSide.multiply(expression);
        this.rightSide.multiply(expression);
    }

    divide(expression: MathNode) {
        this.leftSide.divide(expression);
        this.rightSide.divide(expression);
    }
}
