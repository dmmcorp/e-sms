"use client"
import React from 'react'
import useTeacherStore from '../_store/useTeacher'
import SubjectTaught from './_components/subject-taught'

function SubjectTeacherPage() {
  const teacher = useTeacherStore(state => state.teacher)
  const firstName = teacher?.fullName?.split(' ')[0]
  return (
    <div className="flex-1 flex flex-col ">
      <h1 className='text-center text-2xl font-bold uppercase p-3 md:px-5 lg:pd-10'>
        Welcome teacher {firstName}! 
      </h1>
      
      <SubjectTaught/>
   
    </div>

  )
}

export default SubjectTeacherPage