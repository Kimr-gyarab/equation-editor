import { Equation } from './../equation/equation';
import { Component, OnInit } from '@angular/core';
import * as nerdamer from 'nerdamer';
import { Subscription } from 'rxjs';
import { EventBusService, Events } from '../core/event-bus.service';
import { MathNode } from '../equation/math-node';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-equation-controler',
    templateUrl: './equation-controler.component.html',
    styleUrls: ['./equation-controler.component.css']
})

export class EquationControlerComponent implements OnInit {
    equation: Equation;

    eventbusSub: Subscription;
    edits: Array<string>;
    editCount: number;

    lastTestedSelected: MathNode = new MathNode();
    selection: Array<MathNode> = [];
    userInputExpression: string;
    errMessage: string;
    equationSign = '=';

    constructor(private eventbus: EventBusService) {
        this.equation = new Equation('1+(1+4*(2+9))', 'x2+(((1+1+2)/2)/2+1)');
        this.edits = [];
        this.editCount = 0;
        //todo cookies
        this.userInputExpression = '';
        this.errMessage = '';

        this.addEdit();
    }

    ngOnInit() {
        this.eventbusSub = this.eventbus.on(Events.EquationChanged, eventData => {
            this.equation.correctStructure();
            this.clearSelection();
            this.addEdit();
        });

        this.eventbusSub = this.eventbus.on(Events.NodeSelected, (newSelected: MathNode) => {
            if (newSelected.isChildOf(this.lastTestedSelected)) {
                this.lastTestedSelected = newSelected;
                return;
            }

            if (this.selection.length !== 0 && this.equation.areChildrenSibilings(newSelected, this.selection[0])) {
                if (this.selection.indexOf(newSelected) === -1) {
                    this.selection.push(newSelected);
                }
            } else {
                this.clearSelection();
                this.selection = [newSelected];
            }

            this.selection.forEach(element => {
                element.setSelected(true);
            });
            this.lastTestedSelected = newSelected;
        });
        this.eventbusSub = this.eventbus.on(Events.NewEquationSubmited, (eqation: Equation) => this.equation = eqation);
    }

    ngOnDestroy() {
        this.eventbusSub.unsubscribe();
    }

    actualizeUserInput(value: string): void {
        this.userInputExpression = value;
        this.errMessage = '';
        this.checkInput(-1);
    }


    checkInput(operation: number): void {
        enum Operations {
            EditEquation,
            MultiplyEquation,
            DivideEquation
        }
        this.errMessage = '';

        //invalid chars
        let invalidChars = this.userInputExpression.match(/[^a-z0-9+*/()-]/gi);
        if (invalidChars !== null) {
            if (invalidChars.length === 1) {
                this.errMessage += `Výraz nesmí obsahovat znak ${invalidChars[0]}.`
            } else {
                this.errMessage += `Výraz nesmí obsahovat znaky`;
                for (let i = 0; i < invalidChars.length; i++) {
                    this.errMessage += ` $${invalidChars[i]}$` + (i !== invalidChars.length - 1 ? ', ' : '.');
                }
            }
            return;
        }

        let expression: MathNode = new MathNode('', this.userInputExpression);

        let expressionVariables = expression.findVariables();
        if (expressionVariables.length !== 0 && expressionVariables !== this.equation.variable) {
            if (expressionVariables.length === 1) {
                this.errMessage += `Výraz nesmí obsahovat neznámou $${expressionVariables}$.`;
            } else {
                this.errMessage += `Výraz nesmí obsahovat neznámé`;
                for (let i = 0; i < expressionVariables.length; i++) {
                    this.errMessage += ` $${expressionVariables[i]}$` + (i !== expressionVariables.length - 1 ? ', ' : '.\n');
                }
            }
        }

        //mistake
        if (!expression.isValid()) {
            this.errMessage += 'Výraz obsahuje chybu. '
        }

        if (operation === Operations.EditEquation) {
            if (this.selection.length === 0) {
                this.errMessage += 'Není vybrán žádný výraz k nahrazení.\n'
                return;
            }

            let selectedExpression = new MathNode('', this.selection, true);
            if (!MathNode.areExpEqual(selectedExpression, expression)) {
                this.errMessage += 'Hodnota vybraného výrazu není sejná jako hodnota napsaného výrazu.\n'
            }
        } else if (operation === Operations.MultiplyEquation) {
            if (MathNode.areExpEqual(new MathNode('', 0), expression)) {
                this.errMessage += 'Rovnici nelze násobit výrazem rovným nule.\n'
            }
            if (expression.findVariables().length !== 0) {
                this.errMessage += 'Rovnici nelze násobit výrazem obsahujícím neznámou.\n'
            }
        } else if (operation === Operations.DivideEquation) {
            if (MathNode.areExpEqual(new MathNode('', 0), expression)) {
                this.errMessage += 'Rovnici nelze dělit výrazem rovným nule.\n'
            }
            if (expression.findVariables().length !== 0) {
                this.errMessage += 'Rovnici nelze dělit výrazem obsahujícím neznámou.\n'
            }
        }


    }
    /**
     * Replaces selected MathNodes by value of userInputExpression if they are equal.
     */
    editEquation() {
        let selectedExpression = new MathNode('', this.selection, true);
        let expression: MathNode = new MathNode('', this.userInputExpression);
        this.checkInput(0);
        /*this.errMessage = '';
        if (!expression.isValid()) {
            this.errMessage += 'Výraz obsahuje chybu.\n'
        }
        if (!MathNode.areExpEqual(selectedExpression, expression)) {
            this.errMessage += 'Hodnota vybraného výrazu není sejná jako hodnota napsaného výrazu.\n'
        }
        console.log('a');

        let expressionVariables = expression.findVariables();
        console.log(expressionVariables);
        console.log('b');

        if (expressionVariables.length !== 0 && expressionVariables !== this.equation.variable) {
            if (expressionVariables.length === 1) {
                this.errMessage += `Rovnice neobsahuje neznámou $${expressionVariables}$.`;
            } else {
                this.errMessage += `Rovnice neobsahuje neznámé`;
                for (let i = 0; i < expressionVariables.length; i++) {
                    this.errMessage += ` $${expressionVariables[i]}$` + (i !== expressionVariables.length - 1 ? ', ' : '.\n');
                }
            }
        }*/


        if (this.errMessage.length === 0) {
            if (!Array.isArray(expression.value)) {
                this.selection[0].sign = expression.sign;
                this.equation.deselectNodes();
            }
            this.selection[0].value = expression.value;

            for (let i = 1; i < this.selection.length; i++) {
                this.selection[i].value = '0';
            }
            this.clearSelection();
            this.equation.correctStructure();
        }
    }

    /**
     * Expands both sides of equation by value of userInputExpression if possible.
     */
    multiplyEquation() {
        let expression: MathNode = new MathNode('', this.userInputExpression);
        this.checkInput(1);
        /*this.errMessage = '';

        if (!expression.isValid()) {
            this.errMessage += 'Výraz obsahuje chybu.\n'
        }
        if (MathNode.areExpEqual(new MathNode('', 0), expression)) {
            this.errMessage += 'Rovnici nelze násobit výrazem rovným nule.\n'
        }
        if (expression.findVariables().length !== 0) {
            this.errMessage += 'Rovnici nelze násobit výrazem obsahujícím neznámou.\n'
        }*/


        if (this.errMessage.length === 0) {
            this.equation.multiply(this.userInputExpression);
            this.clearSelection();
        }
    }

    /**
     * Divides both sides of equation by value of userInputExpression if possible.
     */
    divideEquation() {
        let expression: MathNode = new MathNode('', this.userInputExpression);
        this.checkInput(2);
        /*this.errMessage = '';
        if (!expression.isValid()) {
            this.errMessage += 'Výraz obsahuje chybu.\n'
        }
        if (MathNode.areExpEqual(new MathNode('', 0), expression)) {
            this.errMessage += 'Rovnici nelze dělit výrazem rovným nule.\n'
        }
        if (expression.findVariables().length !== 0) {
            this.errMessage += 'Rovnici nelze dělit výrazem obsahujícím neznámou.\n'
        }*/

        if (this.errMessage.length === 0) {
            this.equation.divide(this.userInputExpression);
            this.clearSelection();
        }
    }

    /**
     * Swaps sides of equation.
     */
    swapSides(): void {
        this.equation.swapSides();
    }

    addEdit(/*event: CdkDragDrop<any> = null*/) {
        //this.edits[this.editCount] = nerdamer.convertToLaTeX(this.equation.toString());
        this.editCount++;


        /*let newLine = [this.l.toString(), '=', this.r.toString()];
        if (newLine !== this.edits[this.edits.length - 1]) {
            this.edits.push(newLine);
        }
        if (event !== null) {
            if (event.previousContainer !== event.container) {
                if (event.container.data.value[event.currentIndex] !== undefined) {
                    let s: string = event.container.data.value[event.currentIndex].toString();
                    this.editChanges.push('/' + (s.startsWith('-') ? '' : '+') + s);
                }
            }
            else {
                this.editChanges.push('nic');
            }
        } else {
            this.editChanges.push('nic');
        }*/
    }

    /**
     * Clears value of selection and selected. Deselects all selected nodes.
     */
    clearSelection(): void {
        this.equation.deselectNodes();
        this.selection = [];
    }

    /**
     * Prints value of equation as two MathNodes to console.
     */
    print() {
        console.log(this.equation.leftSide);
        console.log(this.equation.rightSide);
    }
}
