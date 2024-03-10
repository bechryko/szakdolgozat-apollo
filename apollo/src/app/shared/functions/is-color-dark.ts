const DARK_COLOR_THRESHOLD = 110;

export function isColorDark(hexColor: string): boolean {
   const red = parseInt(hexColor.slice(1, 3), 16);
   const green = parseInt(hexColor.slice(3, 5), 16);
   const blue = parseInt(hexColor.slice(5, 7), 16);
   const brightness = Math.round(((red * 299) + (green * 587) + (blue * 114)) / 1000);
   return brightness < DARK_COLOR_THRESHOLD;
}
