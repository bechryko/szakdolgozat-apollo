export function numberize<T = Record<string, number>>(obj: {}, ...exceptionKeys: (keyof T)[]): T {
   return Object.entries(obj).reduce((acc, [key, value]) => {
      if (exceptionKeys.includes(key as keyof T)) {
         acc[key] = value;
      } else {
         acc[key] = Number(value);
      }
      return acc;
   }, {} as Record<string, unknown>) as T;
}
