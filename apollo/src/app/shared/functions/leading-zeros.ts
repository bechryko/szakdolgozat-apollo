export function leadingZeros(value: number | string, digits: number): string {
   return value.toString().padStart(digits, '0');
}
