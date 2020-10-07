import { MathNode } from './math-node';

export class Equation {
    uuid: string;
    leftSide: MathNode;
    rightSide: MathNode;
    variable: string;

    constructor(leftSide: string, rightSide: string) {
        this.leftSide = new MathNode('', leftSide, true);
        this.rightSide = new MathNode('', rightSide, true);
        this.variable = this.leftSide.findVariable() + this.rightSide.findVariable();
        console.log(this.variable);
    }

    swapSides(): void {
        let temp = this.leftSide
        this.leftSide = this.rightSide;
        this.rightSide = temp;
        
    }

    multiply(expressionAsString: string) {
        let expression: MathNode = new MathNode('', expressionAsString);

        this.leftSide.multiply(expression);
        this.rightSide.multiply(expression);
    }

    divide(expressionAsString: string) {
        let expression: MathNode = new MathNode('', expressionAsString);

        this.leftSide.divide(expression);
        this.rightSide.divide(expression);
    }

    isValid(): boolean {
        return this.leftSide.isValid() && this.rightSide.isValid();
    }

    areChildrenSibilings(firstNode: MathNode, secondNode: MathNode): boolean {
        return this.leftSide.areChildrenSibilings(firstNode, secondNode) || this.rightSide.areChildrenSibilings(firstNode, secondNode);
    }

    deselectNodes(): void {
        this.leftSide.value.forEach((element: MathNode) => {
            element.setSelected(false);
        });
        this.rightSide.value.forEach((element: MathNode) => {
            element.setSelected(false);
        });
    }

    correctStructure(): void {
        let anyChanges = false;
        anyChanges = this.leftSide.correctStructure();
        console.log('a');

        while (anyChanges) {
            console.log('a');
            anyChanges = this.leftSide.correctStructure();
        };

        anyChanges = false;
        this.rightSide.correctStructure();
        console.log('b');

        while (anyChanges) {
            console.log('b');
            anyChanges = this.rightSide.correctStructure();
        };
    }

    toString(): string {
        return this.leftSide.toString() + '=' + this.rightSide.toString();
    }
}
