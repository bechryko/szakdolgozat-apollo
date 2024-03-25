import { University, UniversityCompletionYear } from "../models";

export interface CoreState {
   completions: UniversityCompletionYear[] | null;
   universities: University[] | null;
}
