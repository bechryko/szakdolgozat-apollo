export interface RawUniversitySubject {
   name: string;
   code: string;
   credit: number;
}

export interface UniversitySubject extends RawUniversitySubject {
   id: string;
   universityId: string;
   language: string;
}
