type Key = keyof {};

export function deleteNullish<T1 = {}>(obj: {}): T1 {
   return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key as Key];
      if (value !== null && value !== undefined) {
         acc[key as Key] = value;
      }
      return acc;
   }, {} as T1);
}
