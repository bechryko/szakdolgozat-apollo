import { colors, derivedColors } from "@apollo/shared/constants";
import { UniversitySubject } from "@apollo/shared/models";
import { dia, shapes } from "@joint/core";
import { MajorPlan, MajorPlannerOptions, MajorPlanSemester } from "../../models";
import { ChartCalculationUtils } from "./chart-calculation.utils";

export class ChartSetupUtils {
   private static readonly GRAPH_HEIGHT = 700;
   private static readonly HEADER_HEIGHT = 50;
   private static readonly HEADER_FONT_SIZE = 26;
   private static readonly HEADER_LETTER_SPACING = 2;
   private static readonly BACKGROUND_COLOR = colors.backgroundColor;
   
   private static readonly SEMESTER_WIDTH = 350;
   private static readonly SEMESTER_CREDIT_SUM_SECTION_WIDTH = 200;
   private static readonly SEMESTER_CREDIT_SUM_SECTION_HEIGHT = 30;
   private static readonly SEMESTER_CREDIT_SUM_SECTION_BACKGROUND_COLOR = colors.accent;
   private static readonly SEMESTER_TOP_PADDING = this.HEADER_HEIGHT + this.SEMESTER_CREDIT_SUM_SECTION_HEIGHT / 2;
   private static readonly SEMESTER_ODD_BACKGROUND_COLOR = colors.sectionBackgroundColor;
   private static readonly SEMESTER_EVEN_BACKGROUND_COLOR = derivedColors.lighterPrimary;

   private static readonly SUBJECT_WIDTH = 200;
   private static readonly SUBJECT_HEIGHT = 50;
   private static readonly SUBJECT_GAP = 25;
   private static readonly SUBJECT_LABEL_FONT_SIZE = 16;
   private static readonly SUBJECT_LABEL_LINE_HEIGHT = 20;
   private static readonly SUBJECT_STROKE_COLOR = colors.fontColor;
   private static readonly SUBJECT_CONNECTION_LINE_GAP = (this.SEMESTER_WIDTH - this.SUBJECT_WIDTH) / 4;
   private static readonly SUBJECT_CONNECTION_WIDTH = 2;
   private static readonly SUBJECT_CONNECTION_COLOR = colors.fontColor;

   public static initGraph(
      chartElement: HTMLElement,
      majorPlan: MajorPlan,
      options: MajorPlannerOptions,
      translations: Record<string, string>
   ): dia.Graph {
      const subjectConditionMap = ChartCalculationUtils.getSubjectConditionMap(majorPlan);
      const chartPositioning = ChartCalculationUtils.calculateChartPositioning(majorPlan, options.subjectGroupingMode, subjectConditionMap);

      const graph = new dia.Graph({}, {
         cellNamespace: shapes.standard
      });

      new dia.Paper({
         el: chartElement,
         model: graph,
         width: this.SEMESTER_WIDTH * majorPlan.semesters.length,
         height: this.GRAPH_HEIGHT,
         background: { color: 'white' },
         interactive: false
      });

      const graphAreaWrapper = this.initGraphAreaWrapper(majorPlan.name);
      graphAreaWrapper.addTo(graph);

      const subjectPreconditionElementMap: Record<string, dia.Element[]> = {};
      const subjectParallelConditionElementMap: Record<string, dia.Element[]> = {};

      majorPlan.semesters.forEach((semester, semesterIndex) => {
         const semesterColumn = this.createSemesterColumn(semesterIndex);
         graphAreaWrapper.embed(semesterColumn);
         semesterColumn.addTo(graph);

         if(options.showCredits) {
            const semesterCreditSumSection = this.createSemesterCreditSumSection(semester, semesterIndex, translations);
            semesterColumn.embed(semesterCreditSumSection);
            semesterCreditSumSection.addTo(graph);
         }

         semester.subjects.forEach(subject => {
            const subjectElement = this.createElementFromSubject(
               subject,
               chartPositioning.subjectPositions[subject.code],
               semesterIndex,
               options.showCredits,
               translations
            );
            semesterColumn.embed(subjectElement);
            subjectElement.addTo(graph);

            subjectConditionMap[subject.code]?.next?.forEach((nextSubject) => {
               if(!subjectPreconditionElementMap[nextSubject]) {
                  subjectPreconditionElementMap[nextSubject] = [];
               }

               subjectPreconditionElementMap[nextSubject].push(subjectElement);
            });

            subjectConditionMap[subject.code]?.parallel?.forEach((parallelSubjectCode) => {
               const linkableSubjectElement = subjectParallelConditionElementMap[subject.code]?.find((element: any) => element.attributes.subjectCode === parallelSubjectCode);
               if(linkableSubjectElement) {
                  this.createParallelConditionLink(subjectElement, linkableSubjectElement, this.getSemesterBackgroundColor(semesterIndex)).addTo(graph);
               }
            });

            subjectConditionMap[subject.code]?.parallelBy?.forEach((parallelBySubjectCode) => {
               if(!subjectParallelConditionElementMap[parallelBySubjectCode]) {
                  subjectParallelConditionElementMap[parallelBySubjectCode] = [];
               }

               subjectParallelConditionElementMap[parallelBySubjectCode].push(subjectElement);
            });

            subjectPreconditionElementMap[subject.code]?.forEach((element) => {
               this.createPreconditionLink(element, subjectElement).addTo(graph);
            });
         });
      });
      
      chartPositioning.additionalHorizontalLines?.forEach(lineY => this.drawSubjectSeparatorLine(lineY, majorPlan.semesters.length).addTo(graph));

      return graph;
   }

   private static initGraphAreaWrapper(name: string): dia.Element {
      const element = new shapes.standard.Rectangle({
         attrs: {
            body: {
               fill: this.BACKGROUND_COLOR,
               stroke: colors.fontColor,
               height: "100%",
               width: "100%"
            },
            label: {
               fontWeight: "bold",
               fontSize: this.HEADER_FONT_SIZE,
               letterSpacing: this.HEADER_LETTER_SPACING,
               fontFamily: "Montserrat",
               fill: colors.fontColor,
               text: name,
               x: "50%",
               y: this.HEADER_HEIGHT / 2,
               textVerticalAnchor: "middle",
               textAnchor: "middle"
            }
         }
      });

      return element;
   }

   private static createSemesterColumn(index: number): dia.Element {
      const element = new shapes.standard.Rectangle({
         position: {
            x: index * this.SEMESTER_WIDTH,
            y: this.SEMESTER_TOP_PADDING
         },
         attrs: {
            body: {
               fill: this.getSemesterBackgroundColor(index),
               stroke: colors.fontColor,
               width: this.SEMESTER_WIDTH,
               height: this.GRAPH_HEIGHT - this.SEMESTER_TOP_PADDING
            }
         }
      });

      return element;
   }

   private static createSemesterCreditSumSection(semester: MajorPlanSemester, index: number, translations: Record<string, string>): dia.Element {
      const creditsSum = semester.subjects.reduce((acc, subject) => acc + subject.credit, 0);
      const text = `${translations["creditSum"]}: ${creditsSum}`;

      const element = new shapes.standard.Rectangle({
         position: {
            x: (this.SEMESTER_WIDTH - this.SEMESTER_CREDIT_SUM_SECTION_WIDTH) / 2 + index * this.SEMESTER_WIDTH,
            y: this.HEADER_HEIGHT
         },
         attrs: {
            body: {
               stroke: colors.fontColor,
               fill: this.SEMESTER_CREDIT_SUM_SECTION_BACKGROUND_COLOR,
               width: this.SEMESTER_CREDIT_SUM_SECTION_WIDTH,
               height: this.SEMESTER_CREDIT_SUM_SECTION_HEIGHT
            },
            label: {
               fontWeight: "bold",
               fontSize: this.SUBJECT_LABEL_FONT_SIZE,
               lineHeight: this.SUBJECT_LABEL_LINE_HEIGHT,
               text,
               fill: colors.fontColor,
               x: this.SEMESTER_CREDIT_SUM_SECTION_WIDTH / 2,
               y: this.SEMESTER_CREDIT_SUM_SECTION_HEIGHT / 2,
               textVerticalAnchor: "middle",
               textAnchor: "middle"
            }
         }
      });

      return element;
   }

   private static createElementFromSubject(
      subject: UniversitySubject,
      y: number,
      x: number,
      showCredits: boolean,
      translations: Record<string, string>
   ): shapes.standard.Rectangle {
      if(x === undefined) {
         console.error(`Subject ${subject.code} has no position`);
         x = 0;
      }

      let text = subject.name;
      if(showCredits) {
         text += `\n(${translations["credit"]}: ${subject.credit})`;
      }

      const subjectElement = new shapes.standard.Rectangle({
         subjectCode: subject.code,
         position: {
            x: (this.SEMESTER_WIDTH - this.SUBJECT_WIDTH) / 2 + x * this.SEMESTER_WIDTH,
            y: this.HEADER_HEIGHT + this.SEMESTER_CREDIT_SUM_SECTION_HEIGHT + this.SUBJECT_GAP + y * (this.SUBJECT_HEIGHT + this.SUBJECT_GAP)
         },
         attrs: {
            body: {
               stroke: this.SUBJECT_STROKE_COLOR,
               width: this.SUBJECT_WIDTH,
               height: this.SUBJECT_HEIGHT
            },
            label: {
               fontSize: this.SUBJECT_LABEL_FONT_SIZE,
               lineHeight: this.SUBJECT_LABEL_LINE_HEIGHT,
               text,
               fill: colors.fontColor,
               x: this.SUBJECT_WIDTH / 2,
               y: this.SUBJECT_HEIGHT / 2,
               textVerticalAnchor: "middle",
               textAnchor: "middle"
            },
         }
      });

      return subjectElement;
   }

   private static createPreconditionLink(source: dia.Element, target: dia.Element): dia.Link {
      const link = new shapes.standard.Link({
         source,
         target,
         attrs: {
            line: {
               stroke: this.SUBJECT_CONNECTION_COLOR,
               strokeWidth: this.SUBJECT_CONNECTION_WIDTH
            }
         },
         vertices: [
            {
               x: source.position().x + this.SEMESTER_WIDTH - this.SUBJECT_CONNECTION_LINE_GAP,
               y: source.position().y + this.SUBJECT_HEIGHT / 2
            },
            {
               x: target.position().x - this.SUBJECT_CONNECTION_LINE_GAP,
               y: target.position().y + this.SUBJECT_HEIGHT / 2
            }
         ]
      });

      return link;
   }

   private static createParallelConditionLink(source: dia.Element, target: dia.Element, semesterBackgroundColor: string): dia.Link {
      const link = new shapes.standard.Link({
         source,
         target,
         attrs: {
            line: {
               stroke: this.SUBJECT_CONNECTION_COLOR,
               strokeWidth: this.SUBJECT_CONNECTION_WIDTH,
               targetMarker: {
                  fill: semesterBackgroundColor
               }
            }
         }
      });

      return link;
   }

   private static drawSubjectSeparatorLine(y: number, semesterNumber: number): dia.Element {
      const element = new shapes.standard.Rectangle({
         position: {
            x: 0,
            y: this.HEADER_HEIGHT + this.SEMESTER_CREDIT_SUM_SECTION_HEIGHT + this.SUBJECT_GAP / 2 + (y + 1) * (this.SUBJECT_HEIGHT + this.SUBJECT_GAP)
         },
         attrs: {
            body: {
               stroke: this.SUBJECT_STROKE_COLOR,
               strokeWidth: 0.5,
               strokeOpacity: 0.35,
               width: this.SEMESTER_WIDTH * semesterNumber,
               height: 1
            }
         }
      });

      return element;
   }

   private static getSemesterBackgroundColor(index: number): string {
      return index % 2 === 0 ? this.SEMESTER_EVEN_BACKGROUND_COLOR : this.SEMESTER_ODD_BACKGROUND_COLOR
   }
}
