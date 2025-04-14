"use client"
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { QuarterType, SemesterType } from '@/lib/types'
import React from 'react'

interface SelectProps{
    selectedSem: SemesterType | undefined;
    selectedQtr: QuarterType;
    setSelectedQtr: (value: QuarterType) => void;
    setSelectedSem: (value: SemesterType) => void;
    isShs: boolean;
}
function SelectSemAndQtr({
    selectedSem,
    selectedQtr,
    setSelectedQtr,
    setSelectedSem,
    isShs
}: SelectProps) {
    
  return (
    <div className='mb-5'>
        {isShs && (
            <div className="grid grid-cols-2">
                <div className="space-y-3">
                    {/* Semester selection */}
                    <Label>Select a Semester:</Label>
                    <RadioGroup 
                        defaultValue={selectedSem}
                        onValueChange={(value) => {
                            // Update quarter based on selected semester
                        if(value === "1st semester") {
                            setSelectedQtr("1st quarter")
                        } else {
                            setSelectedQtr("3rd quarter")
                        }
                            setSelectedSem(value as SemesterType)
                        }}
                        className='grid grid-cols-2 px-10'
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={"1st semester"} id={"1st semester"} />
                            <Label htmlFor={"1st semester"}>{"1st semester"}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={"2nd semester"} id={"2nd semester"} />
                            <Label htmlFor={"2nd semester"}>{"2nd semester"}</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-3">
                    {/* Quarter selection */}
                    <Label className=''>Select a Quarter:</Label>
                    <RadioGroup 
                        value={selectedQtr}
                        onValueChange={(value) => {
                            setSelectedQtr(value as QuarterType)
                        }}
                        className='grid grid-cols-2 px-10'>
                        {selectedSem === "1st semester" ? (
                            <div className="contents">

                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value={"1st quarter"} id={"1st quarter"} />
                                <Label htmlFor={"1st quarter"}>{"1st quarter"}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value={"2nd quarter"} id={"2nd quarter"} />
                                <Label htmlFor={"2nd quarter"}>{"2nd quarter"}</Label>
                                </div>
                            </div>
                            ): (
                            <div className="contents">

                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value={"3rd quarter"} id={"3rd quarter"} />
                                <Label htmlFor={"3rd quarter"}>{"3rd quarter"}</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value={"4th quarter"} id={"4th quarter"} />
                                <Label htmlFor={"4th quarter"}>{"4th quarter"}</Label>
                                </div>
                            </div>
                        )}
                    </RadioGroup>
                </div>
            </div>
        )}
        {/* UI for Junior High School (JHS) */}
        {!isShs && (
            <div className="space-y-3">
                {/* Quarter selection */}
                <Label className=''>Select a Quarter:</Label>
                <RadioGroup 
                    value={selectedQtr}
                    onValueChange={(value) => {
                        setSelectedQtr(value as QuarterType)
                    }}
                    className='grid grid-cols-2 px-10'>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value={"1st quarter"} id={"1st quarter"} />
                        <Label htmlFor={"1st quarter"}>{"1st quarter"}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value={"2nd quarter"} id={"2nd quarter"} />
                        <Label htmlFor={"2nd quarter"}>{"2nd quarter"}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value={"3rd quarter"} id={"3rd quarter"} />
                        <Label htmlFor={"3rd quarter"}>{"3rd quarter"}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value={"4th quarter"} id={"4th quarter"} />
                        <Label htmlFor={"4th quarter"}>{"4th quarter"}</Label>
                    </div>
                </RadioGroup>
            </div>    
        )}
    </div>
  )
}

export default SelectSemAndQtr