'use client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React from 'react'
import SectionInfo from './_components/section-info'
import ClassrecordTabs from './_components/classrecord-tabs'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Loading from '../../loading'

function Page() {
  const { id } = useParams()
  const router = useRouter()
  const teachingLoad = useQuery(api.teachingLoad.getById, {
    id: id as Id<'teachingLoad'>
  })

  if(!teachingLoad) return <Loading/>
  return (
    <Card className='my-5 md:my-10 flex-1 mx-auto container '>
      <CardHeader>
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
        <SectionInfo teachingLoad={teachingLoad}/>
      </CardHeader>
      <CardContent className='p-0 md:px-5'>
        <ClassrecordTabs teachingLoad={teachingLoad}/>
      </CardContent>
    </Card>
  )
}

export default Page