'use client'
import { useCurrentUser } from '@/hooks/teacher/use-get-teacher-type'
import React from 'react'
import Loading from '../loading'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function TeacherPage() {
    const {user, isLoading} = useCurrentUser()
    const router = useRouter()
  
    if(!user || isLoading) return <Loading/>

    if(user.role === "adviser/subject-teacher") {
      return (
        <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 items-center justify-center">
          <Link href={`/teacher/adviser`} >
            <Card>
              <CardContent>
                Adviser
              </CardContent>
            </Card>
          </Link>
          <Link href={`/teacher/subject-teacher`} >
            <Card>
              <CardContent>
                Subject Teacher
              </CardContent>
            </Card>
          </Link>
        </div>
      )
    } 

    if(user.role === "adviser") {
      router.push('/adviser')
    }
    if(user.role === "subject-teacher") {
      router.push('/subject-teacher')
    }

  return (
    <div className='w-full min-h-screen flex items-center justify-center'>
      <p>You are not an adviser, subject teacher, or both.</p>
    </div>
  )
}

export default TeacherPage