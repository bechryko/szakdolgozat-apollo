import { MultiLanguage } from "./multi-language";

export interface University {
   id: string;
   name: MultiLanguage<string>;
   location: MultiLanguage<string>;
   faculties: MultiLanguage<string>[];
}
