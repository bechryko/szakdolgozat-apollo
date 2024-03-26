import { MultiLanguage } from "@apollo/shared/languages";
import { UniversityFaculty } from "./university-faculty";

export interface University {
   id: string;
   name: MultiLanguage<string>;
   location: MultiLanguage<string>;
   faculties: UniversityFaculty[];
}
