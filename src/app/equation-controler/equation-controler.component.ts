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
  eventbusSub: Subscription;
  equationSign: string = '=';
  edits: Array<any> = [];
  editChanges: Array<string> = [];
  l: MathNode;
  r: MathNode;
  //selected: MathNode = new MathNode();
  lastTestedSelected: MathNode = new MathNode();
  selection: Array<MathNode> = [];
  /**
   * Stores user input from textArea.
   */
  userInputExpression: string;
  row = 0;
  equations = ['10x-1', '(15-6x)/3',
    '9x+8', '11x-10',
    '-1-5(2x-8(2x-3))', '+19',
    '2(x-1)-3(x-2)+4(x-3)', '2(x+8)',
    '2(3+4x)-2', '3-5(1-x)'];

  equationsAsMathNodes = [new MathNode('', this.equations[0], true),
  new MathNode('', this.equations[1], true),
  new MathNode('', this.equations[2], true),
  new MathNode('', this.equations[3], true),
  new MathNode('', this.equations[4], true),
  new MathNode('', this.equations[5], true),
  new MathNode('', this.equations[6], true),
  new MathNode('', this.equations[7], true),
  new MathNode('', this.equations[8], true),
  new MathNode('', this.equations[9], true)]



  constructor(private eventbus: EventBusService) {

    this.l = this.equationsAsMathNodes[this.row * 2];
    this.r = this.equationsAsMathNodes[this.row * 2 + 1];
    //todo cookies
    this.userInputExpression = '';
  }

  ngOnInit() {
    this.eventbusSub = this.eventbus.on(Events.EquationChanged, eventData => {
      this.correctStructure();
      this.clearSelection();
      //this.addEdit(eventData);
    });

    this.eventbusSub = this.eventbus.on(Events.NodeSelected, (newSelected: MathNode) => {
      if (newSelected.isChildOf(this.lastTestedSelected)) {
        this.lastTestedSelected = newSelected;
        return;
      }
      if (this.selection.length !== 0 &&
        (this.l.areChildrenSibilings(newSelected, this.selection[0]) ||
          this.r.areChildrenSibilings(newSelected, this.selection[0]))) {
            
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

  }

  ngOnDestroy() {
    // AutoUnsubscribe decorator above makes these calls unnecessary
    this.eventbusSub.unsubscribe();
  }

  /**
   * Replaces selected part/parts by user input from replaceForm
   */
  editEquation() {
    let selectedExpression = new MathNode('', this.selection, true);
    let replacement: MathNode = new MathNode('', this.userInputExpression);

    if (this.areExpressionsEqual(selectedExpression, replacement)) {
      if (!Array.isArray(replacement.value)) {
        this.selection[0].sign = replacement.sign;
      } else {
        this.selection[0].root = true;
      }
      this.selection[0].value = replacement.value;



      for (let i = 1; i < this.selection.length; i++) {
        this.selection[i].value = '0';
      }
    }

    this.l.correctStructure();
    this.r.correctStructure();
    this.l.correctStructure();
    this.r.correctStructure();

    this.clearSelection();
  }


  /**
   * Expands both sides of equation by expression from expandForm.
   * Function is triggered by submit button of expandForm.
   */

  multiplyEquation() {
    let expression: MathNode = new MathNode('', this.userInputExpression);

    this.l.multiply(expression);
    this.r.multiply(expression);
    this.clearSelection();
  }

  /**
   * Divides both sides of equation by expression from divideForm.
   * Function is triggered by submit button of divideForm.
   */

  divideEquation() {
    let expression: MathNode = new MathNode('', this.userInputExpression);

    this.l.divide(expression);
    this.r.divide(expression);
    this.clearSelection();
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
    this.selection.forEach((element: MathNode) => {
      element.setSelected(false);
    })
    this.selection = [];
    //this.selected = new MathNode();
  }

  /**
   * For testing only
   */
  calcSelection(): string {
    let selectedExpression = new MathNode('', this.selection, true);
    let e = nerdamer(selectedExpression.toString());
    return e.toString();
  }

  correctStructure(): void {
    this.l.correctStructure();
    this.r.correctStructure();    
  }

  /**
   * For testing only
   */
  print() {
    console.log(this.l);
    console.log(this.r);
  }
  /*
    next() {
      this.row++;
      this.l = this.equationsAsMathNodes[this.row * 2];
      this.r = this.equationsAsMathNodes[this.row * 2 + 1];
  
    }
  
    before() {
      this.row--;
      this.l = this.equationsAsMathNodes[this.row * 2];
      this.r = this.equationsAsMathNodes[this.row * 2 + 1];
    }
  
    reset() {
      this.equationsAsMathNodes = [new MathNode('', this.equations[0], true),
      new MathNode('', this.equations[1], true),
      new MathNode('', this.equations[2], true),
      new MathNode('', this.equations[3], true),
      new MathNode('', this.equations[4], true),
      new MathNode('', this.equations[5], true),
      new MathNode('', this.equations[6], true),
      new MathNode('', this.equations[7], true),
      new MathNode('', this.equations[8], true),
      new MathNode('', this.equations[9], true)];
      this.l = this.equationsAsMathNodes[this.row * 2];
      this.r = this.equationsAsMathNodes[this.row * 2 + 1];
    }
  
    isDisabledNext() {
      return this.row === this.equationsAsMathNodes.length / 2 - 1;
    }
  
    isDisabledBefore() {
      return this.row === 0;
    }*/
}
