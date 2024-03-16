import { Activity, ActivityCategory, TimetableSizeData } from "@apollo/timetable/models";
import { ActivityStylePipe } from "./activity-style.pipe";

describe('ActivityStylePipe', () => {
   let pipe: ActivityStylePipe;

   const timetableSizeData: TimetableSizeData = {
      startingDay: 1,
      dayWidth: 100,
      startingHour: 7,
      hourHeight: 50
   };
   const activity = {
      time: {
         day: 1,
         startingHour: 9,
         startingMinute: 0,
         length: 60
      },
      locationInterval: {
         startPlace: 1,
         split: 2,
         size: 1
      },
      categoryName: 'testCategory'
   } as Activity;
   const categories: ActivityCategory[] = [
      {
         name: 'testCategory',
         color: '#0000ff',
         temporary: false
      }
   ];
   
   beforeEach(() => {
      pipe = new ActivityStylePipe();
   });
   
   it('should return the correct style', () => {
      const style = pipe.transform(timetableSizeData, activity, categories);
      expect(style['left']).toBe('50px');
      expect(style['width']).toBe('50px');
      expect(style['top']).toBe('100px');
      expect(style['height']).toBe('50px');
      expect(style['background-color']).toBe('#0000ff');
      expect(style['opacity']).toBeFalsy();
   });
   
   it('should return the correct style with no location interval', () => {
      const newActivity = { ...activity };
      delete newActivity.locationInterval;

      const style = pipe.transform(timetableSizeData, newActivity, categories);
      expect(style['left']).toBe('0px');
      expect(style['width']).toBe('100px');
   });

   it('should return the correct style with temporary category', () => {
      const newCategories = [{
         ...categories[0]
      }];
      newCategories[0].temporary = true;

      const style = pipe.transform(timetableSizeData, activity, newCategories);
      expect(style['opacity']).toBe('0.65');
   });

   it('should hide the element on error', () => {
      const style = pipe.transform(timetableSizeData, activity, null as any);
      expect(style['display']).toBe('none');
   });
});
