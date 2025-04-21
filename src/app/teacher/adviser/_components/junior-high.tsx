"use client";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { QuarterType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import Chart from "./chart";
import CustomTooltip from "@/components/custom-tooltip";

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
      {loads?.map((load) => (
        <CustomTooltip
          trigger={
            <Card key={load._id} className="">
              <CardContent>
                <div className="">
                  <div className="">
                    <Chart
                      classRecords={load.classRecords}
                      label={load.subject.subjectName}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          }
          content={
            <div className="flex items-center justify-center min-h-56 min-w-56">
              {load.needsInterventions.length !== 0 ? (
                load.needsInterventions.map((student, index) => (
                  <h3 key={"intervention" + student.student?._id}>
                    {index + 1}.{student.student?.lastName},{" "}
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
      ))}
    </div>
  );
}

export default JuniorHigh;
