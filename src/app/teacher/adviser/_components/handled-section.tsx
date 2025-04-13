'use client'
import { useQuery } from 'convex/react'
import React, { useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import { isSHS, schoolYears } from '@/lib/utils'
import { QuarterType, SchoolYearTypes, SemesterType } from '@/lib/types'
import JuniorHigh from './junior-high'
import SeniorHigh from './senior-high'
import SelectSemAndQtr from './select'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function HandledSection() {
  const [selectedSY, setSelectedSY] = useState<SchoolYearTypes>("2024-2025");
  const [selectedSem, setSelectedSem] = useState<SemesterType>("1st semester")
  const [selectedQtr, setSelectedQtr] = useState<QuarterType>("1st quarter")

  const sections = useQuery(api.sections.handledSection, {schoolYear: selectedSY});
  console.log(sections)

  return (
    <div>
      {/* Selection of section school year */}
        <div className="w-full flex justify-end">
          <Select defaultValue='2024-2025' onValueChange={(value)=> setSelectedSY(value as SchoolYearTypes)}> 
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="School year" />
            </SelectTrigger>
            <SelectContent className='max-h-64'>
              <SelectGroup>
                <SelectLabel>School Year</SelectLabel>
                {schoolYears.map((sy)=> (
                  <SelectItem key={sy} value={sy}>{sy}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {sections?.map((section)=> (
          <Card key={section._id} className="">
            <CardHeader>
              <CardTitle  className='flex items-center justify-between'>
                <h1 className='text-xl font-medium'>Section: {section.name}</h1> 
                <Link href={'/teacher/adviser/enrollment'} className="">
                  <Button variant={'default'} className=''>Enroll student</Button>
                </Link>
              </CardTitle>
              
            </CardHeader>
            <CardContent>
              <SelectSemAndQtr
                selectedSem={selectedSem}
                selectedQtr={selectedQtr}
                setSelectedQtr={setSelectedQtr}
                setSelectedSem={setSelectedSem}
                isShs={isSHS(section)}
              />
              {isSHS(section) === true ? (
                <SeniorHigh
                  sectionName={section.name}
                  sectionId={section._id}
                  selectedQtr={selectedQtr}
                  selectedSem={selectedSem}
                />
              ) : (
                <JuniorHigh 
                  sectionName={section.name}
                  sectionId={section._id}
                  selectedQtr={selectedQtr}
                />
                )}
            </CardContent>
          </Card>
        ))}
        
    </div>
  )
}

export default HandledSection