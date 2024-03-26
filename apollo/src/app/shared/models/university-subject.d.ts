import { Language } from "../languages";

export interface RawUniversitySubject {
   name: string;
   code: string;
   credit: number;
   suggestedSemester?: number;
}

export interface UniversitySubject extends RawUniversitySubject {
   id: string;
   universityId: string;
   language: Language;
}
