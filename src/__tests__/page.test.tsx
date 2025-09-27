import React from "react";
import { render, screen } from "@testing-library/react";
import { QuarterGrades, SectionStudentsType, SubjectType } from "@/lib/types";

const jhsSubjects: {
  _id: string;
  subjectName: string;
  grades: QuarterGrades;
  interventions: {
    "1st"?: { grade: number | undefined; used: string[]; remarks: string };
    "2nd"?: { grade: number | undefined; used: string[]; remarks: string };
    "3rd"?: { grade: number | undefined; used: string[]; remarks: string };
    "4th"?: { grade: number | undefined; used: string[]; remarks: string };
  };
  isMapehComponent: boolean;
}[] = [
  {
    _id: "jhs-001",
    subjectName: "Mathematics",
    grades: { "1st": 75, "2nd": 87, "3rd": 90, "4th": 92 },
    interventions: {
      "1st": {
        grade: undefined,
        used: ["peer tutoring"],
        remarks: "Needs more algebra practice",
      },
    },
    isMapehComponent: false,
  },
  {
    _id: "jhs-002",
    subjectName: "English",
    grades: { "1st": 88, "2nd": 86, "3rd": 89, "4th": 91 },
    interventions: {},
    isMapehComponent: false,
  },
  {
    _id: "jhs-003",
    subjectName: "MAPEH - PE",
    grades: { "1st": 85, "2nd": 87, "3rd": 88, "4th": 90 },
    interventions: {},
    isMapehComponent: true,
  },
];

const shsSubjects: {
  _id: string; // replace with Id<"subjectTaught"> if you have it
  subjectName: string;
  category: "core" | "specialized" | "applied" | undefined;
  semester: ("1st semester" | "2nd semester")[] | undefined;
  grades: QuarterGrades;
  interventions: {
    "1st"?: { grade: number | undefined; used: string[]; remarks: string };
    "2nd"?: { grade: number | undefined; used: string[]; remarks: string };
    "3rd"?: { grade: number | undefined; used: string[]; remarks: string };
    "4th"?: { grade: number | undefined; used: string[]; remarks: string };
  };
}[] = [
  {
    _id: "shs-001",
    subjectName: "Oral Communication",
    category: "core",
    semester: ["1st semester"], // ✅ only quarters 1 & 2
    grades: { "1st": 74, "2nd": 92, "3rd": undefined, "4th": undefined },
    interventions: {
      "1st": {
        grade: 90,
        used: ["speech drills"],
        remarks: "Good articulation",
      },
    },
  },
  {
    _id: "shs-002",
    subjectName: "Programming 1",
    category: "specialized",
    semester: ["2nd semester"], // ✅ only quarters 3 & 4
    grades: { "1st": 75, "2nd": 92, "3rd": undefined, "4th": undefined },
    interventions: {
      "1st": {
        grade: 76,
        used: ["project-based tasks"],
        remarks: "Excellent coding skills",
      },
    },
  },
];

function hasUncompliedIntervention(): boolean {
  if (!shsSubjects || shsSubjects.length === 0) return false;

  // For each subject, check if there is an intervention for a quarter and its grade is missing
  return shsSubjects.some((subject) => {
    // Only check main subjects (not MAPEH components)
    const isMainSubject = !(
      "isMapehComponent" in subject && subject.isMapehComponent
    );

    if (!isMainSubject || !subject.interventions) return false;

    // For each quarter, if there is an intervention object and its grade is missing, return true
    return ["1st", "2nd", "3rd", "4th"].some((quarter) => {
      const intervention =
        subject.interventions?.[quarter as "1st" | "2nd" | "3rd" | "4th"];
      return (
        intervention !== undefined &&
        (intervention.grade === undefined || intervention.grade === null)
      );
    });
  });
}

describe("hasUncompliedIntervention", () => {
  it("returns true if there is a subject with intervention but no grade", () => {
    shsSubjects[0].interventions["1st"]!.grade = undefined;
    expect(hasUncompliedIntervention()).toBe(true);
  });
  it("returns false if all subjects with interventions have grades", () => {
    // Modify the data to ensure all interventions have grades
    shsSubjects[0].interventions["1st"]!.grade = 85; // Ensure grade is present
    expect(hasUncompliedIntervention()).toBe(false);
  });
});
