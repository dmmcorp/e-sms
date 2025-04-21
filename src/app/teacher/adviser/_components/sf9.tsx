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
interface SF9Props {
    sectionStudentId: Id<'sectionStudents'>
}

export default function SF9({
    sectionStudentId,
}: SF9Props) {
    const [activeTab, setActiveTab] = useState("front")
    const student = useQuery(api.students.getStudentSection, {sectionStudentId: sectionStudentId})
    const componentRef = useRef(null);

    const gradeLevel = student?.sectionDoc?.gradeLevel
    const isSHS = gradeLevel === "Grade 11" || gradeLevel === "Grade 12" 

    const reactToPrintContent = () => {
    return componentRef.current;
    };

   const handlePrint = useReactToPrint({
      documentTitle: `School form 9`,
  
    });


    if(!student) return <Loading/>

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-white">
      <Tabs defaultValue="front" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-[200px] grid-cols-2 mb-6">
          <TabsTrigger value="front">Front</TabsTrigger>
          <TabsTrigger value="back">Back</TabsTrigger>
        </TabsList>

        <TabsContent value='front'>
              <div ref={componentRef} className=''>
                  <SF9FrontTemplate student={student}  />
              </div>
            </TabsContent>

        <TabsContent value="back" className="mt-0">
          <Card className="border-2 p-6">
            <JrGradesTemplate student={student}/>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
