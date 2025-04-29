"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapehComponent,
  MapehMainSubject,
  Quarter,
  QuarterAverages,
  QuarterGrades,
  SectionStudentsType,
  SubjectType,
  ValidCounts,
} from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import React, { useMemo, useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { sub } from "date-fns";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface PromoteDialogProps {
  student: SectionStudentsType;
  promoteDialog: boolean;
  setPromoteDialog: (value: boolean) => void;
}

function PromoteDialog({
  student,
  promoteDialog,
  setPromoteDialog,
}: PromoteDialogProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isSHS =
    student.section.gradeLevel === "Grade 11" ||
    student.section.gradeLevel === "Grade 12";
  const fullName = `${student.lastName}, ${student.firstName} ${student.middleName}`;
  const saveFinalGrades = useMutation(api.finalGrades.create);
  const promoteStudent = useMutation(api.promotion.promote);
  const subjects = useQuery(api.students.getSubjects, {
    sectionSubjects: student.section.subjects,
    studentId: student._id,
  });

  const quarters: Quarter[] = ["1st", "2nd", "3rd", "4th"];
  const calculateMapehAverage = (
    mapehComponents: MapehComponent[]
  ): QuarterGrades => {
    if (!mapehComponents || mapehComponents.length === 0)
      return {} as QuarterGrades;

    const quarterAverages: QuarterAverages = {
      "1st": 0,
      "2nd": 0,
      "3rd": 0,
      "4th": 0,
    };

    const validComponentsCount: ValidCounts = {
      "1st": 0,
      "2nd": 0,
      "3rd": 0,
      "4th": 0,
    };

    mapehComponents.forEach((component) => {
      quarters.forEach((quarter) => {
        // First check for intervention grade, if not available use regular grade
        const grade =
          component?.interventions?.[quarter]?.grade ??
          component?.grades?.[quarter];
        if (typeof grade === "number") {
          quarterAverages[quarter] += grade;
          validComponentsCount[quarter]++;
        }
      });
    });

    return {
      "1st": validComponentsCount["1st"]
        ? Math.round(quarterAverages["1st"] / validComponentsCount["1st"])
        : undefined,
      "2nd": validComponentsCount["2nd"]
        ? Math.round(quarterAverages["2nd"] / validComponentsCount["2nd"])
        : undefined,
      "3rd": validComponentsCount["3rd"]
        ? Math.round(quarterAverages["3rd"] / validComponentsCount["3rd"])
        : undefined,
      "4th": validComponentsCount["4th"]
        ? Math.round(quarterAverages["4th"] / validComponentsCount["4th"])
        : undefined,
    };
  };

  function calculateQuarterlyAverage(
    grades: QuarterGrades | undefined
  ): number | null {
    if (!grades) return null;
    const validGrades = Object.values(grades).filter(
      (grade): grade is number => grade !== undefined
    );
    if (validGrades.length === 0) return null;
    const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
    // Only round to 2 decimal places for general average
    return Math.round((sum / validGrades.length) * 100) / 100;
  }
  // Organize subjects with MAPEH at the bottom
  const organizedSubjects = useMemo(() => {
    if (!subjects) return [];

    // Separate MAPEH components and other subjects
    const mapehComponents = subjects.filter(
      (subject) =>
        subject?.subjectName &&
        ["Music", "Arts", "Physical Education", "Health"].includes(
          subject.subjectName
        )
    ) as MapehComponent[];

    // Extract MAPEH id from the subject ID
    const mapehId = mapehComponents[0]?._id.split("-")[0];

    const otherSubjects = subjects.filter(
      (subject) =>
        subject?.subjectName &&
        !["Music", "Arts", "Physical Education", "Health", "MAPEH"].includes(
          subject.subjectName
        )
    ) as MapehComponent[];

    // If there are no MAPEH components, just return other subjects
    if (mapehComponents.length === 0) {
      return otherSubjects as SubjectType[];
    }

    // Calculate MAPEH average
    const mapehAverage = calculateMapehAverage(mapehComponents);

    // Create MAPEH main entry only if all components exist
    const orderedComponents = ["Music", "Arts", "Physical Education", "Health"];
    const sortedMapehComponents = orderedComponents
      .map((componentName) =>
        mapehComponents.find(
          (comp) =>
            comp.subjectName === componentName ||
            (componentName === "Physical Education" &&
              comp.subjectName === "Physical Education (PE)")
        )
      )
      .filter((comp): comp is MapehComponent => comp !== undefined)
      .map((comp) => ({
        ...comp,
        isMapehComponent: true,
        subjectName:
          comp.subjectName === "Physical Education"
            ? "Physical Education (PE)"
            : comp.subjectName,
      }));

    // Only include MAPEH main entry if all components are present
    const mapehEntry: MapehMainSubject | null =
      mapehId && sortedMapehComponents.length === orderedComponents.length
        ? {
            _id: mapehId,
            subjectName: "MAPEH",
            grades: mapehAverage,
            isMapehMain: true,
          }
        : null;
    // Return organized subjects with MAPEH and its components at the bottom
    return [
      ...otherSubjects,
      ...(mapehEntry ? [mapehEntry] : []),
      ...sortedMapehComponents,
    ] as SubjectType[];
  }, [subjects]);

  function getSubjectsBelowPassing(): {
    subject: SubjectType;
    average: number | null;
  }[] {
    if (!subjects || subjects.length === 0) return [];

    return organizedSubjects
      .filter((subject) => {
        // Exclude MAPEH components and subjects with no grades
        if ("isMapehComponent" in subject && subject.isMapehComponent)
          return false;
        if (
          !subject.grades ||
          Object.values(subject.grades).every((grade) => grade === undefined)
        )
          return false;
        return true;
      })
      .map((subject) => {
        const average = calculateQuarterlyAverage(
          "isMapehMain" in subject && subject.isMapehMain
            ? subject.grades
            : {
                "1st":
                  "interventions" in subject
                    ? subject.interventions?.["1st"]?.grade !== 0
                      ? subject.interventions?.["1st"]?.grade
                      : subject.grades?.["1st"]
                    : subject.grades?.["1st"],
                "2nd":
                  "interventions" in subject
                    ? subject.interventions?.["2nd"]?.grade !== 0
                      ? subject.interventions?.["2nd"]?.grade
                      : subject.grades?.["2nd"]
                    : subject.grades?.["2nd"],
                "3rd":
                  "interventions" in subject
                    ? subject.interventions?.["3rd"]?.grade !== 0
                      ? subject.interventions?.["3rd"]?.grade
                      : subject.grades?.["3rd"]
                    : subject.grades?.["3rd"],
                "4th":
                  "interventions" in subject
                    ? subject.interventions?.["4th"]?.grade !== 0
                      ? subject.interventions?.["4th"]?.grade
                      : subject.grades?.["4th"]
                    : subject.grades?.["4th"],
              }
        );
        return { subject, average };
      });
  }

  function calculateGeneralAverage(): number | null {
    if (!subjects || subjects.length === 0) return null;

    let total = 0;
    let count = 0;

    subjects.forEach((subject) => {
      // For each quarter, pick the intervention grade if it exists, otherwise the regular grade
      const modifiedGrades = {
        "1st":
          subject?.interventions?.["1st"]?.grade ?? subject?.grades?.["1st"],
        "2nd":
          subject?.interventions?.["2nd"]?.grade ?? subject?.grades?.["2nd"],
        "3rd":
          subject?.interventions?.["3rd"]?.grade ?? subject?.grades?.["3rd"],
        "4th":
          subject?.interventions?.["4th"]?.grade ?? subject?.grades?.["4th"],
      } as const;
      const subjectAvg = calculateQuarterlyAverage(modifiedGrades);
      if (subjectAvg !== null) {
        total += subjectAvg;
        count += 1;
      }
    });

    return count > 0 ? total / count : null;
  }

  const generalAverage = calculateGeneralAverage();
  const subjectGrades = getSubjectsBelowPassing();
  const failedSubjects = getSubjectsBelowPassing().filter(
    ({ average }) => average !== null && average < 75
  ); // Exclude subjects with average >= 75

  const handlePromote = () => {
    setIsLoading(true);
    const noOfFailedSub = failedSubjects.length;
    const genAve = generalAverage === null ? undefined : generalAverage;
    try {
      subjectGrades.map(async (subject) => {
        if (subject.average) {
          await saveFinalGrades({
            studentId: student._id,
            sectionId: student.section._id,
            subjectTaughtId: subject.subject._id as Id<"subjectTaught">,
            generalAverage: subject.average,
            forRemedial: subject.average <= 74,
          });
        }
      });
      toast.promise(
        promoteStudent({
          studentId: student._id,
          sectionId: student.section._id,
          noOfFailedSub: noOfFailedSub,
          isSHS: isSHS,
          generalAverage: genAve,
        }),
        {
          loading: "Analyzing Promotion...",
          success: (data) => {
            return (
              <div>
                Success:{" "}
                <span className="capitalize"> {data?.promotionType}</span>
              </div>
            );
          },
          error: (error) => {
            const errorMes = error.data ? error.data : "Something went wrong!";
            return (
              <div>
                Invalid: <span className="capitalize"> {errorMes}</span>
              </div>
            );
          },
        }
      );
      toast.success("Created");
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error}`);
    }

    setPromoteDialog(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={promoteDialog} onOpenChange={setPromoteDialog}>
      <DialogContent>
        <DialogTitle>Promote to the next grade level?</DialogTitle>
        {failedSubjects.length !== 0 && failedSubjects.length >= 1 ? (
          isSHS ? (
            <>
              <div className="space-y-3">
                <p>
                  <strong className="capitalize">{fullName}</strong> has{" "}
                  <strong>failed ({failedSubjects.length})</strong> of his
                  subjects.
                </p>
                <h1>Failed Subject(s):</h1>
                {failedSubjects.map((fs) => (
                  <div key={fs.subject._id} className="">
                    <h1 className="pl-5">
                      -{" "}
                      <strong>
                        {fs.subject.subjectName} - ({fs.average})
                      </strong>
                    </h1>
                  </div>
                ))}
                <p className="text-sm text-justify">
                  * Must pass remedial classes for failed competencies in the
                  subjects or learning areas to be allowed to enroll in the next
                  semester. Otherwise, the learner must retake the subjects
                  failed.
                </p>
              </div>
              <DialogFooter>
                <Button
                  disabled={isLoading || generalAverage === null}
                  variant={"default"}
                  onClick={handlePromote}
                  className=" text-white"
                >
                  Conditionally Promote
                </Button>
              </DialogFooter>
            </>
          ) : failedSubjects.length >= 3 ? (
            <>
              <div className="space-y-3">
                <p>
                  <strong className="capitalize">{fullName}</strong> has{" "}
                  <strong>failed ({failedSubjects.length})</strong> of his
                  subjects.
                </p>
                <h1>Failed Subject(s):</h1>
                {failedSubjects.map((fs) => (
                  <div key={fs.subject._id} className="">
                    <h1 className="pl-5">
                      -{" "}
                      <strong>
                        {fs.subject.subjectName} - ({fs.average})
                      </strong>
                    </h1>
                  </div>
                ))}
                <p className="text-sm text-justify">
                  * Did not meet expectations in three or more learning areas.
                  Retained in the same grade level.
                </p>
              </div>
              <DialogFooter>
                <Button
                  disabled={isLoading || generalAverage === null}
                  variant={"destructive"}
                  onClick={handlePromote}
                  className=" text-white"
                >
                  Retain
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <p>
                  <strong className="capitalize">{fullName}</strong> has{" "}
                  <strong>failed ({failedSubjects.length})</strong> of his
                  subjects.
                </p>
                <h1>Failed Subject(s):</h1>
                {failedSubjects.map((fs) => (
                  <div key={fs.subject._id} className="">
                    <h1 className="pl-5">
                      -{" "}
                      <strong>
                        {fs.subject.subjectName} - ({fs.average})
                      </strong>
                    </h1>
                  </div>
                ))}
                <p className="text-sm text-justify">
                  *Must enroll in remedial classes for that subject(s) to
                  improve their grade
                </p>
              </div>
              <DialogFooter>
                <Button
                  disabled={isLoading || generalAverage === null}
                  variant={"default"}
                  onClick={handlePromote}
                  className=" text-white"
                >
                  Conditionally Promote
                </Button>
              </DialogFooter>
            </>
          )
        ) : (
          <>
            <p className="capitalize">
              {fullName} has passed all his subjects.
            </p>
            <DialogFooter>
              <Button
                variant={"secondary"}
                className=""
                onClick={() => setPromoteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading || generalAverage === null}
                variant={"default"}
                onClick={handlePromote}
                className=" text-white"
              >
                Promote
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PromoteDialog;
