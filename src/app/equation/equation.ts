import { MathNode } from './math-node';

export class Equation {
    uuid: string;
    leftSide: MathNode;
    rightSide: MathNode;

    constructor(leftSide: string, rightSide: string) {
        this.leftSide = new MathNode('', leftSide, true);
        this.rightSide = new MathNode('', rightSide, true);
        
        this.correctStructure();
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
        while (this.leftSide.correctStructure()) { };
        while (this.rightSide.correctStructure()) { };
    }

    getCopy(): Equation {
        return new Equation(this.leftSide.toString(), this.rightSide.toString());
    }

    getVariable(): string {
        return (this.leftSide.findVariables() + this.rightSide.findVariables()).split('')
            .filter(function (item, pos, self) {
                return self.indexOf(item) == pos;
            })
            .join('');
    }

    toString(): string {
        return this.leftSide.toString() + '=' + this.rightSide.toString();
    }
}
