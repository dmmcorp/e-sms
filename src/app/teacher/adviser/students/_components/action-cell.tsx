'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SectionStudentsType } from '@/lib/types';
import { Eye, MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react'
import { FaLevelDownAlt, FaLevelUpAlt } from 'react-icons/fa'
import PromoteDialog from './promote-dialog';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import DropDialog from './drop-dialog';
import { useRouter } from 'next/navigation';

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
    const router = useRouter()
    return (    
        <div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={() => router.push(`/teacher/adviser/students/${student._id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!isEnrolled} onClick={()=>setPromoteDialog(true)}>
                    <FaLevelUpAlt className="mr-2 h-4 w-4 text-blue-500"  />
                    Promote
                </DropdownMenuItem>
                <DropdownMenuItem 
                    disabled={!isEnrolled}
                    onClick={() => setDropDialog(true)}
                >
                    <FaLevelDownAlt className="mr-2 h-4 w-4 text-orange-500"  />
                    Drop
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        
            <PromoteDialog
                student={student}
                promoteDialog={promoteDialog}
                setPromoteDialog={setPromoteDialog}
            />

            <DropDialog
                student={student}
                dropDialog={dropDialog}
                setDropDialog={setDropDialog}
            />
            

        </div>
    );
}

export default ActionCell