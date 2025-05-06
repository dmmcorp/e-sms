"use client"
import { useQuery } from 'convex/react'
import React, { useState } from 'react'
import { api } from '../../../../../../convex/_generated/api'
import { ColumnDef } from '@tanstack/react-table'
import { StudentTypes } from '@/lib/types'
import { DataTable } from '@/components/data-table'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye, MoreHorizontal, Trash2, UserPlus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import ActionCeil from './action-ceil'
import { Id } from '../../../../../../convex/_generated/dataModel'
import Loading from '@/app/teacher/loading'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Students() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sectionId = searchParams.get('id') as Id<'sections'> | null;
    const students = useQuery(api.students.getStudents, {
        sectionId: sectionId === null ? undefined : sectionId ?? undefined,
    });

    const section = useQuery(api.sections.getSection,{
        sectionId: sectionId === null ? undefined : sectionId ?? undefined,
    })
    if(!students) return <Loading/>
  return (
    <div className='md:container md:pt-10'>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-x-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="space-y-2 ">

                    <h1 className="text-lg md:text-3xl font-bold tracking-tighter">Assign student to your section</h1>
                    
                    
                </div>
            </CardTitle>
            <CardDescription className='mt-5'>
                Students enrolling in <strong>{section?.gradeLevel}</strong>.
            </CardDescription>
        </CardHeader>
           <CardContent>
        <DataTable
            columns={studentColumns}
            data={students}
            filter="fullName"
            placeholder="student name"
            customUI={
            <Button onClick={()=> router.push("/teacher/adviser/enrollment/add")}>
                <UserPlus className="md:mr-2 h-4 w-4" />
                <span className='hidden md:block'>Add Student</span>
            </Button>
            }
        />
        </CardContent>
        </Card>
     

    </div>
  )
}

const studentColumns: ColumnDef<StudentTypes>[] = [ 
    {
        id: "fullName",
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => {
            const student = row.original;
            const fullName =  `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
              
            return <div className='capitalize'>{fullName}</div>;
        }
    },
    {
        accessorKey: "lrn",
        header: "LRN"
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionCeil student={row.original}/>
    }
    

]


