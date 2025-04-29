'use client'
import { useQuery } from 'convex/react'
import React, { useEffect, useState } from 'react'
import { api } from '../../../../../../convex/_generated/api'
import { useSearchParams } from 'next/navigation';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import Loading from '@/app/teacher/loading';
import useStudents from '@/hooks/teacher/use-students';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { SectionStudentsType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ActionCeil from './action-cell';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StudentList() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const sectionId = searchParams.get('id') as Id<'sections'> | null;
    if(sectionId === null) return <Loading/>
    const {students, isLoading}  = useStudents({sectionId: sectionId})
    if(isLoading === null) return <Loading/>
    const noOfStudents = students?.length
  return (
    <div className='container '>
      <h4 className="my-4 text-sm text-center text-gray-600">
        View the students assigned to your section. You can promote, drop, and view student details.
      </h4>
        <div className="">
          <h1 className='text-xs text-muted-foreground'>Total students: {noOfStudents}</h1>
        </div>
       
       <DataTable
            columns={studentColumns}
            data={students ?? []}
            filter="fullName"
            placeholder="student name"
            customUI={
            <Button onClick={()=> router.push(`/teacher/adviser/enrollment?id=${sectionId}`)}>
                Assign new student
            </Button>
            }
        />

    </div>
  )
}

const studentColumns: ColumnDef<SectionStudentsType>[] = [
    { 
      id: "fullName",
      accessorFn: (row) => {
        const { lastName, firstName, middleName } = row;
      
        // Construct the full name including optional middle and extension names
        return [
          firstName, 
          middleName, 
          lastName,
        ].filter(Boolean).join(" ");
      },
      header: "Full Name",
      cell: ({ row }) => {
        const  { firstName, middleName, lastName } = row.original
        const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`
        
        return (
          <div className="flex items-center gap-x-3 capitalize">
            <h1>{fullName}</h1>
          </div>
        )
      }
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({row}) => {
        const student = row.original
        const status = student.enrollment?.status
        return (
          <div>
            <Badge className={cn(
              status === "enrolled" && "bg-primary" ,
              status === "promoted" && "bg-green-500" ,
              status === "conditionally-promoted" && "bg-blue-500" ,
              status === "retained" && "bg-red-500" ,
              status === "dropped" && "bg-orange-500" ,
              'capitalize'

            )}>{status}</Badge>
          </div>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const student = row.original
        return(<ActionCeil student={student}/>)
      }

    }
]
