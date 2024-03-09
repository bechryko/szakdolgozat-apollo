import { FormBuilder, Validators } from "@angular/forms";
import { ActivityCategory, Semester } from "@apollo-timetable/models";

export class TimetableSettingsFormsUtils {
   public static buildSemesterForm(fb: FormBuilder, semester: Semester) {
      return fb.group({
         name: [semester.name, Validators.required]
      });
   }

   public static buildCategoryFormArray(fb: FormBuilder, categories: ActivityCategory[]) {
      return fb.group({
         categories: fb.array(categories.map(category => TimetableSettingsFormsUtils.buildCategoryForm(fb, category)))
      });
   }

   private static buildCategoryForm(fb: FormBuilder, category: ActivityCategory) {
      return fb.group({
         name: [category.name, Validators.required], // TODO: check if names are unique
         temporary: [category.temporary]
      });
   }
}
