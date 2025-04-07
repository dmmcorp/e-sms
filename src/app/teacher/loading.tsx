import { Loader2Icon } from 'lucide-react'
import React from 'react'

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className='flex items-center justify-center min-h-screen min-w-screen'>
      <Loader2Icon className='animate-spin size-10'/>
    </div>
  )
}