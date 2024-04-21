import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@ngneat/transloco';
import { NgLetModule } from 'ng-let';
import { ApolloButtonComponent } from '../components/button/button.component';

const includedModules = [
   TranslocoPipe,
   NgLetModule,
   CommonModule,
   ApolloButtonComponent,
   MatButtonModule,
   MatIconModule,
   MatTooltipModule
];

@NgModule({
   imports: [ ...includedModules ],
   exports: [ ...includedModules ]
})
export class ApolloCommonModule { }
