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

  const juniorAdvisers = teachersData.adviserSubjectTeacher
    .map((adviser) => {
      const filteredSections = adviser.sections.filter((section) =>
        juniorHighGrades.includes(section.gradeLevel)
      );

      return {
        ...adviser,
        sections: filteredSections,
      };
    })
    .filter((adviser) => adviser.sections.length > 0);

  if (juniorAdvisers.length === 0) {
    return <p>No Junior Department advisers found.</p>;
  }

  return (
    <div className="space-y-8">
      {juniorHighGrades.map((gradeLevel) => {
        const advisersForGrade = juniorAdvisers.filter((adviser) =>
          adviser.sections.some((section) => section.gradeLevel === gradeLevel)
        );

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
              {advisersForGrade.map((adviser) => (
                <motion.div key={adviser._id} variants={itemVariants}>
                  <Card className="overflow-hidden border-t-4 border-t-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    {" "}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {adviser.fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {adviser.sections
                              .filter(
                                (section) => section.gradeLevel === gradeLevel
                              )
                              .map((section) => section.name)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                      {" "}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium"># of Students:</span>
                        <Badge variant="outline" className="ml-auto">
                          {/* TODO: Calculate students for relevant sections */}
                          N/A
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <h4 className="font-medium text-sm">
                            Subjects Taught in {gradeLevel}:
                          </h4>
                        </div>

                        {adviser.sections
                          .filter(
                            (section) => section.gradeLevel === gradeLevel
                          )
                          .map((section) => (
                            <React.Fragment key={section.id}>
                              {section.subjects.length > 0 ? (
                                section.subjects.map((subject) => (
                                  <div
                                    key={`${section.id}-${subject._id}`} // Unique key
                                    className="bg-muted/50 rounded-lg p-3 space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        {subject.subjectName}
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="font-normal"
                                      >
                                        <span>{section.name}</span>
                                      </Badge>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground pl-3 italic">
                                  No subjects listed for {section.name}.
                                </p>
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
