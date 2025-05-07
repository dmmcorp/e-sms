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
            <TooltipContent className='max-w-xl bg-white text-black p-5 space-y-2 shadow-md'>
                <Label className='font-semibold'>Intervention Method(s)</Label>
                <div className="flex items-center justify-center flex-wrap gap-2">
                    {interventionUsed.length > 1 ? interventionUsed.map((intUsed, index)=>(
                        <Badge key={index + intUsed} className='text-white bg-primary text-sm'>{intUsed}</Badge>
                    )) : (
                        <h1>No assigned Intervention</h1>
                    )}
                </div>
                <div className="mt-2">
                    <Label className='font-semibold'>Remarks</Label>
                    <p className='line line-clamp-3 text-ellipsis'>{interventionRemarks}</p>
                </div>
                <div className="mt-2 flex items-center gap-x-2">
                    <Label className='font-semibold'>Original Grade:</Label>
                    <p>{initialGrade}</p>
                </div>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  )
}

export default CustomTooltip