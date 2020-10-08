import { Equation } from './../equation/equation';
import { Component } from '@angular/core';
import { EmitEvent, EventBusService, Events } from '../core/event-bus.service';

@Component({
  selector: 'app-input-equation',
  templateUrl: './input-equation.component.html',
  styleUrls: ['./input-equation.component.scss']
})

export class InputEquationComponent {
  equation: Equation;

  equationAsString: string;
  inputEquation: string;
  isCorrect: boolean;

  constructor(private eventbus: EventBusService) {
    this.inputEquation = '';
    this.isCorrect = false;
  }
  
  parseEquation(inputString: string) {
    this.equationAsString = inputString;
    if (!inputString.includes('=')) {
      this.isCorrect = false;
      return;
    }

    let left = inputString.split('=')[0];
    let right = inputString.split('=')[1];

    if (left.length === 0 || right.length === 0) {
      this.isCorrect = false;
      return;
    }

    this.equation = new Equation(left, right);
    this.isCorrect = this.equation.isValid();
    this.equationAsString = this.equation.toString();
  }

  submit(){
    console.log(this.equation.leftSide);
    console.log(this.equation.rightSide);
    this.equation.correctStructure();
    this.eventbus.emit(new EmitEvent(Events.NewEquationSubmited, this.equation));
  }
}
