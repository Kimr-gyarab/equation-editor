import { Equation } from './../equation/equation';
import { Component, OnInit } from '@angular/core';
import * as nerdamer from 'nerdamer';
import { Subscription } from 'rxjs';
import { EventBusService, Events } from '../core/event-bus.service';
import { MathNode } from '../equation/math-node';

@Component({
  selector: 'app-equation-controler',
  templateUrl: './equation-controler.component.html',
  styleUrls: ['./equation-controler.component.css']
})
export class EquationControlerComponent implements OnInit {
  equation: Equation;

  eventbusSub: Subscription;
  editChanges: Array<string> = [];

  lastTestedSelected: MathNode = new MathNode();
  selection: Array<MathNode> = [];
  userInputExpression: string;
  equationSign = '=';

  constructor(private eventbus: EventBusService) {
    this.equation = new Equation('1+(1+4*(2+9))', 'x2+(1+1+2)/2');
    console.log(this.equation.toString());
    
    //todo cookies
    this.userInputExpression = '';
  }

  ngOnInit() {
    this.eventbusSub = this.eventbus.on(Events.EquationChanged, eventData => {
      this.equation.correctStructure();
      this.clearSelection();
      //this.addEdit(eventData);
    });

    this.eventbusSub = this.eventbus.on(Events.NodeSelected, (newSelected: MathNode) => {
      if (newSelected.isChildOf(this.lastTestedSelected)) {
        this.lastTestedSelected = newSelected;
        return;
      }
      if (this.selection.length !== 0 && this.equation.areChildrenSibilings(newSelected, this.selection[0])) {
            
        if (this.selection.indexOf(newSelected) === -1) {
          
          this.selection.push(newSelected);

        } else if (newSelected.sign === '/' && this.selection[0].sign === '/') {
          //this.selection.push(newSelected);


          /*let fraction = newSelected;
          let expansion = this.selection[0];
          let parent = this.l.findParent(fraction);
          let side: MathNode = this.l;
          if (newSelected.sign !== '/') {
            fraction = this.selection[0];
            expansion = newSelected;
          }

          if (parent === null) {
            parent = this.r.findParent(fraction);
            side = this.r;
          }*/
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

  /**
   * 
   */
  editEquation() {
    let selectedExpression = new MathNode('', this.selection, true);
    let replacement: MathNode = new MathNode('', this.userInputExpression);

    if (this.areExpressionsEqual(selectedExpression, replacement)) {
      if (!Array.isArray(replacement.value)) {
        this.selection[0].sign = replacement.sign;
        this.equation.deselectNodes();
      }
      this.selection[0].value = replacement.value;

      for (let i = 1; i < this.selection.length; i++) {
        this.selection[i].value = '0';
      }
    }
    this.equation.correctStructure();

    this.clearSelection();
  }


  /**
   * Expands both sides of equation by expression from expandForm.
   * Function is triggered by submit button of expandForm.
   */
  multiplyEquation() {
    this.equation.multiply(this.userInputExpression);
    this.clearSelection();
  }

  /**
   * Divides both sides of equation by expression from divideForm.
   * Function is triggered by submit button of divideForm.
   */
  divideEquation() {
    this.equation.divide(this.userInputExpression);
    this.clearSelection();
  }

  swapSides(): void {
    this.equation.swapSides();
  }

  /**
   * Returns true if both expressions are equal.
   * @param exp1 first expression
   * @param exp2 second expression
   */
  areExpressionsEqual(exp1, exp2): boolean {
    let e1 = nerdamer(exp1.toString(), undefined, "expand");
    let e2 = nerdamer(exp2.toString(), undefined, "expand");
    let diff: string = `${e1.text()} - (${e2.text()})`;

    return nerdamer(diff).text() === '0';
  }

  /*addEdit(event: CdkDragDrop<any> = null) {
    let newLine = [this.l.toString(), '=', this.r.toString()];
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
    }
  }*/

  /**
   * Clears value of selection and selected. Deselects all selected nodes.
   */
  clearSelection(): void {
    this.equation.deselectNodes();
    this.selection = [];
  }

  /**
   * For testing only
   */
  calcSelection(): string {
    let selectedExpression = new MathNode('', this.selection, true);
    let e = nerdamer(selectedExpression.toString());
    return e.toString();
  }

  /**
   * For testing only
   */
  print() {
    console.log(this.equation.leftSide);
    console.log(this.equation.rightSide);
  }
}
