export class GuestStorageUtils {
   private static readonly KEY_PREFIX = 'apollo-guest-';
   private static readonly storage = localStorage;

   public static save<T>(key: string, value: T[]): void {
      this.storage.setItem(this.getKey(key), JSON.stringify(value));
   }

   public static load<T>(key: string): T[] {
      const item = this.storage.getItem(this.getKey(key));
      if (item === null) {
         return [];
      }

      return JSON.parse(item);
   }

   public static clear(key: string): void {
      this.storage.removeItem(this.getKey(key));
   }

   private static getKey(key: string): string {
      return this.KEY_PREFIX + key;
   }
}
