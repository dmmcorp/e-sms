'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useMutation, useQuery } from 'convex/react'
import { ArrowLeft, Calendar, Pencil, UserPlus, Users } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { api } from '../../../../../../convex/_generated/api'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { enrollmentSchema } from '@/lib/zod'
import { toast } from 'sonner'
import EditStudent from './_components/edit-student'

function Page() {
    const router = useRouter();
    const {studentId} = useParams();
    const student = useQuery(api.students.getStudentById, {studentId: studentId as Id<'students'>});
    const [editDialog, setEditDialog] = useState<boolean>(false);
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
        <CardHeader className='bg-muted py-3 flex items-center justify-between'>
            <div className="">

            <CardTitle>Student Information</CardTitle>
            <CardDescription>Personal and academic details</CardDescription>
            </div>
            <div className="flex justify-between">
                <Button variant="outline" onClick={() => setEditDialog(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Information
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
                <h1 className='text-sm p-1 px-2 font-medium w-full bg-muted mb-3 italic'>Elementary School Background</h1>
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
                        <p className="text-sm text-muted-foreground">General Average</p>
                        <p className="font-medium capitalize">{student?.elementary.genAve}</p>
                    </div>
                </div>
            </div>
            {student?.juniorHigh && (
                <div>
                    <h1 className='text-sm p-1 px-2 font-medium w-full bg-muted mb-3 italic'>Junior High Background</h1>
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
          <CardHeader>
            <CardTitle>Section Assignment</CardTitle>
            <CardDescription>Current class placement</CardDescription>
          </CardHeader>
          <CardContent>
            {student?.currentSection ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{student.currentSection.section?.name}</span>
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
                      <Badge variant="outline" className="text-xs">
                        {history.section?.schoolYear}{history.section?.semester ? `- ${history.section.semester.charAt(3)}` : ""}
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
  </div>
  )
}

export default Page