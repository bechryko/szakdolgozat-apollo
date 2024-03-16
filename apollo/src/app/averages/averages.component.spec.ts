import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { hot } from "jasmine-marbles";
import { of } from "rxjs";
import { AveragesComponent } from "./averages.component";
import { AlternativeGradesDialogOutputData } from "./dialogs";
import { AveragesService } from "./services";

describe('AveragesComponent', () => {
   let component: AveragesComponent;
   let fixture: ComponentFixture<AveragesComponent>;
   
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

   beforeEach(waitForAsync(() => {
      function averagesServiceFactory(): AveragesService {
         return jasmine.createSpyObj('AveragesService', ['saveAlternativeSemester'], {
            grades$: hot('a', { a: [] })
         });
      }

      function matDialogFactory(): MatDialog {
         const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']) as jasmine.SpyObj<MatDialog>;
         dialogSpy.open.and.returnValue({
            afterClosed: () => of(alternativeGradesDialogOutputData)
         } as any);
         return dialogSpy;
      }

      TestBed.configureTestingModule({
         imports: [AveragesComponent],
         providers: [
            {
               provide: AveragesService,
               useFactory: averagesServiceFactory
            },
            {
               provide: MatDialog,
               useFactory: matDialogFactory
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
