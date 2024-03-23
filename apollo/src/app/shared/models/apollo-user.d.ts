import { Language } from "../languages";

export interface ApolloUser {
   email: string;
   username: string;
   isAdmin: boolean;
   selectedLanguage?: Language;
   university?: string;
   faculty?: string;
   major?: string;
   studyMode: 'full-time' | 'part-time';
   curriculumYear?: number;
}
