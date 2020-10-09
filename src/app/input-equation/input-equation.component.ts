import { Equation } from './../equation/equation';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { EmitEvent, EventBusService, Events } from '../core/event-bus.service';
import * as nerdamer from 'nerdamer';

@Component({
    selector: 'app-input-equation',
    templateUrl: './input-equation.component.html',
    styleUrls: ['./input-equation.component.scss']
})

export class InputEquationComponent implements AfterViewInit {
    @ViewChild('container') container: ElementRef;
    @ViewChild('preview') preview: ElementRef;

    equation: Equation;
    equationAsString: string;
    inputEquation: string;
    errMessage: string;

    equationPreviewWidth: number;

    constructor(private eventbus: EventBusService) {
        this.equationAsString = '';
        this.inputEquation = '';
        this.errMessage = '';
        this.equationPreviewWidth = 0;
    }

    ngAfterViewInit() {
        this.equationPreviewWidth = this.container.nativeElement.offsetWidth;
    }

    parseEquation(inputString: string) {
        this.equationAsString = inputString;
        if (!inputString.includes('=')) {
            return;
        }

        let left = inputString.split('=')[0];
        let right = inputString.split('=')[1];

        if (left.length === 0 || right.length === 0) {
            return;
        }

        this.equation = new Equation(left, right);
        this.checkInput();
        this.equationAsString = this.equation.toString();
    }

    checkInput(): void {
        this.errMessage = '';

        //invalid chars
        let invalidChars = this.equationAsString.match(/[^a-z0-9+*/()=-\s]/gi);
        if (invalidChars !== null) {
            if (invalidChars.length === 1) {
                this.errMessage += `Rovnice nesmí obsahovat znak ${invalidChars[0]}. `
            } else {
                this.errMessage += `Rovnice nesmí obsahovat znaky`;
                for (let i = 0; i < invalidChars.length; i++) {
                    this.errMessage += ` $${invalidChars[i]}$` + (i !== invalidChars.length - 1 ? ', ' : '. ');
                }
            }
            return;
        }


        let equationVariables = this.equation.getVariable();
        if (equationVariables.length === 0) {
            this.errMessage += 'Rovnice musí obsahovat jednu neznámou. ';
        } else if (equationVariables.length > 1) {
            this.errMessage += 'Rovnice může obsahovat maximálně jednu neznámou. ';
        }

        if (!this.equation.isValid()) {
            this.errMessage += 'Rovnice obsahuje chybu. '
        }
    }

    submit() {
        this.checkInput();
        if (this.errMessage.length === 0) {
            this.equation.correctStructure();
            this.eventbus.emit(new EmitEvent(Events.NewEquationSubmited, this.equation));
        }
    }

    getAsLaTeX(expression: string) {
        return nerdamer.convertToLaTeX(expression);
    }

    calcFontSize() {
        if (this.equationAsString.length === 0) {
            return '2rem';
        }
        let k = 40;
        let textLengthPx = 0;

        let size = 40 / this.equationAsString.length + 0;
        let maxSize = 2.5;
        let minSize = 1;
        if (this.equationPreviewWidth !== 0) {
            textLengthPx = 0.0416361 * this.equationAsString.length * this.equationAsString.length + 12.3504 * this.equationAsString.length + 10.1791;
            size = this.equationPreviewWidth / textLengthPx;
        }
        if (size > maxSize) {
            size = maxSize;
        }
        console.log(this.preview.nativeElement.offsetWidth + " " + this.container.nativeElement.offsetWidth);
        if (this.preview.nativeElement.offsetWidth > this.container.nativeElement.offsetWidth) {
            //;
        }
        size -= 0.01;
        return size + 'rem';
    }
}
