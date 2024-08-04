export interface ParameterChange<T extends Object> {
   key: keyof T;
   value: T[keyof T];
}
