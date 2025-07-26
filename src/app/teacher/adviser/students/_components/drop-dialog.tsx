'use client'
import { SectionStudentsType } from '@/lib/types';
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { toast } from 'sonner';

interface DropDialogProps {
    student: SectionStudentsType
    dropDialog: boolean;
    setDropDialog: (value: boolean) => void;
}

function DropDialog({
    student,
    dropDialog,
    setDropDialog
}: DropDialogProps) {
    const createLogs = useMutation(api.logs.createUserLogs);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const dropStudent = useMutation(api.enrollment.dropStudent)
    const handleDropStudent = async() =>{
        setIsLoading(true)
        if(student.enrollment) {
            toast.promise(dropStudent({
                enrollmentId: student.enrollment._id
            }),{
                loading: "Dropping student...",
                success: async () => {
                    await createLogs({
                        action: "update",
                        details: `Dropped ${studentName}`,
                    });
                    return "Student dropped successfully."
                },
                error: async (error) => {
                    await createLogs({
                        action: "update",
                        details: `Failed to drop ${studentName}`,
                    });
                    return "Error Dropping student..."
                }
            })
        } else {
            await createLogs({
                action: "update",
                details: `Failed to drop ${studentName}`,
            });
            toast.error('Student not Enrolled.')
        }
        setDropDialog(false)
        setIsLoading(false)
    }

    const studentName = `${student.lastName}, ${student.firstName} ${student.middleName}`
  return (
    <Dialog open={dropDialog} onOpenChange={setDropDialog}>
        <DialogContent>
            <DialogTitle>
                Drop student? 
            </DialogTitle>
            <div className="">
                <h1 className='capitalize font-semibold'>Name: <span className='font-normal'>{studentName}</span></h1>
            </div>
            <DialogFooter>
                <Button disabled={isLoading} variant={'secondary'} className='' onClick={()=> setDropDialog(false)}>No</Button>
                <Button disabled={isLoading} variant={'default'} className='' onClick={handleDropStudent}>Yes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default DropDialog