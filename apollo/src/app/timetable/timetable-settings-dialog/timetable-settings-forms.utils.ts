import { FormBuilder, Validators } from "@angular/forms";
import { Activity, ActivityCategory, Semester } from "../models";

export class TimetableSettingsFormsUtils {
   public static buildSemesterForm(fb: FormBuilder, semester: Semester) {
      return fb.group({
         name: [semester.name, Validators.required]
      });
   }

   public static buildCategoryFormArray(fb: FormBuilder, categories: ActivityCategory[]) {
      return fb.group({
         categories: fb.array(categories.map(category => this.buildCategoryForm(fb, category)))
      });
   }

   private static buildCategoryForm(fb: FormBuilder, category: ActivityCategory) {
      return fb.group({
         name: [category.name, Validators.required], // TODO: check if names are unique
         temporary: [category.temporary]
      });
   }

   public static buildActivityFormArray(fb: FormBuilder, activities: Activity[]) {
      return fb.group({
         activities: fb.array(activities.map(activity => this.buildActivityForm(fb, activity)))
      });
   }

   public static buildActivityForm(fb: FormBuilder, activity: Activity) {
      return fb.group({
         name: [activity.name, Validators.required],
         courseCode: [activity.courseCode],
         location: [activity.location],
         people: [activity.people],
         time: fb.group({
            day: [activity.time.day, Validators.required],
            startingHour: [activity.time.startingHour, [Validators.required, Validators.min(0), Validators.max(23)]],
            startingMinute: [activity.time.startingMinute, [Validators.required, Validators.min(0), Validators.max(59)]],
            length: [activity.time.length, [Validators.required, Validators.min(1)]]
         }),
         categoryName: [activity.categoryName]
      });
   }
}
