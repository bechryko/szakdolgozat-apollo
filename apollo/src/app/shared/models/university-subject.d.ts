export interface RawUniversitySubject {
   name: string;
   code: string;
   credit: number;
   isTalentManager: boolean;
}

export interface UniversitySubject extends RawUniversitySubject {
   id: string;
   universityId: string;
   language: string;
}
