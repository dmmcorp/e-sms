'use client'
import { useQuery } from 'convex/react'
import React from 'react'
import { api } from '../../../../../../convex/_generated/api'
import { Id } from '../../../../../../convex/_generated/dataModel';
import { useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { StudentWithFinalGrades } from '@/lib/types';
import RemedialActions from './remedial-action';

export default function RemedialStudentList() {
    const searchParams = useSearchParams();
    const sectionId = searchParams.get('id') as Id<'sections'> | null;
    const forRemedial = useQuery(api.finalGrades.forRemedial, {
        sectionId: sectionId === null ? undefined : sectionId
    })

  return (
    <div>
      <h4 className="my-4 text-sm text-center text-gray-600">
        View students needing remedial classes, their subjects, and take actions.
      </h4>
         <DataTable
            columns={forRemedialColumn}
            data={forRemedial ?? []}
            filter="fullName"
            placeholder="student name"
        />
    </div>
  )
}

const forRemedialColumn: ColumnDef<StudentWithFinalGrades>[] = [
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
    id: "subject",
    accessorKey: "subject",
    header: "Subjects",
    cell: ({row}) => {
      const student = row.original
      const subject = student.finalGrades
      return (
        <div className='flex'>
          {subject.map((grade, index) => (
            <React.Fragment key={index}>
              <div>{grade.subject?.subjectName}</div>
              {index < subject.length - 1 && <span>, </span>}
            </React.Fragment>
          ))}
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original
      return(<><RemedialActions student={student}/></>)
    }

  }
]