'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {  useQuery } from 'convex/react'
import { ArrowLeft, Calendar, Pencil, Users } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { api } from '../../../../../../convex/_generated/api'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import EditStudent from './_components/edit-student'
import SubjectDialog from './_components/subject-dialog'

function Page() {
    const router = useRouter();
    const {studentId} = useParams();
    const student = useQuery(api.students.getStudentById, {studentId: studentId as Id<'students'>});
    const [editDialog, setEditDialog] = useState<boolean>(false);
    const [subjectDialog, setSubjectDialog] = useState<boolean>(false);
    const fullName = `${student?.firstName} ${student?.middleName ?? ""} ${student?.lastName}`;
    
  return (
    <div className="container mx-auto pt-10">
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-3xl font-bold capitalize">{fullName}</h1>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2 pt-0">
        <CardHeader className='bg-primary/90 py-3 flex text-primary-foreground items-center justify-between'>
            <div className="">

            <CardTitle>Student Information</CardTitle>
            <CardDescription className='text-muted'>Personal and academic details</CardDescription>
            </div>
            <div className="flex justify-between">
                <Button variant="outline" size={'icon'} onClick={() => setEditDialog(true)}>
                    <Pencil className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium capitalize">{fullName}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Student LRN</p>
                <p className="font-medium">{student?.lrn || "Not assigned"}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sex</p>
                <p className="font-medium capitalize">{student?.sex}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Birth date</p>
              <p className="font-medium">{student?.dateOfBirth || "Not provided"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="">
                <h1 className='text-sm p-1 px-2 font-medium w-full bg-primary/90 text-primary-foreground mb-3 italic'>Elementary School Background</h1>
                <div className="grid gap-4 sm:grid-cols-2 px-2">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">School Name</p>
                        <p className="font-medium capitalize">{student?.elementary.school}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">School Address</p>
                        <p className="font-medium capitalize">{student?.elementary.address}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">School ID</p>
                        <p className="font-medium capitalize">{student?.elementary.schoolId}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">General Average</p>
                        <p className="font-medium capitalize">{student?.elementary.genAve}</p>
                    </div>
                </div>
            </div>
            {student?.juniorHigh && (
                <div>
                    <h1 className='text-sm p-1 px-2 font-medium w-full bg-primary/90 text-primary-foreground mb-3 italic'>Junior High Background</h1>
                    <div className="grid gap-4 sm:grid-cols-2 px-3">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">School Name</p>
                            <p className="font-medium capitalize">{student?.juniorHigh?.school}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">School Address</p>
                            <p className="font-medium capitalize">{student?.juniorHigh?.address}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Date of Completion</p>
                            <p className="font-medium capitalize">{student?.juniorHigh?.completion ?? "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">General Average</p>
                            <p className="font-medium capitalize">{student?.juniorHigh?.genAve}</p>
                        </div>
                    </div>
                </div>
            )}
            
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Section</p>
            {student?.currentSection ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {student.currentSection.section?.name}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Not assigned to any section</span>
                
              </div>
            )}
          </div>

          <Separator />

         
        </CardContent>
        
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader  className='w-full flex justify-between items-start '>
            <div className="">

            <CardTitle>
              <h1>Section Assignment</h1>
             
            </CardTitle>
            <CardDescription>Current class placement</CardDescription>
            </div>
            <Button variant="outline" size={'icon'} onClick={() => setSubjectDialog(true)}>
                <Pencil className="h-4 w-4" />  
            </Button>  
            
          </CardHeader>
          <CardContent>
            {student?.currentSection ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 items-start gap-2">
                  <div className="">
                    <p className="text-sm text-muted-foreground">Section Name</p>
                    <div className="flex items-center gap-2">

                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{student.currentSection.section?.name}</span>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm text-muted-foreground">Subjects</p>
                    <div className="space-y-1 grid grid-cols-1 px-1 items-start justify-start overflow-ellipsis overflow-hidden">
                      {student?.enrollment.find(e => e.status === 'enrolled')?.subjectsWithDetails.map(s => (

                          <Badge key={s.subject?.subjectName} className="font-medium overflow-hidden">{s.subject?.subjectName}</Badge>

                      )) || <p className="font-medium">No subjects assigned</p>}
                    </div>
                  </div>
                </div>
              

                <p className="text-sm text-muted-foreground">
                  Assigned on {formatDate(student.currentSection.section?._creationTime)  || "Unknown date"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">This student is not assigned to any section.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic History</CardTitle>
            <CardDescription>Previous section assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {student?.enrollment && student.enrollment.length > 0 ? (
              <div className="space-y-4">
                {student.enrollment.map((history, index) => (
                  <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{history.section?.name}</div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          history.status.toLowerCase() === "enrolled" && "bg-blue-100 text-blue-800 border-blue-200",
                          history.status.toLowerCase() === "passed" && "bg-green-100 text-green-800 border-green-200",
                          history.status.toLowerCase() === "failed" && "bg-red-100 text-red-800 border-red-200",
                          history.status.toLowerCase() === "dropped" && "bg-yellow-100 text-yellow-800 border-yellow-200"
                        )}
                      >
                        {history.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {history.schoolYear}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No previous section assignments found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    {student && (
    <EditStudent 
        student={student}
        editDialog={editDialog}
        setEditDialog={setEditDialog}
    />
    )}
    {student && 
      <SubjectDialog 
        open={subjectDialog}
        onOpenChange={setSubjectDialog}
        currentSection={student?.currentSection}
        enrollmentId={student?.enrollment.find(e => e.status === 'enrolled')?._id}
        studentId={student._id}
      />
    }
  </div>
  )
}

export default Page