import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EmitEvent, EventBusService, Events } from '../core/event-bus.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MathNode } from '../equation/math-node';

@Component({
  selector: 'app-equation-controler-node',
  templateUrl: './equation-controler-node.component.html',
  styleUrls: ['./equation-controler-node.component.css']
})
export class EquationControlerNodeComponent{
  @Input() node;
  @Output() changedNode: EventEmitter<CdkDragDrop<string[]>>;

  lBracket = '(';
  rBracket = ')';
  lastTestedSelected: MathNode = new MathNode();

  constructor(private eventbus: EventBusService) {
    this.changedNode = new EventEmitter();
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data.value, event.previousIndex, event.currentIndex);
    } else {
      if (event.previousContainer.data.value !== event.container.data.value) {
        event.previousContainer.data.value[event.previousIndex].changeSign();
      }

      transferArrayItem(event.previousContainer.data.value,
        event.container.data.value,
        event.previousIndex,
        event.currentIndex);
    }
    this.eventbus.emit(new EmitEvent(Events.EquationChanged, event));
  }

  selectNode(item: MathNode) {
    this.eventbus.emit(new EmitEvent(Events.NodeSelected, item));
  }

  isArray(nodeVal) {
    return Array.isArray(nodeVal);
  }

  isDragable(item) {
    return item.sign === '/';
  }


  itemToTeX(nodeVal) {
    return nodeVal;
  }

  hasBrackets(item: MathNode, i: number) {
    return this.isArray(item.value) && item.value[0].sign !== '*' && item.value[0].sign !== '/' && item.sign !== '/';
  }

  hasSign(item: MathNode, i: number) {
    if (item.sign === '/') {
      return false;
    }
    if (i !== 0 || (item.sign !== '+' && item.sign !== '*')) {
      return true;
    }

    return false;
  }

  isDisabled(item: MathNode) {
    return item.value === '0' || item.sign === '/';
  }

  getCssClasses(item: MathNode, i: number) {
    let classes = {};
    if (item.selected) {
      classes['selected'] = true;
    }
    if (this.node.value[0].sign !== '/') {
      classes['example-box'] = true;
    }
    if (this.node.value[0].sign === '/' && i % 2 == 0) {
      classes['fraction-top'] = true;
    }
    if (this.node.value[0].sign === '/' && i % 2 == 1) {      
      classes['fraction-bottom'] = true;
    }
    return classes;
    //{'example-box': node.value[0].sign !== '/', 'fraction-top': (node.value[0].sign === '/' && i%2==0),
    //'fraction-bottom': (node.value[0].sign === '/' && i % 2 == 1), 'selected': item.selected}
  }
}
