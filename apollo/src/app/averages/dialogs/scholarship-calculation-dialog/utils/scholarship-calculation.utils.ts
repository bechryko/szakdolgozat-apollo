import { UniversityScholarshipData } from "@apollo/shared/models";
import { cloneDeep, mean } from "lodash";
import { ScholarshipCalculationResult, ScholarshipDataInterval } from "../models";

export class ScholarshipCalculationUtils {
   public static calculateAverageScholarship(average: number, scholarshipDatas: UniversityScholarshipData[][]): ScholarshipCalculationResult {
      const scholarshipInEachYear: number[] = [];
      let didNotRecieveScholarship = false;
      let didBetterThanTheBest = false;

      scholarshipDatas.forEach(scholarshipData => {
         const [ lowerLimit, upperLimit ] = this.getClosestScholarshipData(average, scholarshipData);
         if(!lowerLimit) {
            didNotRecieveScholarship = true;
            return;
         }
         if(!upperLimit) {
            scholarshipInEachYear.push(lowerLimit.scholarshipAmount);
            didBetterThanTheBest = true;
            return;
         }

         if(lowerLimit.adjustedCreditIndex === upperLimit.adjustedCreditIndex) {
            scholarshipInEachYear.push(lowerLimit.scholarshipAmount);
            return;
         }

         const lowerLimitClosenessRatio = (average - lowerLimit?.adjustedCreditIndex) / (upperLimit?.adjustedCreditIndex - lowerLimit?.adjustedCreditIndex);
         scholarshipInEachYear.push(
            lowerLimit.scholarshipAmount * (1 - lowerLimitClosenessRatio) +
            upperLimit.scholarshipAmount * (lowerLimitClosenessRatio)
         );
      });

      return {
         scholarshipAmount: scholarshipInEachYear.length ? mean(scholarshipInEachYear) : undefined,
         didNotRecieveScholarship,
         didBetterThanTheBest
      };
   }

   public static calculateProbabilisticScholarship(average: number, scholarshipDatas: UniversityScholarshipData[][]): ScholarshipCalculationResult {
      const scholarshipInEachYear: number[] = [];
      let didNotRecieveScholarship = false;
      let didBetterThanTheBest = false;

      scholarshipDatas.forEach(scholarshipData => {
         const intervalData = this.getIntervalScholarshipData(scholarshipData);

         for (const interval of intervalData) {
            if(average >= interval.lowerBoundAdjustedCreditIndex && average < interval.upperBoundAdjustedCreditIndex) {
               scholarshipInEachYear.push(interval.scholarshipAmount);
               return;
            }
         }

         const belowLowestInterval = average < intervalData[0].lowerBoundAdjustedCreditIndex;
         didNotRecieveScholarship ||= belowLowestInterval;
         didBetterThanTheBest ||= !belowLowestInterval;
      });

      return {
         scholarshipAmount: scholarshipInEachYear.length ? mean(scholarshipInEachYear) : undefined,
         didNotRecieveScholarship,
         didBetterThanTheBest
      };
   }

   private static getClosestScholarshipData(average: number, scholarshipData: UniversityScholarshipData[]): [ UniversityScholarshipData | undefined, UniversityScholarshipData | undefined ] {
      let closestData: [ UniversityScholarshipData | undefined, UniversityScholarshipData | undefined ] = [ undefined, undefined ];

      scholarshipData.forEach(data => {
         const avg = data.adjustedCreditIndex;
         if(avg <= average && (!closestData[0] || avg > closestData[0].adjustedCreditIndex)) {
            closestData[0] = data;
         }
         if(avg >= average && (!closestData[1] || avg < closestData[1].adjustedCreditIndex)) {
            closestData[1] = data;
         }
      });

      return closestData;
   }

   private static getIntervalScholarshipData(scholarshipData: UniversityScholarshipData[]): ScholarshipDataInterval[] {
      scholarshipData = cloneDeep(scholarshipData).sort((a, b) => a.adjustedCreditIndex - b.adjustedCreditIndex);

      const intervalScholarshipData: ScholarshipDataInterval[] = [];

      scholarshipData.forEach((data, index) => {
         const previousData = scholarshipData[index - 1];
         const nextData = scholarshipData[index + 1];

         let lowerBoundAdjustedCreditIndex;
         if(previousData) {
            const lowerWeight = data.peopleEligible / (data.peopleEligible + previousData.peopleEligible);
            lowerBoundAdjustedCreditIndex = data.adjustedCreditIndex * (1 - lowerWeight) + previousData.adjustedCreditIndex * lowerWeight;
         }
         let upperBoundAdjustedCreditIndex;
         if(nextData) {
            const upperWeight = data.peopleEligible / (data.peopleEligible + nextData.peopleEligible);
            upperBoundAdjustedCreditIndex = data.adjustedCreditIndex * (1 - upperWeight) + nextData.adjustedCreditIndex * upperWeight;
         }
         lowerBoundAdjustedCreditIndex ??= data.adjustedCreditIndex * 2 - upperBoundAdjustedCreditIndex!;
         upperBoundAdjustedCreditIndex ??= data.adjustedCreditIndex * 2 - lowerBoundAdjustedCreditIndex!;

         intervalScholarshipData.push({
            scholarshipAmount: data.scholarshipAmount,
            lowerBoundAdjustedCreditIndex,
            upperBoundAdjustedCreditIndex
         });
      });

      return intervalScholarshipData;
   }
}
