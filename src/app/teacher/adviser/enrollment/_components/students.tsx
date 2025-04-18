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

export default function Students() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sectionId = searchParams.get('id') as Id<'sections'> | null;
    const students = useQuery(api.students.getStudents, {
        sectionId: sectionId ?? undefined,
    });
    if(!students) return <Loading/>
  return (
    <div className='pt-5'>

        <div className="flex items-start gap-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-2 ">

                <h1 className="text-3xl font-bold tracking-tighter">Student Management</h1>
                
            </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
            View and manage student information and their section assignments.
        </p>
        <DataTable
            columns={studentColumns}
            data={students}
            filter="fullName"
            placeholder="student name"
            customUI={
            <Button onClick={()=> router.push("/teacher/adviser/enrollment/add")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
            </Button>
            }
        />
     

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


