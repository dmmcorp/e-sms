'use client'
import { TeachingLoadType } from '@/lib/types'
import React from 'react'

interface SectionInfoType {
  teachingLoad: TeachingLoadType
}
function SectionInfo({teachingLoad}: SectionInfoType) {
  const section = teachingLoad.section
  const subject = teachingLoad.subjectTaught
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 font-bold text-sm">
        <h1>Section: <span className='font-normal'>{section.name}</span></h1>
        <h1>Grade Level: <span className='font-normal'>{subject.gradeLevel}</span></h1>
        <h1>Subject: <span className='font-normal'>{subject.subjectName}</span></h1>
        <h1>School Year: <span className='font-normal'>{section.schoolYear}</span></h1>
        {teachingLoad.semester && (
          <h1>Semester: <span className='font-normal'>{teachingLoad.semester}</span></h1>
        )}
        <h1>Quarter: <span className='font-normal'>{teachingLoad.quarter}</span></h1>
    </div>
  )
}

export default SectionInfo