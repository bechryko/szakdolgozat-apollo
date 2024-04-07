import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "@apollo/shared/services";
import { provideTransloco } from "@ngneat/transloco";
import { BehaviorSubject, of } from "rxjs";
import { AveragesComponent } from "./averages.component";
import { AlternativeGradesDialogOutputData } from "./dialogs";
import { GradesCompletionYear } from "./models";
import { AveragesService } from "./services";

describe('AveragesComponent', () => {
   let component: AveragesComponent;
   let fixture: ComponentFixture<AveragesComponent>;

   let grades$: BehaviorSubject<GradesCompletionYear[]>;
   
   const alternativeGradesDialogOutputData = {
      alternativeFirstSemesterGrades: [
         {
            rating: 4,
            credit: 2
         },
         {
            rating: 5,
            credit: 3
         }
      ],
      alternativeSecondSemesterGrades: []
   } as AlternativeGradesDialogOutputData;

   function averagesServiceFactory() {
      return {
         ...jasmine.createSpyObj<AveragesService>('AveragesService', ['saveAlternativeSemester', 'saveAverages']),
         grades$
      };
   }

   function matDialogFactory() {
      const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
      dialogSpy.open.and.returnValue({
         afterClosed: () => of(alternativeGradesDialogOutputData)
      } as any);
      return dialogSpy;
   }

   function userServiceFactory() {
      return {
         isUserLoggedIn$: new BehaviorSubject(false)
      };
   }

   function activatedRouteFactory() {
      return {
         data: new BehaviorSubject({ userMajor: null })
      };
   }

   beforeEach(waitForAsync(() => {
      grades$ = new BehaviorSubject([] as GradesCompletionYear[]);

      TestBed.configureTestingModule({
         imports: [AveragesComponent],
         providers: [
            provideTransloco({ config: {} }),
            {
               provide: AveragesService,
               useFactory: averagesServiceFactory
            },
            {
               provide: MatDialog,
               useFactory: matDialogFactory
            },
            {
               provide: UserService,
               useFactory: userServiceFactory
            },
            {
               provide: ActivatedRoute,
               useFactory: activatedRouteFactory
            }
         ]
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(AveragesComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
   });

   describe('openAlternativesDialog', () => {
      const year = {
         id: 1,
         firstSemesterGrades: [
            {
               rating: 3,
               credit: 2
            },
            {
               rating: 2,
               credit: 3
            }
         ],
         secondSemesterGrades: [],
         alternativeGrades: {
            firstSemester: [
               {
                  rating: 4,
                  credit: 2
               },
               {
                  rating: 3,
                  credit: 3
               }
            ],
            secondSemester: []
         }
      } as any;

      it('should open the dialog', () => {
         component.openAlternativesDialog(year);

         expect(component["dialog"].open).toHaveBeenCalled();
      });

      it('should save alternative semester if it has changed', () => {
         component.openAlternativesDialog(year);

         expect(component["averagesService"].saveAlternativeSemester).toHaveBeenCalledWith({
            id: year.id,
            type: 'firstSemesterGrades',
            grades: alternativeGradesDialogOutputData.alternativeFirstSemesterGrades,
            original: year.firstSemesterGrades
         });
      });

      it('should not save alternative semester if it has not changed', () => {
         const year = {
            id: 1,
            firstSemesterGrades: [
               {
                  rating: 3,
                  credit: 2
               },
               {
                  rating: 2,
                  credit: 3
               }
            ],
            secondSemesterGrades: [],
            alternativeGrades: {
               firstSemester: [
                  {
                     rating: 4,
                     credit: 2
                  },
                  {
                     rating: 5,
                     credit: 3
                  }
               ],
               secondSemester: []
            }
         
         } as any;

         component.openAlternativesDialog(year);

         expect(component["averagesService"].saveAlternativeSemester).not.toHaveBeenCalled();
      });
   });
});
