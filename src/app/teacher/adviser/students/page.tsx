'use client'
import React from 'react'
import StudentList from './_components/student-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RemedialStudentList from './_components/remedial-student-list'

function Page() { 
  const router = useRouter()
  return (
    <div className='container pt-10'>
      <Card>
      <CardHeader>
      <CardTitle className="flex items-start gap-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-2 ">

                <h1 className="text-3xl font-bold tracking-tighter">Student Management</h1>
                
            </div>
        
        </CardTitle>
     
      </CardHeader>
      <CardContent>

      <Tabs defaultValue='students' className='w-full'>
        <TabsList className='bg-transparent w-full  shadow-sm'>
            <TabsTrigger value='students' className='data-[state=active]:text-primary'>Students</TabsTrigger>
            <TabsTrigger value='summerClass' className='data-[state=active]:bg-primary'>Summer/Remedial Class</TabsTrigger>
        </TabsList>
        <TabsContent value='students'>  
          <StudentList/>
        </TabsContent>
        <TabsContent value='summerClass'>  
            <RemedialStudentList/>
        </TabsContent>
      </Tabs>
      </CardContent>
      
      </Card>
    </div>
  )
}

export default Page