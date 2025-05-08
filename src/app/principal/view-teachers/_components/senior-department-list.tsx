"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, UserMinus, Users } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { Loader } from "@/components/loader";
import { seniorHighGrades } from "@/lib/constants";
import React, { useState } from "react";
import { SemesterFilterControl } from "./semester-filter-control";
import { GradeLevelsTypes } from "@/lib/types";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

interface SubjectInfo {
  key: string;
  subjectName: string;
  sectionName: string;
  gradeLevel: GradeLevelsTypes;
  subjectSemester?: string[]; // Semester from subjectTaught (e.g., ["1st semester"])
  sectionSemester?: string; // Semester from section (e.g., "1st semester")
}

interface Teacher {
  _id: string;
  fullName: string;
  sections?: Array<{
    _id: string;
    name: string;
    gradeLevel: string;
    studentCount?: number;
    semester?: string;
    droppedStudentCount?: number;
  }>;
  allSubjectsTaught: SubjectInfo[];
}

export function SeniorDepartmentList() {
  const teachersData = useQuery(api.principal.getTeachers);
  const [semesterFilter, setSemesterFilter] = useState<string>("all");

  if (teachersData === undefined) {
    return <Loader />;
  }

  const adviserSubjectTeachers =
    teachersData.adviserSubjectTeacher as Teacher[];
  const subjectTeachersOnly = teachersData.subjectTeachers as Teacher[];

  const filterSubjectsByTeachingSemester = (
    subjects: SubjectInfo[]
  ): SubjectInfo[] => {
    if (semesterFilter === "all") return subjects;
    if (!subjects) return [];

    return subjects.filter((subject) =>
      subject.subjectSemester?.includes(semesterFilter)
    );
  };

  const doesTeacherTeachInFilter = (
    teacher: Teacher,
    gradeLevel: string
  ): boolean => {
    if (!teacher.allSubjectsTaught) return false;
    const subjectsInGrade = teacher.allSubjectsTaught.filter(
      (subj) => subj.gradeLevel === gradeLevel
    );
    const filteredSubjects = filterSubjectsByTeachingSemester(subjectsInGrade);
    return filteredSubjects.length > 0;
  };

  const anySeniorTeacherInFilter = [
    ...adviserSubjectTeachers,
    ...subjectTeachersOnly,
  ].some((teacher) =>
    seniorHighGrades.some((grade) => doesTeacherTeachInFilter(teacher, grade))
  );

  if (!anySeniorTeacherInFilter) {
    return (
      <div className="space-y-4">
        <SemesterFilterControl
          semesterFilter={semesterFilter}
          setSemesterFilter={setSemesterFilter}
        />
        <p>
          No Senior Department teachers (Grade 11-12) found teaching in the
          selected semester.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Semester Filter Controls */}
      <SemesterFilterControl
        semesterFilter={semesterFilter}
        setSemesterFilter={setSemesterFilter}
      />

      {seniorHighGrades.map((gradeLevel) => {
        // --- Filter Advisers who TEACH in this Grade and Semester ---
        const advisersForGrade = adviserSubjectTeachers.filter((adviser) =>
          doesTeacherTeachInFilter(adviser, gradeLevel)
        );

        // --- Filter Subject Teachers who TEACH in this Grade and Semester ---
        const subjectTeachersForGrade = subjectTeachersOnly.filter((teacher) =>
          doesTeacherTeachInFilter(teacher, gradeLevel)
        );

        // If no teachers TEACH in this grade and semester, skip rendering
        if (
          advisersForGrade.length === 0 &&
          subjectTeachersForGrade.length === 0
        ) {
          return null;
        }

        return (
          <React.Fragment key={gradeLevel}>
            {/* --- Adviser Section --- */}
            {advisersForGrade.length > 0 && (
              <>
                <h1 className="text-2xl font-bold border-b pb-2 mb-4 mt-6">
                  {gradeLevel} Advisers Teaching in{" "}
                  {semesterFilter === "all" ? "Any Semester" : semesterFilter}
                </h1>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {advisersForGrade.map((adviser) => {
                    // Filter advisory sections for DISPLAY based on section semester
                    const advisorySectionsToDisplay =
                      adviser.sections?.filter(
                        (section) =>
                          section.gradeLevel === gradeLevel &&
                          (semesterFilter === "all" ||
                            section.semester === semesterFilter ||
                            !section.semester) // Keep original display logic for sections
                      ) ?? [];

                    // Filter subjects taught for DISPLAY based on teaching semester
                    const subjectsTaughtToDisplay =
                      filterSubjectsByTeachingSemester(
                        adviser.allSubjectsTaught
                      );

                    const totalDroppedStudents =
                      advisorySectionsToDisplay.reduce(
                        (total, section) =>
                          total + (section.droppedStudentCount || 0),
                        0
                      );

                    return (
                      <motion.div
                        key={`${adviser._id}-adviser-${gradeLevel}`}
                        variants={itemVariants}
                      >
                        <Card className="overflow-hidden border-t-4 border-t-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                          <CardHeader className="pb-2">
                            {/* ... Adviser Name ... */}
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {adviser.fullName}
                                </h3>
                                {/* Display advisory sections relevant to the filter */}
                                <p className="text-sm text-muted-foreground">
                                  {advisorySectionsToDisplay.length > 0
                                    ? `Adviser: ${advisorySectionsToDisplay.map((section) => section.name).join(", ")}`
                                    : "No advisory sections in this semester"}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 flex-grow">
                            {/* Display student count for the relevant advisory sections */}
                            {advisorySectionsToDisplay.length > 0 && (
                              <>
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-primary" />
                                  <span className="font-medium">
                                    # of Students:
                                  </span>
                                  <Badge variant="outline" className="ml-auto">
                                    {advisorySectionsToDisplay.reduce(
                                      (total, section) =>
                                        total + (section.studentCount || 0),
                                      0
                                    )}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <UserMinus className="h-4 w-4 text-destructive" />
                                  <span className="font-medium">
                                    # of Dropped:
                                  </span>
                                  <Badge
                                    variant="destructive"
                                    className="ml-auto"
                                  >
                                    {totalDroppedStudents}
                                  </Badge>
                                </div>
                              </>
                            )}

                            {/* Display Subjects Taught based on teaching semester filter */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <h4 className="font-medium text-sm">
                                  Subjects Taught (
                                  {semesterFilter === "all"
                                    ? "All"
                                    : semesterFilter}
                                  ):
                                </h4>
                              </div>
                              {subjectsTaughtToDisplay.length > 0 ? (
                                subjectsTaughtToDisplay.map((subjectInfo) => (
                                  <div
                                    key={subjectInfo.key}
                                    className="bg-muted/50 rounded-lg p-3 space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        {subjectInfo.subjectName}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="font-normal"
                                      >
                                        <span>{subjectInfo.sectionName}</span>
                                      </Badge>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground pl-6 italic">
                                  No subjects taught by this adviser in{" "}
                                  {semesterFilter}.
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </>
            )}

            {/* --- Subject Teacher Section --- */}
            {subjectTeachersForGrade.length > 0 && (
              <>
                <h1 className="text-2xl font-bold border-b pb-2 mb-4 mt-8">
                  {gradeLevel} Subject Teachers Teaching in{" "}
                  {semesterFilter === "all" ? "Any Semester" : semesterFilter}
                </h1>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {subjectTeachersForGrade.map((teacher) => {
                    // Filter subjects taught for DISPLAY based on teaching semester
                    const subjectsTaughtToDisplay =
                      filterSubjectsByTeachingSemester(
                        teacher.allSubjectsTaught
                      ).filter((subj) => subj.gradeLevel === gradeLevel); // Also filter by grade for display

                    // This check should be redundant due to outer filter, but safe to keep
                    if (subjectsTaughtToDisplay.length === 0) return null;

                    return (
                      <motion.div
                        key={`${teacher._id}-subject-${gradeLevel}`}
                        variants={itemVariants}
                      >
                        <Card className="overflow-hidden border-t-4 border-t-secondary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                          <CardHeader className="pb-2">
                            {/* ... Teacher Name ... */}
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {teacher.fullName}
                                </h3>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 flex-grow">
                            {/* Display Subjects Taught based on teaching semester filter */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-secondary" />
                                <h4 className="font-medium text-sm">
                                  Subjects Taught (
                                  {semesterFilter === "all"
                                    ? "All"
                                    : semesterFilter}
                                  ):
                                </h4>
                              </div>
                              {subjectsTaughtToDisplay.map((subjectInfo) => (
                                <div
                                  key={subjectInfo.key}
                                  className="bg-muted/50 rounded-lg p-3 space-y-2"
                                >
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="h-4 w-4 text-secondary" />
                                      {subjectInfo.subjectName}
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="font-normal"
                                    >
                                      <span>{subjectInfo.sectionName}</span>
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
