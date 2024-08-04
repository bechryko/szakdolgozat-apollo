import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoPipe } from '@ngneat/transloco';
import { ParameterChange, ParametersDescriptionList } from './models';

@Component({
   selector: 'apo-parameters-section',
   standalone: true,
   imports: [
      FormsModule,
      MatFormFieldModule,
      MatSelectModule,
      MatCheckboxModule,
      TranslocoPipe
   ],
   templateUrl: './parameters-section.component.html',
   styleUrl: './parameters-section.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParametersSectionComponent<T extends Object> {
   public readonly descriptionList = input.required<ParametersDescriptionList<T>>();
   @Output() public readonly parameterChanged = new EventEmitter<ParameterChange<T>>();

   public onParameterChanged(key: keyof T, value: any): void {
      this.parameterChanged.emit({ key, value });
   }
}
