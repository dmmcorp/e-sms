'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SectionStudentsType } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react'
import { FaLevelDownAlt, FaLevelUpAlt } from 'react-icons/fa'
import PromoteDialog from './promote-dialog';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';

interface ActionCeilProps {
    student: SectionStudentsType
}
function ActionCell({
    student
}: ActionCeilProps) {
    const enrolled = useQuery(api.enrollment.isEnrolled, {
        enrollmentId: student.enrollment?._id
    })
    const [promoteDialog, setPromoteDialog] = useState<boolean>(false)
    const [dropDialog, setDropDialog] = useState<boolean>(false)
    const isEnrolled = enrolled !== undefined && enrolled
   
    return (    
        <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
               
                    <MoreHorizontal className="h-4 w-4" />
               
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem disabled={!isEnrolled} onClick={()=>setPromoteDialog(true)}>
                    <FaLevelUpAlt className="h-m3.5 w-3.5" />
                    Promote
                </DropdownMenuItem>
                <DropdownMenuItem 
                    disabled={!isEnrolled}
                    onClick={() => setDropDialog(true)}
                >
                    <FaLevelDownAlt className="mr-2 h-4 w-4" />
                    Drop
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {promoteDialog && (
                <PromoteDialog
                    student={student}
                    promoteDialog={promoteDialog}
                    setPromoteDialog={setPromoteDialog}
                />
            )}
        </div>
    );
}

export default ActionCell