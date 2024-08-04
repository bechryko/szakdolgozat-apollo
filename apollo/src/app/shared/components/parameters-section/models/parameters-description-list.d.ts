export type ParametersDescriptionList<T extends Object> = Array<
   SelectParameterDescription<T> |
   CheckboxParameterDescription<T>
>;

interface ParameterDescriptionBase<T extends Object> {
   parameterKey: keyof T;
   parameterName: string;
   startingValue: T[keyof T];
}

interface SelectParameterDescription<T extends Object> extends ParameterDescriptionBase<T> {
   inputType: 'select';
   options: Array<{
      value: T[keyof T];
      displayValue?: string;
      displayValueTranslationKey?: string;
   }>;
}

interface CheckboxParameterDescription<T extends Object> extends ParameterDescriptionBase<T> {
   inputType: 'checkbox';
}
