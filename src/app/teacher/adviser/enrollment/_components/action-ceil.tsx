'use client'
import { StudentTypes } from '@/lib/types'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Eye, MoreHorizontal, Trash2, UserPlus } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import { toast } from 'sonner'
import { Id } from '../../../../../../convex/_generated/dataModel'
import EnrollDialog from './enroll-dialog'
interface ActionCeilProps {
    student: StudentTypes
}
export default function ActionCeil({
    student
}: ActionCeilProps) {
    const [deleteDialog ,setDeleteDialog] = useState<boolean>(false);
    const [assignDialog ,setAssignDialog] = useState<boolean>(false);
    const deleteStudent = useMutation(api.students.archivedStudent);
    const router = useRouter();
    const fullName = `${student.firstName} ${student.middleName ?? ""} ${student.lastName}`;

    const handleDelete = () =>{
        toast.promise(deleteStudent({
            studentId: student._id
        }),{
            loading: "Removing Student from the list...",
            success: "Remove student successfully.",
            error: "Failed to remove student."
        })
    }
    return (
        <div className="">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
               
                    <MoreHorizontal className="h-4 w-4" />
               
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/teacher/adviser/enrollment/${student._id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                    disabled={student.status !== "not-enrolled"}
                    onClick={() => setAssignDialog(true)}
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign to Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=> setDeleteDialog(true)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Student
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent>
                    <DialogTitle>
                        Are you sure you want to delete this student?
                    </DialogTitle>
                    <div className="">
                        <h1 className='capitalize'>{fullName}</h1>
                    </div>
                    <DialogFooter>
                        <Button variant={'secondary'} onClick={()=> setDeleteDialog(false)}> Cancel</Button>
                        <Button variant={'destructive'} onClick={handleDelete}><Trash2 /> Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EnrollDialog
                assignDialog={assignDialog}
                setAssignDialog={setAssignDialog}
                fullName={fullName}
                student={student}
            />
           
        </div>
    )
}

