"use client";
import { QuarterType, SemesterType, SubjectTypes } from "@/lib/types";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import Chart from "./chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BiCaretRight } from "react-icons/bi";
import { Separator } from "@/components/ui/separator";
import CustomTooltip from "@/components/custom-tooltip";
import Loading from "../../loading";

interface SectionSummaryProps {
  selectedSubject: SubjectTypes | undefined;
  selectedSem: SemesterType | undefined;
  selectedQtr: QuarterType;
}

function SectionSummary({
  selectedSubject,
  selectedSem,
  selectedQtr,
}: SectionSummaryProps) {
  // Fetch the teaching loads using the useQuery hook from Convex API
  const loads = useQuery(api.teachingLoad.getTeachingLoad, {
    subjectTaughtId: selectedSubject?._id, // Pass the selected subject ID
    quarter: selectedQtr, // Pass the selected quarter
    semester: selectedSem, // Pass the selected semester
  });

  // Display a loading message while the data is being fetched
  if (!loads) return <Loading />;

  // Display a message if there is no assigned sections
  if (loads?.length === 0) {
    return <div className="">There is no assigned section.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
      {loads.map((load) => (
        <Card key={load._id} className="">
          <CardContent>
            <div className="">
              <div className="">
                <Chart classRecords={load.classRecords} />
              </div>
              <div className="grid grid-cols-2 py-2">
                <h1 className="text-lg md:text-xl  font-semibold">
                  {load.subject?.gradeLevel}
                </h1>
                <div className="text-right">
                  <h1 className="text-lg md:text-xl font-semibold">
                    {load.section?.name}
                  </h1>
                  {load.subject?.subjectName.toLowerCase() === 'mapeh' && load.subComponent && (
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">{load.subComponent}</span>
                    </div>
                  )}
                </div>
              </div>
              <Separator className="my-2" />

              <div className="grid grid-cols-2 text-muted-foreground gap-3 mb-5">
                <h1 className="">Students: {load.classRecords?.length}</h1>
                <div className="">
                  {/* // Display the number of dropped students with a tooltip showing names of the students} */}
                  <CustomTooltip
                    trigger={<h1 className="">Dropped: {load.droppedStud.length}</h1>}
                    content={
                      <div className="flex items-center justify-center min-h-56 min-w-56">
                        {load.droppedStud.length !== 0 ? load.droppedStud.map((student, index) => (
                          <h3 key={"dropped" + student.student?._id}>{index + 1}.{student.student?.lastName}, {student.student?.firstName} {student.student?.middleName?.charAt(0) || ""} </h3>
                        )) : (
                          <div className="flex items-center justify-center text-center w-full h-full">
                            No students has been dropped for this quarter.
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
                <div className="">
                  {/* // Display the number of returning students with a tooltip showing names of the students} */}
                  <CustomTooltip
                    trigger={<h1 className="">Returning: {load.returningStud.length}</h1>}
                    content={
                      <div className="flex items-center justify-center min-h-56 min-w-56">
                        {load.returningStud.length !== 0 ? load.returningStud.map((student, index) => (
                          <h3 key={"returning" + student.student?._id}>{index + 1}.{student.student?.lastName}, {student.student?.firstName} {student.student?.middleName?.charAt(0) || ""} </h3>
                        )) : (
                          <div className="flex items-center justify-center text-center w-full h-full">
                            No students have returned for this quarter.
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
                <div className="">
                  {/* Display the number of students needing interventions with a tooltip showing names of the students */}
                  <CustomTooltip
                    trigger={
                      <h1 className="">
                        Interventions: {load.needsInterventions.length}
                      </h1>
                    }
                    content={
                      <div className="flex items-center justify-center min-h-56 min-w-56">
                        {load.needsInterventions.length !== 0 ? (
                          load.needsInterventions.map((student, index) => (
                            <h3
                              key={"needsIntervention" + student.student?._id}
                            >
                              {index + 1}. {student.student?.lastName},{" "}
                              {student.student?.firstName}{" "}
                              {student.student?.middleName?.charAt(0)}{" "}
                            </h3>
                          ))
                        ) : (
                          <div className="flex items-center justify-center text-center w-full h-full">
                            No students need intervention for this quarter.
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Link href={`/teacher/subject-teacher/${load._id}`}>
                  <Button variant={"default"} className="hover:cursor-pointer">
                    Class Record <BiCaretRight />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SectionSummary;
