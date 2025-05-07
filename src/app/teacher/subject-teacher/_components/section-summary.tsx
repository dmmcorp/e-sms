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
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from "@/components/ui/scroll-area";

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

  console.log(loads)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
      {loads.map((load) => (
        <Card key={load._id} className="">
          <CardContent>
            <div className="w-full">
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
                      <span className="text-sm text-muted-foreground">{load.subComponent} Component</span>
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
                      <div className="flex flex-col items-start justify-start min-h-56 min-w-56 p-2">
                        <h1 className="text-sm font-semibold text-center w-full mb-2">Dropped</h1>
                        {load.droppedStud.length !== 0 ? load.droppedStud.map((student, index) => (
                          <div  key={"dropped" + student.student?._id}  className="flex justify-between w-full">
                            <h3 className="capitalize line-clamp-1 text-ellipsis">
                              {index + 1}.{student.student?.lastName},{" "}
                              {student.student?.firstName}{" "}
                              {student.student?.middleName?.charAt(0)}{" "}
                            </h3>
                        
                          </div>  
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
                      <div className="flex flex-col items-start justify-start min-h-56 min-w-56 p-2">
                        <h1 className="text-sm font-semibold text-center w-full mb-2">Returning</h1>
                        {load.returningStud.length !== 0 ? load.returningStud.map((student, index)=>(
                          
                          <div  key={"returning" + student.student?._id}  className="flex justify-between w-full">
                          <h3 className="capitalize line-clamp-1 text-ellipsis">
                            {index + 1}.{student.student?.lastName},{" "}
                            {student.student?.firstName}{" "}
                            {student.student?.middleName?.charAt(0)}{" "}
                          </h3>
                        
                        </div>  
                          )): (
                            <div className="flex items-center justify-center text-center w-full h-full">
                              No returning students.
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
                      <div className="flex flex-col items-start justify-start min-h-56 min-w-56 p-2">
                        <h1 className="text-sm font-semibold text-center w-full mb-2">Needs Intervention</h1>
                        {load.needsInterventions.length !== 0 ? (
                          
                          load.needsInterventions.map((student, index) => (
                          <div  key={"intervention" + student.student?._id}  className="flex justify-between w-full">
                            <h3 className="capitalize line-clamp-1 text-ellipsis">
                              {index + 1}.{student.student?.lastName},{" "}
                              {student.student?.firstName}{" "}
                              {student.student?.middleName?.charAt(0)}{" "}
                            </h3>
                          
                          </div>
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
              <Separator className="my-2" />
              <h3 className="text-lg font-semibold mb-3">Students Requiring Intervention</h3>
   
              <ScrollArea className="h-[200px] max-w-full">
                <Table className="w-full border-x-gray-50 border-x shadow-md h-[100px] max-h-[100px] overflow-auto">
                  <TableHeader className="bg-primary ">
                  <TableRow className="font-semibold">
                      <TableHead className="text-muted max-w-[25%]">Student Name</TableHead>
                      <TableHead className="text-muted max-w-[25%]">Interventions Done</TableHead>
                      <TableHead className="text-muted max-w-[25%]">Modified Grade</TableHead>
                      <TableHead className="text-muted max-w-[25%]">Quarter/Semester</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody className="  ">
                   
                      {load.needsInterventionsAll.length === 0 ?
                       <TableRow>
                        <TableCell colSpan={4} className="text-center " >No failed students.</TableCell>
                      </TableRow>
                      : load.needsInterventionsAll.map((load) => (
                        <TableRow key={load.studentId}>
                        <TableCell className="font-medium capitalize max-w-[25%] text-wrap">{`${load.student?.lastName}, ${load.student?.firstName} ${load.student?.middleName}`}</TableCell>
                        <TableCell>{load.interventionUsed && load.interventionUsed.map((intervention)=>(
                        <div>{intervention}</div>
                        ))}</TableCell>
                        <TableCell className="text-center  max-w-[25%] text-wrap">
                          <div className="flex flex-col items-center">
                          <span className="text-sm text-muted-foreground line-through">{load.quarterlyGrade}</span>
                          {load.interventionGrade ? (
                          <Badge variant={load.interventionGrade >= 75 ? "default" : "destructive"} className="mt-1">
                            {load.interventionGrade}
                          </Badge>
                          ): (
                          <span>No modified grade.</span>
                          )}
                          </div>
                        </TableCell>
                        <TableCell className=" max-w-[25%] text-wrap">{load.teachingLoad.quarter} {load.teachingLoad.semester ? `- ${load.teachingLoad.semester}` : ""}</TableCell>
                        </TableRow>
                      ))}
               
                  </TableBody>
                
                </Table>
              </ScrollArea>
              <Separator className="my-2" />
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
