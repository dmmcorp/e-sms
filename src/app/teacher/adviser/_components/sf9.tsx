"use client"

import { useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { useReactToPrint } from 'react-to-print'
import Attendance from "./attendance"
import { Doc, Id } from "../../../../../convex/_generated/dataModel"
import { StudentWithSectionStudent } from "@/lib/types"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import Loading from "../../loading"
import SF9FrontTemplate from "./sf9-front-template"
import JrGradesTemplate from "./jhs-grade-template"
import Values from "./values"
import SrGradesTemplate from "./shs-grade-template"
import InputValues from "./input-values"

interface SF9Props {
  sectionStudentId: Id<'sectionStudents'>
  readOnly?: boolean
  componentRef?: React.RefObject<HTMLDivElement>
  onTabChange?: (tab: string) => void
}

export default function SF9({
  sectionStudentId,
  readOnly = false,
  componentRef,
  onTabChange,
}: SF9Props) {
  const [activeTab, setActiveTab] = useState("front")
  const [valuesDialog, setValuesDialog] = useState<boolean>(false);
  const student = useQuery(api.students.getStudentSection, { sectionStudentId: sectionStudentId })
  const localComponentRef = useRef(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

    const gradeLevel = student?.sectionDoc?.gradeLevel
    const isSHS = gradeLevel === "Grade 11" || gradeLevel === "Grade 12" 

  const reactToPrintContent = () => {
    return (componentRef || localComponentRef).current;
  };

  const handlePrint = useReactToPrint({
    documentTitle: `School form 9 - ${activeTab === 'front' ? 'Front' : 'Back'}`,
  });

  if (!student) return <Loading />

  return (
    <div className="w-full max-w-[1100px] mx-auto p-4 bg-white">
      <Tabs defaultValue="front" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-[200px] grid-cols-2 mb-6">
          <TabsTrigger value="front">Front</TabsTrigger>
          <TabsTrigger value="back">Back</TabsTrigger>
        </TabsList>

        <TabsContent value='front'>
          <div ref={componentRef || localComponentRef}>
            <SF9FrontTemplate student={student} />
          </div>
        </TabsContent>

        <TabsContent value="back" className="mt-0">
          <div ref={componentRef || localComponentRef}>
            {isSHS ? (
              <Card className="border-2 p-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-3">
                    <h1 className='text-center text-xs'>REPORT ON LEARNING PROGRESS AND ACHIEVEMENT</h1>
                    <SrGradesTemplate student={student} sem='1st semester' sf9={true} />
                  </div>
                  <div className="">
                    <SrGradesTemplate student={student} sem='2nd semester' sf9={true} />
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
              <Card className="border-2 p-6 grid grid-cols-2 gap-6">
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
                <InputValues
                  studentId={student._id}
                  sectionStudentId={sectionStudentId}
                  sf9
                  isSHS={isSHS}
                  valuesDialog={valuesDialog}
                  setValuesDialog={setValuesDialog}
                />
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}