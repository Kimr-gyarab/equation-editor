import { MathNode } from './math-node';

export class Equation {
    uuid: string;
    leftSide: MathNode;
    rightSide: MathNode;

    constructor(leftSide: MathNode, rightSide: MathNode) {
        this.leftSide = leftSide;
        this.rightSide = rightSide;
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
