import { Equation } from './../equation/equation';
import { Component, OnInit } from '@angular/core';
import { MathNode } from '../equation/math-node';

@Component({
  selector: 'app-input-equation',
  templateUrl: './input-equation.component.html',
  styleUrls: ['./input-equation.component.scss']
})
export class InputEquationComponent implements OnInit {
  equation: Equation;
  
  inputEquation: string;
  correct: boolean;
  asMathNode: MathNode;
  asMathNodeS: string;
  l;
  r;
  constructor() {
    this.inputEquation = '';
    this.correct = false;
  }

  ngOnInit() {
  }

  parseEquation(inputString: string){
    if (!inputString.includes('=')) {
      this.correct = false;
      return;
    }

    let l = inputString.split('=')[0];
    let r = inputString.split('=')[1];

    if (l.length === 0 || r.length === 0) {
      this.correct = false;
      return;
    }

    this.equation = new Equation(l, r);
  }

  checkIfCorrect(inputEquation: string){
    this.l = inputEquation.split('=')[0];
    this.r = inputEquation.split('=')[1];

    this.inputEquation = inputEquation;
    this.asMathNode = new MathNode('', inputEquation.split('=')[0], true);
    console.log(this.asMathNode);
    console.log(this.asMathNode.isValid());
    
    
    this.correct = this.asMathNode.isValid();
    this.asMathNodeS = this.asMathNode.toString();
  }

  useEquation(value){
    console.log(value);
  }

  generateEquation(difficulty: number){
    let steps = 10;
    let stepValues = [10];
    let l = '';
    let r = 'x';
    for (let i = 0; i < steps; i++) {
    }
    for (let i = 0; i < stepValues.length; i++) {
      const element = stepValues[i];
      
    }
  }
}
