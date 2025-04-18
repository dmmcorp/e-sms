import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
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
    setOpenDialog,
    onOpenDialog,
    handleSumbit,
    isSaving,

}:SubmitDialogProps) {
    if(transmutedGrade)
  return (
    <Dialog open={onOpenDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
            <DialogTitle>Are you sure you want to submit this grades?</DialogTitle>
            <div className="">
                <h1 className='font-semibold flex gap-x-2'>Quarterly Grade: 
                    <span className={cn(
                        transmutedGrade <= 74 ? "text-red-600" : '',
                        'font-normal'
                    )}>
                        {transmutedGrade}
                    </span>
                    <span className={cn(
                        transmutedGrade <= 74 ? "text-red-600" : 'text-green-500',
                        'font-normal'
                    )}>
                        {transmutedGrade <= 74 ? "Failed" : "Passed"}
                    </span>
                </h1>
                {transmutedGrade <= 74 && (
                    <h1 className={cn(
                        transmutedGrade <= 74 ? "text-red-600" : '',
                        'font-normal'
                    )}>Needs Intervention</h1>
                )}
              
            </div>
            <DialogFooter>
                <Button 
                    variant="secondary" 
                    onClick={() => setOpenDialog(false)}
                    className={cn(
                        !transmutedGrade ? "hidden" : "flex",
                    )}
                    disabled={ isSaving }
                    >
                    No
                </Button>
                <Button 
                    variant="default" 
                    onClick={handleSumbit}
                    className={cn(
                        !transmutedGrade ? "hidden" : "flex",
                    )}
                    disabled={ isSaving }
                    >
                    Submit
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default SubmitDialog