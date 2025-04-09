'use client'
import React from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from './ui/scroll-area';
interface CustomTooltipProps {
  trigger: React.ReactNode | string;
  content: React.ReactNode;
}

function CustomTooltip({
  trigger,
  content
}: CustomTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent >
          <ScrollArea className='min-h-56 min-w-56'>

            {content}
          </ScrollArea>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CustomTooltip