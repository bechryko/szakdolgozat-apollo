export function leadingZeros(value: number | string | null, digits: number): string {
   value ??= 0;
   return value.toString().padStart(digits, '0');
}
