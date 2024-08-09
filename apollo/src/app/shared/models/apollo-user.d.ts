import { Language } from "../languages";

export interface ApolloUser {
   email: string;
   username: string;
   isAdmin: boolean;
   selectedLanguage?: Language;
   studies: ApolloUserStudy[];
   settings: ApolloUserSettings;
}

export interface ApolloUserStudy {
   studyId?: string;
   university?: string;
   faculty?: number;
   major?: string;
}

export interface ApolloUserSettings {
   selectedStudyId?: string;
   selectedTimetableSemesterId?: string;
}
