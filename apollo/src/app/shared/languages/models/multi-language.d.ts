import { Language } from "./language";

export type MultiLanguage<T> = Partial<Record<Language, T>>;
