import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import React, { ReactNode } from 'react'

interface CustomTooltipProps {
    trigger: ReactNode
    interventionUsed: string[]
    interventionRemarks: string,
    initialGrade: string,

}
function CustomTooltip({
    trigger,
    interventionUsed,
    interventionRemarks,
    initialGrade,
}:CustomTooltipProps) {
  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild className=''>
                {trigger}
            </TooltipTrigger>
            <TooltipContent className='max-w-2xl bg-white text-black p-5 space-y-2 shadow-md'>
                <Label className='font-semibold'>Intervention Method(s)</Label>
                <div className="flex items-center justify-center flex-wrap gap-2">
                    {interventionUsed.map((intUsed, index)=>(
                        <Badge key={index + intUsed} className='text-white bg-primary text-sm'>{intUsed}</Badge>
                    ))}
                </div>
                <div className="mt-2">
                    <Label className='font-semibold'>Remarks</Label>
                    <p>{interventionRemarks}</p>
                </div>
                <div className="mt-2 flex items-center gap-x-2">
                    <Label className='font-semibold'>Initial Grade:</Label>
                    <p>{initialGrade}</p>
                </div>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  )
}

export default CustomTooltip