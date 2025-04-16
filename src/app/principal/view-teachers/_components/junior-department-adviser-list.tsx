"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { Loader } from "@/components/loader";
import { juniorHighGrades } from "@/lib/constants";
import React from "react";

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

export function JuniorDepartmentAdviserList() {
  const teachersData = useQuery(api.principal.getTeachers);

  if (teachersData === undefined) {
    return <Loader />;
  }

  const adviserSubjectTeachers = teachersData.adviserSubjectTeacher;
  const subjectTeachersOnly = teachersData.subjectTeachers;

  const anyJuniorTeacher =
    adviserSubjectTeachers.some((adv) =>
      adv.sections.some((sec) => juniorHighGrades.includes(sec.gradeLevel))
    ) ||
    subjectTeachersOnly.some((st) =>
      st.allSubjectsTaught.some((subjInfo) =>
        juniorHighGrades.includes(subjInfo.gradeLevel)
      )
    );

  if (!anyJuniorTeacher) {
    return <p>No Junior Department teachers (Grade 7-10) found.</p>;
  }

  return (
    <div className="space-y-8">
      {juniorHighGrades.map((gradeLevel) => {
        // --- Filter Advisers for this Grade ---
        const advisersForGrade = adviserSubjectTeachers.filter((adviser) =>
          adviser.sections.some((section) => section.gradeLevel === gradeLevel)
        );

        // --- Filter Subject Teachers for this Grade ---
        const subjectTeachersForGrade = subjectTeachersOnly.filter((teacher) =>
          teacher.allSubjectsTaught.some(
            (subjectInfo) => subjectInfo.gradeLevel === gradeLevel
          )
        );

        // If no teachers of either type for this grade, skip rendering the grade section
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
                  {gradeLevel} Advisers
                </h1>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {advisersForGrade.map((adviser) => {
                    const advisorySectionsInGrade = adviser.sections.filter(
                      (section) => section.gradeLevel === gradeLevel
                    );

                    return (
                      <motion.div
                        key={`${adviser._id}-adviser-${gradeLevel}`} // Unique key
                        variants={itemVariants}
                      >
                        <Card className="overflow-hidden border-t-4 border-t-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {adviser.fullName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {advisorySectionsInGrade
                                    .map((section) => section.name)
                                    .join(", ")}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 flex-grow">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                # of Students:
                              </span>
                              <Badge variant="outline" className="ml-auto">
                                {advisorySectionsInGrade.reduce(
                                  (total, section) =>
                                    total + (section.studentCount || 0),
                                  0
                                )}
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <h4 className="font-medium text-sm">
                                  Subjects Taught:
                                </h4>
                              </div>
                              {adviser.allSubjectsTaught &&
                              adviser.allSubjectsTaught.length > 0 ? (
                                adviser.allSubjectsTaught.map((subjectInfo) => (
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
                                  No subjects listed for this adviser.
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
                  {" "}
                  {/* Added margin-top */}
                  {gradeLevel} Floating Teachers
                </h1>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {subjectTeachersForGrade.map((teacher) => (
                    <motion.div
                      key={`${teacher._id}-subject-${gradeLevel}`} // Unique key
                      variants={itemVariants}
                    >
                      <Card className="overflow-hidden border-t-4 border-t-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        {" "}
                        {/* Changed border color */}
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {teacher.fullName}
                              </h3>
                              {/* No advisory section info needed here */}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow">
                          {/* No student count needed here */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-primary" />{" "}
                              {/* Changed icon color */}
                              <h4 className="font-medium text-sm">
                                Subjects Taught:
                              </h4>
                            </div>
                            {teacher.allSubjectsTaught &&
                            teacher.allSubjectsTaught.length > 0 ? (
                              teacher.allSubjectsTaught.map((subjectInfo) => (
                                <div
                                  key={subjectInfo.key}
                                  className="bg-muted/50 rounded-lg p-3 space-y-2"
                                >
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="h-4 w-4 text-primary" />{" "}
                                      {/* Changed icon color */}
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
                                No subjects listed for this teacher.
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
