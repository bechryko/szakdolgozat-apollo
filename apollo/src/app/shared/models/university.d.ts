import { MultiLanguage } from "@apollo/shared/languages";

export interface University {
   id: string;
   name: MultiLanguage<string>;
   location: MultiLanguage<string>;
   faculties: MultiLanguage<string>[];
}
