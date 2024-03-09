import { FormBuilder, Validators } from "@angular/forms";
import { Semester } from "@apollo-timetable/models";

export class TimetableSettingsFormsUtils {
   public static buildSemesterForm(fb: FormBuilder, semester: Semester) {
      return fb.group({
         name: [semester.name, Validators.required]
      });
   }
}
