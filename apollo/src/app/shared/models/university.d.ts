import { MultiLanguage } from "../languages";

export interface University {
   id: string;
   name: MultiLanguage<string>;
   location: MultiLanguage<string>;
   faculties: MultiLanguage<string>[];
}
