import { UniversityScholarshipData } from "@apollo/shared/models";
import { ScholarshipCalculationUtils } from "./scholarship-calculation.utils";

describe('ScholarshipCalculationUtils', () => {
   const scholarshipDatas = [
      [
         {
            scholarshipAmount: 200,
            adjustedCreditIndex: 2,
            peopleEligible: 10
         },
         {
            scholarshipAmount: 300,
            adjustedCreditIndex: 3,
            peopleEligible: 20
         },
         {
            scholarshipAmount: 100,
            adjustedCreditIndex: 1,
            peopleEligible: 5
         },
         {
            scholarshipAmount: 400,
            adjustedCreditIndex: 4,
            peopleEligible: 30
         }
      ],
      [
         {
            scholarshipAmount: 450,
            adjustedCreditIndex: 4
         },
         {
            scholarshipAmount: 350,
            adjustedCreditIndex: 3
         }
      ]
   ] as UniversityScholarshipData[][];

   describe('calculateAverageScholarship', () => {
      it("should calculate average scholarship", () => {
         const average = 3.6;
         const result = ScholarshipCalculationUtils.calculateAverageScholarship(average, scholarshipDatas);

         expect(result.scholarshipAmount).toBe(385);
         expect(result.didNotRecieveScholarship).toBeFalse();
         expect(result.didBetterThanTheBest).toBeFalse();
      });

      it("should calculate average scholarship when the average is too low for scholarship", () => {
         const average1 = 0.5;
         const result1 = ScholarshipCalculationUtils.calculateAverageScholarship(average1, scholarshipDatas);

         expect(result1.scholarshipAmount).toBeUndefined();
         expect(result1.didNotRecieveScholarship).toBeTrue();
         expect(result1.didBetterThanTheBest).toBeFalse();

         const average2 = 2.75;
         const result2 = ScholarshipCalculationUtils.calculateAverageScholarship(average2, scholarshipDatas);

         expect(result2.scholarshipAmount).toBe(275);
         expect(result2.didNotRecieveScholarship).toBeTrue();
         expect(result2.didBetterThanTheBest).toBeFalse();
      });

      it("should calculate average scholarship when the average is better than the best data", () => {
         const average = 4.3;
         const result = ScholarshipCalculationUtils.calculateAverageScholarship(average, scholarshipDatas);

         expect(result.scholarshipAmount).toBe(425);
         expect(result.didNotRecieveScholarship).toBeFalse();
         expect(result.didBetterThanTheBest).toBeTrue();
      });
   });

   describe('calculateProbabilisticScholarship', () => {
      const modifiedScholarshipDatas = [
         scholarshipDatas[0],
         [
            {
               scholarshipAmount: 450,
               adjustedCreditIndex: 4.5,
               peopleEligible: 10
            },
            {
               scholarshipAmount: 350,
               adjustedCreditIndex: 3.5,
               peopleEligible: 20
            }
         ]
      ] as UniversityScholarshipData[][];

      it("should calculate probabilistic scholarship", () => {
         const average = 3.6;
         const result = ScholarshipCalculationUtils.calculateProbabilisticScholarship(average, modifiedScholarshipDatas);

         expect(result.scholarshipAmount).toBe(375);
         expect(result.didNotRecieveScholarship).toBeFalse();
         expect(result.didBetterThanTheBest).toBeFalse();
      });

      it("should calculate probabilistic scholarship when the average is too low for scholarship", () => {
         const average1 = 0.6;
         const result1 = ScholarshipCalculationUtils.calculateProbabilisticScholarship(average1, modifiedScholarshipDatas);

         expect(result1.scholarshipAmount).toBeUndefined();
         expect(result1.didNotRecieveScholarship).toBeTrue();
         expect(result1.didBetterThanTheBest).toBeFalse();

         const average2 = 2.8;
         const result2 = ScholarshipCalculationUtils.calculateProbabilisticScholarship(average2, modifiedScholarshipDatas);

         expect(result2.scholarshipAmount).toBe(300);
         expect(result2.didNotRecieveScholarship).toBeTrue();
         expect(result2.didBetterThanTheBest).toBeFalse();
      });

      it("should calculate probabilistic scholarship when the average is better than the best data", () => {
         const average = 4.8;
         const result = ScholarshipCalculationUtils.calculateProbabilisticScholarship(average, modifiedScholarshipDatas);

         expect(result.scholarshipAmount).toBe(450);
         expect(result.didNotRecieveScholarship).toBeFalse();
         expect(result.didBetterThanTheBest).toBeTrue();
      });
   });
});
