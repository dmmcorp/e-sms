'use client'
import React from 'react'
import { Doc, Id } from '../../../../../convex/_generated/dataModel'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import Values from './values'

interface InputValuesProps {
    studentId: Id<'students'>,
    sectionStudentId: Id<'sectionStudents'>
    sf9?: boolean,
    isSHS?: boolean | string
    valuesDialog: boolean;
    setValuesDialog: (value: boolean) => void;
}
function InputValues({
    studentId,
    sectionStudentId,
    sf9,
    isSHS,
    valuesDialog,
    setValuesDialog
  
}: InputValuesProps) {
  return (
    <Dialog open={valuesDialog} onOpenChange={setValuesDialog}>
        <DialogContent className='md:max-w-screen-xl'>
            <DialogTitle>
                Edit Values
            </DialogTitle>
            <Values 
                studentId={studentId}
                sectionStudentId={sectionStudentId}
                sf9
                isSHS={isSHS}
                edit={true}
                setValuesDialog={setValuesDialog}
              />
        </DialogContent>
    </Dialog>
  )
}

export default InputValues