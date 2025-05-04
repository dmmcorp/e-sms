'use client'
import { useQuery } from 'convex/react'
import React, { useEffect, useState } from 'react'
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
import { Separator } from '@/components/ui/separator'
import SchoolForm from './school-form'
import { Label } from '@/components/ui/label'
import { UsersRoundIcon } from 'lucide-react'

function HandledSection() {
  const [selectedSY, setSelectedSY] = useState<SchoolYearTypes>("2024-2025");
  const [selectedSem, setSelectedSem] = useState<SemesterType>("1st semester")
  const [selectedQtr, setSelectedQtr] = useState<QuarterType>("1st quarter")

  const sections = useQuery(api.sections.handledSection, {schoolYear: selectedSY});

  useEffect(() => {
    setSelectedSem("1st semester")
    setSelectedQtr("1st quarter")
  }, [selectedSY])
  return (
    <div className='mt-5 md:pt-10 p-5 space-y-2'>
      {/* Selection of section school year */}
        <div className="w-full flex justify-end">
          <Label htmlFor='school-year' className='font-semibold'>School year:</Label>
          <Select defaultValue={selectedSY}  onValueChange={(value)=> setSelectedSY(value as SchoolYearTypes)}> 
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="School year" defaultValue={selectedSY} />
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
        <div className="space-y-10">
        {sections?.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>No sections found for the selected school year.</p>
          </div>
        )}
        {sections?.map((section)=> (
          <Card key={section._id} className=" pt-0">
            <CardHeader className='pt-5 bg-gray-100'>
              <CardTitle  className='flex items-center justify-between '>
                <h1 className='text-xl font-medium'>Section: {section.name}</h1> 
                <Link href={`/teacher/adviser/students?id=${section._id}`} className="">
                    <Button variant={'default'} className='text-sm'> <UsersRoundIcon  className='size-6'/> Manage students</Button>
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
                  sectionId={section._id}
                  selectedQtr={selectedQtr}
                />
                )}
           
            </CardContent>
            <Separator/>
            <SchoolForm 
                sectionId={section._id}
              />
          </Card>
        ))}
            
        </div>
    </div>
  )
}

export default HandledSection