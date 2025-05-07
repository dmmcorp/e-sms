"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { QuarterType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import Chart from "./chart";
import CustomTooltip from "@/components/custom-tooltip";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";

interface JuniorHighProps {
  sectionId: Id<"sections">;
  selectedQtr: QuarterType;
}



function JuniorHigh({ sectionId, selectedQtr }: JuniorHighProps) {

  const loads = useQuery(api.teachingLoad.getLoadUsingSectionId, {
    sectionId: sectionId,
    quarter: selectedQtr,
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
      {loads?.length === 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-2 text-center py-10 text-gray-500">
          <p>No subjects found for the selected quarter.</p>
        </div>
      )}
      {loads?.map((teachingLoad) => (
        <div key={teachingLoad._id} className="">

        <Card  className="">
          <CardContent>
            <div className="">
              <Chart
                classRecords={teachingLoad.classRecords}
                label={teachingLoad.subject.subjectName}
                subComponent={teachingLoad.subComponent}
              />
            </div>
          <Separator className='my-2'/>
          <h3 className="text-lg font-semibold mb-3">Students Requiring Intervention</h3>
          <ScrollArea className="h-[200px] max-w-full">
            <Table className="w-full border-x-gray-50 border-x shadow-md h-[100px] max-h-[100px] overflow-auto">
              <TableHeader className="bg-primary ">
              <TableRow className="font-semibold">
                  <TableHead className="text-muted max-w-[25%]">Student Name</TableHead>
                  <TableHead className="text-muted max-w-[25%]">Interventions Done</TableHead>
                  <TableHead className="text-muted max-w-[25%]">Modified Grade</TableHead>
                  <TableHead className="text-muted max-w-[25%]">Quarter/Semester</TableHead>
                  <TableHead className="text-muted max-w-[25%]">Subject</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody className="  ">
                
                  {teachingLoad.needsInterventionsAll.length === 0 ?
                    <TableRow>
                    <TableCell colSpan={4} className="text-center " >No failed students for this quarter.</TableCell>
                  </TableRow>
                  : teachingLoad.needsInterventionsAll.map((load) => (
                    <TableRow key={load.studentId}>
                    <TableCell className="font-medium capitalize max-w-[20%] text-wrap">{`${load.student?.lastName}, ${load.student?.firstName} ${load.student?.middleName}`}</TableCell>
                    <TableCell>{load.interventionUsed && load.interventionUsed.map((intervention)=>(
                    <div>{intervention}</div>
                    ))}</TableCell>
                    <TableCell className="text-center  max-w-[20%] text-wrap">
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
                    <TableCell className=" max-w-[20%] text-wrap">{load.teachingLoad.quarter}</TableCell>
                    <TableCell className=" max-w-[20%] text-wrap capitalize">{
                      teachingLoad.subject.subjectName.toLowerCase() === 'mapeh' && teachingLoad.subComponent
                      ? `MAPEH - ${teachingLoad.subComponent}`
                      : teachingLoad.subject.subjectName
                      }</TableCell>
                    </TableRow>
                  ))}
            
              </TableBody>
            
            </Table>
          </ScrollArea>
          </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

export default JuniorHigh;
