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

  if (!adviserSubjectTeachers || adviserSubjectTeachers.length === 0) {
    const anyJuniorAdviser = teachersData.adviserSubjectTeacher.some((adv) =>
      adv.sections.some((sec) => juniorHighGrades.includes(sec.gradeLevel))
    );
    if (!anyJuniorAdviser) {
      return <p>No Junior Department advisers (Grade 7-10) found.</p>;
    }
  }

  return (
    <div className="space-y-8">
      {juniorHighGrades.map((gradeLevel) => {
        // Filter advisers who advise at least one section in *this specific* grade level
        const advisersForGrade = adviserSubjectTeachers.filter((adviser) =>
          adviser.sections.some((section) => section.gradeLevel === gradeLevel)
        );

        // If no advisers advise for this specific grade, skip rendering this section
        if (advisersForGrade.length === 0) {
          return null;
        }

        return (
          <React.Fragment key={gradeLevel}>
            <h1 className="text-2xl font-bold border-b pb-2 mb-4">
              {gradeLevel} Advisers
            </h1>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {advisersForGrade.map((adviser) => {
                // Get only the advisory sections for *this specific grade level*
                const advisorySectionsInGrade = adviser.sections.filter(
                  (section) => section.gradeLevel === gradeLevel
                );

                return (
                  <motion.div
                    key={`${adviser._id}-${gradeLevel}`}
                    variants={itemVariants}
                  >
                    {" "}
                    {/* Ensure unique key per grade */}
                    <Card className="overflow-hidden border-t-4 border-t-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {adviser.fullName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {/* Display only advisory section names for this grade */}
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
                          <span className="font-medium"># of Students:</span>
                          <Badge variant="outline" className="ml-auto">
                            {/* Sum student count only for advisory sections in this grade */}
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

                          {/* --- MODIFIED SECTION START --- */}
                          {/* Iterate through the new allSubjectsTaught array */}
                          {adviser.allSubjectsTaught &&
                          adviser.allSubjectsTaught.length > 0 ? (
                            adviser.allSubjectsTaught.map((subjectInfo) => (
                              <div
                                // Use the unique key generated in the backend
                                key={subjectInfo.key}
                                className="bg-muted/50 rounded-lg p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    {/* Display subject name */}
                                    {subjectInfo.subjectName}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="font-normal"
                                  >
                                    {/* Display section name where this subject is taught */}
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
                          {/* --- MODIFIED SECTION END --- */}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
