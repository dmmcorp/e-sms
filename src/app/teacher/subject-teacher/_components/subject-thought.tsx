'use client'
import { useQuery } from 'convex/react'
import React, { useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import SectionList from './section-list'
import { SubjectTypes } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Loading from '../../loading'

function SubjectThought() {
  // Fetch the list of subjects using the `useQuery` hook
  const subjects = useQuery(api.subjectThought.getSubjects)

  // State to track the currently selected subject
  const [selectedSubject, setSelectedSubject] = useState<SubjectTypes | undefined>()

  // Show a loading state while the subjects are being fetched
  if (!subjects) return <Loading/>

  // Show a message if no subjects are found
  if (subjects.length === 0) {
    return (
      <div className="flex- text-center">
        No subjects found.
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col lg:flex-row'>
      {/* Sidebar card to display the list of subjects */}
      <Card className="flex flex-col w-full lg:w-1/4 p-5">
        <h1 className='text-center font-bold'>Select a subject</h1>
        <ScrollArea className='flex-1 flex h-60'>
          <CardContent>
            {/* Render a button for each subject */}
            {subjects.map((sub) => (
              <Button 
                variant={'ghost'} 
                onClick={() => setSelectedSubject(sub)} 
                key={sub._id} 
                className={cn(
                  selectedSubject?._id === sub._id && "bg-primary text-white hover:bg-primary/80 hover:text-white",
                  "w-full hover:cursor-pointer"
                )}
              >
                <h1>{sub.subjectName}</h1>
              </Button>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>
      
      {/* Main content area to display the section list for the selected subject */}
      <div className="flex-1 p-5">
        <SectionList selectedSubject={selectedSubject} />
      </div>
    </div>
  )
}

export default SubjectThought