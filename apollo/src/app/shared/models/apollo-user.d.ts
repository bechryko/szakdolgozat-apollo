export interface ApolloUser {
   email: string;
   username: string;
   isAdmin: boolean;
   university?: string;
   faculty?: string;
   major?: string;
   studyMode: 'full-time' | 'part-time';
   curriculumYear?: number;
}
