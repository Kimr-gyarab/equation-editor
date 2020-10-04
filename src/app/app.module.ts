import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { KatexModule } from 'ng-katex';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EquationControlerComponent } from './equation-controler/equation-controler.component';
import { EquationControlerNodeComponent } from './equation-controler-node/equation-controler-node.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InputEquationComponent } from './input-equation/input-equation.component';

@NgModule({
  declarations: [	
    AppComponent,
    EquationControlerComponent,
    EquationControlerNodeComponent,
      InputEquationComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserAnimationsModule,
    DragDropModule,
    KatexModule,
    NgbModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
