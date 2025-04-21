'use client'
import React from 'react'
import { Doc } from '../../../../../convex/_generated/dataModel'
import { StudentWithSectionStudent } from '@/lib/types'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import Attendance from './attendance'

interface InputAttendanceProps{
    student: StudentWithSectionStudent,
    attendance: Doc<'attendance'>,
    setAttendanceDialog: (value: boolean) => void;
    attendanceDialog: boolean
}


function InputAttendance({
    student,
    attendance,
    setAttendanceDialog,
    attendanceDialog,
}:InputAttendanceProps
) {
  return (
    <Dialog open={attendanceDialog} onOpenChange={setAttendanceDialog}>
        <DialogContent className='md:max-w-screen-2xl'>
            <DialogTitle>
                Edit Attendance Record
            </DialogTitle>
            <Attendance attendance={attendance as Doc<'attendance'>}  student={student} edit={true}/>
        </DialogContent>
    </Dialog>
  )
}

export default InputAttendance