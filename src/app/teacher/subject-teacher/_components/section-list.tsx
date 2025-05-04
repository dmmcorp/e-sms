'use client'
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QuarterType, SemesterType, SubjectTypes } from '@/lib/types'
import React, { useState } from 'react'
import SectionSummary from './section-summary';

interface SectionListProps {
    selectedSubject: SubjectTypes | undefined;
    setSelectedSem: (value: SemesterType) => void;
    setSelectedQtr: (value: QuarterType) => void;
    selectedQtr: QuarterType;
    selectedSem: SemesterType | undefined;
}

function SectionList({
    selectedSubject,
    setSelectedSem,
    setSelectedQtr,
    selectedQtr,
    selectedSem
}: SectionListProps) {
    // If no subject is selected, display a message
    if (!selectedSubject) return <h1>Select a subject to see more</h1>

    // Determine if the selected subject is for Senior High School (SHS)
    const isShs = selectedSubject.gradeLevel === "Grade 11" || selectedSubject.gradeLevel === "Grade 12"

    return (
        <div className='space-y-10'>
            {/* UI for Senior High School (SHS) */}
            {isShs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-3">
                        {/* Semester selection */}
                        <Label className='font-semibold'>Select a Semester</Label>
                        <RadioGroup
                            defaultValue={selectedSem}
                            onValueChange={(value) => {
                                // Update quarter based on selected semester
                                if (value === "1st semester") {
                                    setSelectedQtr("1st quarter")
                                } else {
                                    setSelectedQtr("3rd quarter")
                                }
                                setSelectedSem(value as SemesterType)
                            }}
                            className='grid grid-cols-2'
                        >
                            {selectedSubject.semester?.map((sem) => (
                                <div key={sem} className="flex items-center space-x-2">
                                    <RadioGroupItem value={sem} id={sem} />
                                    <Label htmlFor={sem}>{sem}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    <div className="space-y-3">
                        {/* Quarter selection */}
                        <Label className='font-semibold'>Select a Quarter</Label>
                        <RadioGroup
                            value={selectedQtr}
                            onValueChange={(value) => {
                                setSelectedQtr(value as QuarterType)
                            }}
                            className='grid grid-cols-2'>
                            {selectedSubject.quarter
                                ?.filter((qtr) =>
                                    // Filter quarters based on the selected semester
                                    selectedSem === "1st semester"
                                        ? qtr === "1st quarter" || qtr === "2nd quarter"
                                        : selectedSem === "2nd semester" ? qtr === "3rd quarter" || qtr === "4th quarter" : true
                                )
                                .sort((a, b) => {
                                    // Sort quarters in ascending order (1st to 4th)
                                    const order = { "1st quarter": 1, "2nd quarter": 2, "3rd quarter": 3, "4th quarter": 4 };
                                    return order[a as keyof typeof order] - order[b as keyof typeof order];
                                })
                                .map((sem) => (
                                    <div key={sem} className="flex items-center space-x-2">
                                        <RadioGroupItem value={sem} id={sem} />
                                        <Label htmlFor={sem}>{sem}</Label>
                                    </div>
                                ))}
                        </RadioGroup>
                    </div>
                </div>
            )}
            {/* UI for Junior High School (JHS) */}
            {!isShs && (
                <div className="space-y-3">
                    {/* Quarter selection */}
                    <Label className='font-semibold'>Select a Quarter</Label>
                    <RadioGroup
                        value={selectedQtr}
                        onValueChange={(value) => {
                            setSelectedQtr(value as QuarterType)
                        }}
                        className='grid grid-cols-2'>
                        {selectedSubject.quarter
                            ?.filter((qtr) =>
                                // Filter quarters based on the selected semester
                                selectedSem === "1st semester"
                                    ? qtr === "1st quarter" || qtr === "2nd quarter"
                                    : selectedSem === "2nd semester" ? qtr === "3rd quarter" || qtr === "4th quarter" : true
                            ).sort((a, b) => {
                                // Sort quarters in ascending order (1st to 4th)
                                const order = { "1st quarter": 1, "2nd quarter": 2, "3rd quarter": 3, "4th quarter": 4 };
                                return order[a as keyof typeof order] - order[b as keyof typeof order];
                            })
                            .map((sem) => (
                                <div key={sem} className="flex items-center space-x-2">
                                    <RadioGroupItem value={sem} id={sem} />
                                    <Label htmlFor={sem}>{sem}</Label>
                                </div>
                            ))}
                    </RadioGroup>
                </div>
            )}
            {/* Section summary component */}
            <div className="">
                <SectionSummary
                    selectedSubject={selectedSubject}
                    selectedQtr={selectedQtr}
                    selectedSem={selectedSem}
                />
            </div>
        </div>
    )
}

export default SectionList