import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DialogTitle } from '@radix-ui/react-dialog'
import React from 'react'

interface SubmitDialogProps {
    transmutedGrade: number | undefined,
    onOpenDialog: boolean,
    setOpenDialog: (value: boolean) => void;
    handleSumbit: () => void;
    isSaving: boolean;
}
function SubmitDialog({
    transmutedGrade,
    onOpenDialog,
    handleSumbit,
    isSaving,

}:SubmitDialogProps) {
    if(transmutedGrade)
  return (
    <Dialog open={onOpenDialog}>
        <DialogContent>
            <DialogTitle>
                {
                    <span className={cn(
                        transmutedGrade <= 74 ? "text-red-600" : 'text-green-500',
                        'text-xl font-semibold'
                    )}>
                        {transmutedGrade <= 74 ? "Failed" : "Passed"}
                    </span>
            
                }
            </DialogTitle>
            <div className="">
                <h1 className='font-semibold flex gap-x-2'>Quarterly Grade: 
                    <span className={cn(
                        transmutedGrade <= 74 ? "text-red-600" : '',
                        'font-normal'
                    )}>
                        {transmutedGrade}
                    </span>
                    {transmutedGrade <= 74 && (
                    <span className={cn(
                        transmutedGrade <= 74 ? "text-red-600" : '',
                        'font-normal'
                    )}>- Needs Intervention</span>
                )}
                    
                </h1>
            </div>
            <DialogFooter>
                <Button 
                    variant="default" 
                    onClick={handleSumbit}
                    className={cn(
                        !transmutedGrade ? "hidden" : "flex",
                    )}
                    disabled={ isSaving }
                    >
                    Okay
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default SubmitDialog