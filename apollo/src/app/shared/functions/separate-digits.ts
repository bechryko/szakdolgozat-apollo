export function separateDigits(value: number, separatorChar = " ", digitNumberToSeparateBy = 3): string {
   const regex = new RegExp(`(\\d)(?=(\\d{${ digitNumberToSeparateBy }})+$)`, "g");
   return value.toString().replace(regex, '$1' + separatorChar);
}
