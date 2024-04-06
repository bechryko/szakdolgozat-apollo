import { Language } from "../languages";

export interface ApolloUser {
   email: string;
   username: string;
   isAdmin: boolean;
   selectedLanguage?: Language;
   university?: string;
   faculty?: number;
   major?: string;
}
