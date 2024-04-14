import { orderBy } from "lodash";

interface SubjectLike {
   name: string;
   code: string;
}

export function orderSubject<T extends Partial<SubjectLike>>(array: T[]): T[] {
   return orderBy(array, ['name', 'code']);
}
