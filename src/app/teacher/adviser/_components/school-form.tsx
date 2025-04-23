import React, { useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { StudentTypes, StudentWithGrades, StudentWithSectionStudent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import SF9 from './sf9';
import SF10 from './SF10';

interface SchoolFormTypes {
    sectionId: Id<'sections'> 
}

type SFButtons = 'sf9' | 'sf10';

function SchoolForm({
 
    sectionId
}: SchoolFormTypes) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedButton, setSelectedButton ] = useState<SFButtons | undefined>()

  const students = useQuery(api.students.getSectionStudents, {
    sectionId: sectionId
  });


function getFullName(student: StudentTypes) {
  const firstName = student.firstName || '';
  const middleName = student.middleName ? ` ${student.middleName}` : '';
  const lastName = student.lastName || '';
  return `${firstName}${middleName} ${lastName}`.trim();
}
  return (
    <div>
      <h1 className='text-center font-semibold'>Generate School Forms</h1>
        <div className="mt-4 w-full flex items-center justify-center gap-x-10">
        <Button size={'lg'} onClick={() => setSelectedButton('sf9')} className={`mr-2 ${selectedButton === 'sf9' ? 'bg-blue-500' : 'bg-gray-300'}`}>School Form 9</Button>
        <Button size={'lg'} onClick={() => setSelectedButton('sf10')} className={`${selectedButton === 'sf10' ? 'bg-blue-500' : 'bg-gray-300'}`}>School Form 10</Button>
      </div>
      <div className="mt-4">
        {selectedButton === 'sf9' ? (
          <div className=''>
            <div className="flex w-full justify-center">
              <Select onValueChange={(value) => setSelectedStudent(value)}>
                  <SelectTrigger className="w-[180px] capitalize">
                      <SelectValue placeholder="Select a student" className='capitalize' />
                  </SelectTrigger>
                  <SelectContent className='max-h-64'>
                      <SelectGroup>
                      <SelectLabel>Students</SelectLabel>
                      {students?.map((student) => (
                          <SelectItem key={student._id} value={student.sectionStudentId} className={"capitalize"}>
                            {getFullName(student)}
                          </SelectItem>
                      ))}
                      </SelectGroup>
                  </SelectContent>
              </Select>
            </div>
            {selectedStudent && (
              <div className="">
                <SF9 sectionStudentId={selectedStudent as Id<'sectionStudents'>}/>
              </div>
            )}
        </div>
        ) : selectedButton === 'sf10' ?(
          <div>
            <div className="flex w-full justify-center">
            <Select onValueChange={(value) => setSelectedStudent(value)}>
                <SelectTrigger className="w-[180px] capitalize">
                    <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent className='max-h-64'>
                    <SelectGroup>
                    <SelectLabel>Students</SelectLabel>
                    {students?.map((student) => (
                        <SelectItem key={student._id} value={student.sectionStudentId} className='capitalize'>
                        {getFullName(student)}
                        </SelectItem>
                    ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            </div>
            {selectedStudent && (
              <div className="">
                <SF10 sectionStudentId={selectedStudent as Id<'sectionStudents'>}/>
              </div>
            )}
          </div>
        ) : (
            <div>
        
          </div>
        )}
      </div>
    </div>
  );
}

export default SchoolForm;

