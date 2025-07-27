"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import Attendance from "./attendance";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { StudentWithSectionStudent } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Loading from "../../loading";
import SF9FrontTemplate from "./sf9-front-template";
import JrGradesTemplate from "./jhs-grade-template";
import Values from "./values";
import SrGradesTemplate from "./shs-grade-template";
import InputValues from "./input-values";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
interface SF9Props {
  sectionStudentId: Id<"sectionStudents">;
  readOnly?: boolean;
  componentRef?: React.RefObject<HTMLDivElement>;
  onTabChange?: (tab: string) => void;
}

export default function SF9({
  sectionStudentId,
  readOnly,
  componentRef,
  onTabChange,
}: SF9Props) {
  const createUserLogs = useMutation(api.logs.createUserLogs);
  const [activeTab, setActiveTab] = useState("front");
  const [valuesDialog, setValuesDialog] = useState<boolean>(false);
  const student = useQuery(api.students.getStudentSection, {
    sectionStudentId: sectionStudentId,
  });
  const localComponentRef = useRef(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  const gradeLevel = student?.sectionDoc?.gradeLevel;
  const isSHS = gradeLevel === "Grade 11" || gradeLevel === "Grade 12";

  const reactToPrintContent = () => {
    return (componentRef || localComponentRef).current;
  };
  const saveLogs = async () => {
    await createUserLogs({
      details: `Printed SF9 (${activeTab}) for student ${student?.lastName}`,
      action: "PRINT_SF9",
    });
  };

  const handlePrint = useReactToPrint({
    documentTitle: `School form 9 - ${activeTab === "front" ? "Front" : "Back"}`,
  });

  if (!student) return <Loading />;

  return (
    <div className="w-full mx-auto p-4 flex ">
      <Tabs
        defaultValue="front"
        className="w-full mx-auto container overflow-auto"
        onValueChange={handleTabChange}
      >
        <div className="grid grid-cols-12">
          <TabsList className="col-span-9 grid w-[200px] grid-cols-2 mb-6">
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
          </TabsList>
          <div className="flex justify-end col-span-3">
            <Button
              size={"icon"}
              onClick={() => {
                handlePrint(reactToPrintContent);
                saveLogs();
              }}
            >
              <Printer />
            </Button>
          </div>
        </div>

        <TabsContent value="front" className=" overflow-auto  min-w-[1100px] ">
          <div ref={componentRef || localComponentRef} className="">
            <SF9FrontTemplate student={student} readOnly={readOnly} />
          </div>
        </TabsContent>

        <TabsContent
          value="back"
          className="mt-0  overflow-auto  min-w-[1100px]"
        >
          <div ref={componentRef || localComponentRef}>
            {isSHS ? (
              <Card className="border-2 p-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-3">
                    <h1 className="text-center text-[0.6rem] font-semibold">
                      REPORT ON LEARNING PROGRESS AND ACHIEVEMENT
                    </h1>
                    <SrGradesTemplate
                      student={student}
                      sem="1st semester"
                      sf9={true}
                    />
                  </div>
                  <div className="">
                    <SrGradesTemplate
                      student={student}
                      sem="2nd semester"
                      sf9={true}
                    />
                  </div>
                </div>
                <div onClick={() => setValuesDialog(true)} className="">
                  <Values
                    studentId={student._id}
                    sectionStudentId={sectionStudentId}
                    sf9
                    isSHS={isSHS}
                    setValuesDialog={setValuesDialog}
                  />
                </div>
                <InputValues
                  studentId={student._id}
                  sectionStudentId={sectionStudentId}
                  sf9
                  isSHS={isSHS}
                  valuesDialog={valuesDialog}
                  setValuesDialog={setValuesDialog}
                />
              </Card>
            ) : (
              <Card className="border-2 p-6 grid grid-cols-2 gap-6 ">
                <JrGradesTemplate student={student} sf9 />
                <div onClick={() => setValuesDialog(true)}>
                  <Values
                    studentId={student._id}
                    sectionStudentId={sectionStudentId}
                    sf9
                    isSHS={isSHS}
                    setValuesDialog={setValuesDialog}
                  />
                </div>
                {!readOnly && (
                  <InputValues
                    studentId={student._id}
                    sectionStudentId={sectionStudentId}
                    sf9
                    isSHS={isSHS}
                    valuesDialog={valuesDialog}
                    setValuesDialog={setValuesDialog}
                  />
                )}
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
