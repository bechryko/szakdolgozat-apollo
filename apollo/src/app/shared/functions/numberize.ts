export function numberize<T = Record<string, number>>(obj: Record<string, string>): T {
   return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key] = Number(value);
      return acc;
   }, {} as Record<string, number>) as T;
}
