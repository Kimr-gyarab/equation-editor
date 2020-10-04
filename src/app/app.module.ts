import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EquationComponentComponent } from './equation-component/equation-component.component';
import { EquationNodeComponentComponent } from './equation-node-component/equation-node-component.component';

@NgModule({
  declarations: [		
    AppComponent,
      EquationComponentComponent,
      EquationNodeComponentComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
