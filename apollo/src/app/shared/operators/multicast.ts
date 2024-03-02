import { MonoTypeOperatorFunction, ReplaySubject, ShareConfig, share } from "rxjs";

export function multicast<T>(config?: ShareConfig<T>): MonoTypeOperatorFunction<T> {
   return share<T>({
      connector: config?.connector ?? (() => new ReplaySubject<T>(1)),
      resetOnError: config?.resetOnError ?? true,
      resetOnComplete: config?.resetOnComplete ?? true,
      resetOnRefCountZero: config?.resetOnRefCountZero ?? true
   });
};
