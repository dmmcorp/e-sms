'use client'

import React, { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import { Doc } from '../../../../../convex/_generated/dataModel'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MapehComponent, MapehMainSubject, Quarter, QuarterAverages, QuarterGrades, StudentWithSectionStudent, SubjectType, ValidCounts } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import CustomTooltip from './custom-tooltip'

interface JrGradesTemplateProps {
    student: StudentWithSectionStudent;
    sf9?: boolean;
    sf10?: boolean
}
function JrGradesTemplate({ student, sf9, sf10}: JrGradesTemplateProps) {
    // Fetch subjects for the student
    const subjects = useQuery(api.students.getSubjects, {
        sectionSubjects: student.sectionDoc.subjects,
        studentId: student._id
    });



    // Calculate the general average across all subjects
    function calculateGeneralAverage(): number | null {
        if (!subjects || subjects.length === 0) return null;

        let total = 0;
        let count = 0;

        subjects.forEach(subject => {
            // For each quarter, pick the intervention grade if it exists, otherwise the regular grade
            const modifiedGrades = {
                "1st": subject?.interventions?.["1st"]?.grade ?? subject?.grades?.["1st"],
                "2nd": subject?.interventions?.["2nd"]?.grade ?? subject?.grades?.["2nd"],
                "3rd": subject?.interventions?.["3rd"]?.grade ?? subject?.grades?.["3rd"],
                "4th": subject?.interventions?.["4th"]?.grade ?? subject?.grades?.["4th"],
            } as const;
            const subjectAvg = calculateQuarterlyAverage(modifiedGrades);
            if (subjectAvg !== null) {
                total += subjectAvg;
                count += 1;
            }
        });

        return count > 0 ? total / count : null;
    }

    const quarters: Quarter[] = ["1st", "2nd", "3rd", "4th"];
    const calculateMapehAverage = (mapehComponents: MapehComponent[]): QuarterGrades => {
        if (!mapehComponents || mapehComponents.length === 0) return {} as QuarterGrades;

        const quarterAverages: QuarterAverages = {
            "1st": 0,
            "2nd": 0,
            "3rd": 0,
            "4th": 0
        };

        const validComponentsCount: ValidCounts = {
            "1st": 0,
            "2nd": 0,
            "3rd": 0,
            "4th": 0
        };

        mapehComponents.forEach(component => {
            quarters.forEach(quarter => {
                // First check for intervention grade, if not available use regular grade
                const grade = component?.interventions?.[quarter]?.grade ?? component?.grades?.[quarter];
                if (typeof grade === 'number') {
                    quarterAverages[quarter] += grade;
                    validComponentsCount[quarter]++;
                }
            });
        });

        return {
            "1st": validComponentsCount["1st"] ? Math.round(quarterAverages["1st"] / validComponentsCount["1st"]) : undefined,
            "2nd": validComponentsCount["2nd"] ? Math.round(quarterAverages["2nd"] / validComponentsCount["2nd"]) : undefined,
            "3rd": validComponentsCount["3rd"] ? Math.round(quarterAverages["3rd"] / validComponentsCount["3rd"]) : undefined,
            "4th": validComponentsCount["4th"] ? Math.round(quarterAverages["4th"] / validComponentsCount["4th"]) : undefined,
        };
    };

    function calculateQuarterlyAverage(grades: QuarterGrades | undefined): number | null {
        if (!grades) return null;
        const validGrades = Object.values(grades).filter((grade): grade is number => grade !== undefined);
        if (validGrades.length === 0) return null;
        const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
        // Only round to 2 decimal places for general average
        return Math.round((sum / validGrades.length) * 100) / 100;
    }

    // Determine pass/fail status based on intervention grade or quarterly average
    function getPassFailStatus(subject: SubjectType): string {
        if (!subject) return "";

        // For MAPEH main entry, use the quarterly average
        if ('isMapehMain' in subject) {
            const average = calculateQuarterlyAverage(subject.grades);
            return average !== null && average > 74 ? "Passed" : "Failed";
        }

        // For regular subjects and MAPEH components, check each quarter
        const quarters: Quarter[] = ["1st", "2nd", "3rd", "4th"];
        const grades = quarters.map(quarter => {
            // First check for intervention grade
            const interventionGrade = subject.interventions?.[quarter]?.grade;
            // If no intervention grade, use regular grade
            return interventionGrade ?? subject.grades?.[quarter];
        }).filter((grade): grade is number => grade !== undefined);

        if (grades.length === 0) return "";

        const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
        return average > 74 ? "Passed" : "Failed";
    }

       // Organize subjects with MAPEH at the bottom
    const organizedSubjects = useMemo(() => {
        if (!subjects) return [];

        // Separate MAPEH components and other subjects
        const mapehComponents = subjects.filter(subject =>
            subject?.subjectName && ["Music", "Arts", "Physical Education", "Health"].includes(subject.subjectName)
        ) as MapehComponent[];

        const otherSubjects = subjects.filter(subject =>
            subject?.subjectName &&
            !["Music", "Arts", "Physical Education", "Health", "MAPEH"].includes(subject.subjectName)
        ) as MapehComponent[];

        // If there are no MAPEH components, just return other subjects
        if (mapehComponents.length === 0) {
            return otherSubjects as SubjectType[];
        }

        // Calculate MAPEH average
        const mapehAverage = calculateMapehAverage(mapehComponents);

        // Create MAPEH main entry only if all components exist
        const orderedComponents = ["Music", "Arts", "Physical Education", "Health"];
        const sortedMapehComponents = orderedComponents
            .map(componentName =>
                mapehComponents.find(comp =>
                    comp.subjectName === componentName ||
                    (componentName === "Physical Education" && comp.subjectName === "Physical Education (PE)")
                )
            )
            .filter((comp): comp is MapehComponent => comp !== undefined)
            .map(comp => ({
                ...comp,
                isMapehComponent: true,
                subjectName: comp.subjectName === "Physical Education" ? "Physical Education (PE)" : comp.subjectName
            }));

        // Only include MAPEH main entry if all components are present
        const mapehEntry: MapehMainSubject | null = sortedMapehComponents.length === orderedComponents.length
            ? {
                _id: "mapeh",
                subjectName: "MAPEH",
                grades: mapehAverage,
                isMapehMain: true
            }
            : null;

        // Return organized subjects with MAPEH and its components at the bottom
        return [
            ...otherSubjects,
            ...(mapehEntry ? [mapehEntry] : []),
            ...sortedMapehComponents
        ] as SubjectType[];
    }, [subjects]);

    const generalAverage = calculateGeneralAverage()

    return (
        <div className='text-sm md:text-sm w-full gap-x-10'>

            <h1 className={cn(sf10 && 'hidden', 'text-sm font-semibold text-center ')}>REPORT ON LEARNING PROGRESS AND ACHIEVEMENT</h1>

            {/* Header row */}
            <div className="grid grid-cols-12 w-full text-xs items-center text-center font-semibold  bg-gray-200">
                <div className='col-span-5 text-xs h-full flex items-center justify-center pl-4 border-x border-x-black border-b-black border-b border-t-black border-t'>Learning Areas</div>
                <div className="col-span-3 grid grid-cols-4 text-center items-center">
                    <div className={cn("col-span-4 border-b border-black border-r border-r-black border-y border-y-black", sf9 ? 'text-sm p-1' : 'p-2')}>Quarter</div>
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className={cn(
                            sf10 && 'text-[0.55rem] leading-3',
                            "col-span-1 border-b border-black border-r border-r-black", sf9 ? 'text-sm p-1' : 'p-2')}>
                            {i + 1}
                        </div>
                    ))}
                </div>
                <div className='col-span-2 flex items-center border-y border-y-black border-r-black border-r justify-center h-full'>Final Rating</div>
                <div className='col-span-2 flex items-center justify-center h-full border-y border-y-black border-r-black border-r'>Remarks</div>
            </div>

               {/* Render subjects */}
            {Array.from({ length: 11 }).map((_, index) => {
                const subject = organizedSubjects[index];
                if (!subject) {

                    return (
                 
                    <div key={index} className={cn(sf10 ? "text-[0.55rem] leading-3" :"text-sm","grid grid-cols-12 w-full items-center text-center font-semibold   border-b-black border-b ")}>
                        <h1 className={cn(
                            'col-span-5 flex items-center border-x border-x-black  px-2 leading-none h-full',
                            'justify-start'
                        )}>
                            {}
                        </h1>
                        <div className="col-span-3 grid grid-cols-4">
                            {quarters.map((quarter) =>  (
                                <div key={quarter} className='col-span-1  border-black border-r h-full flex justify-center items-center min-h-[1rem]'>
                                </div>
                            ))}
                        </div>
                        <div className='col-span-2 border-black border-r h-full flex justify-center items-center min-h-[1rem]'>
                            
                        </div>
                        <div className='col-span-2 border-black border-r h-full flex justify-center items-center min-h-[1rem]'>
                            {}
                        </div>  
                    </div>
                    )
                }
                return (
                <div key={subject._id} className={cn( sf10 ? 'text-[0.55rem] leading-3 h4' : 'text-sm ' ,"grid grid-cols-12 w-full items-center text-center font-semibold ")}>
                    <div className={cn(
                        'col-span-5 h-full flex items-center border-x border-x-black border-b-black border-b',
                        'isMapehComponent' in subject && subject.isMapehComponent ? 'pl-5' : 'pl-2',
                        'justify-start'
                    )}>
                        {subject.subjectName}
                    </div>


                    <div className="col-span-3 grid grid-cols-4">
                        {quarters.map((quarter) => {
                            if ('isMapehMain' in subject && subject.isMapehMain) {
                                const grade = subject.grades[quarter];
                                
                        return (
                                <div key={quarter} className={cn(sf10 ? 'min-h-[1rem] text-0.55rem': 'min-h-[2rem] text-sm','col-span-1 border-b border-black border-r h-full flex justify-center items-center ')}>
                                        {grade !== undefined ? Math.round(grade) : ""}
                                    </div>
                                );
                            }

                            const intervention = 'interventions' in subject ? subject.interventions?.[quarter] : undefined;
                            const grade = subject.grades?.[quarter];
                            return (
                                <div key={quarter} className={cn(sf10 ? ' min-h-[1rem] text-[0.55rem]' : 'min-h-[2rem] text-sm','col-span-1 border-b border-black border-r h-full flex justify-center items-center ')}>
                                    {intervention?.grade ? (
                                        <CustomTooltip
                                            trigger={<span>{Math.round(intervention.grade)}</span>}
                                            interventionRemarks={intervention.remarks || ""}
                                            interventionUsed={intervention.used || []}
                                            initialGrade={grade?.toString() ?? ""}
                                        />
                                    ) : grade !== undefined ? Math.round(grade) : ""}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className={cn(sf10 ? ' min-h-[1rem] text-[0.55rem]' : 'min-h-[2rem] text-sm','col-span-2 border-b border-black border-r h-full flex justify-center items-center ')}>
                        {calculateQuarterlyAverage('isMapehMain' in subject && subject.isMapehMain ?
                            subject.grades :
                            {
                                "1st": 'interventions' in subject ? subject.interventions?.["1st"]?.grade ?? subject.grades?.["1st"] : subject.grades?.["1st"],
                                "2nd": 'interventions' in subject ? subject.interventions?.["2nd"]?.grade ?? subject.grades?.["2nd"] : subject.grades?.["2nd"],
                                "3rd": 'interventions' in subject ? subject.interventions?.["3rd"]?.grade ?? subject.grades?.["3rd"] : subject.grades?.["3rd"],
                                "4th": 'interventions' in subject ? subject.interventions?.["4th"]?.grade ?? subject.grades?.["4th"] : subject.grades?.["4th"],
                            }
                        )}
                    </div>
                    <div className={cn(sf10 ? ' min-h-[1rem] text-[0.55rem]' : "min-h-[2rem] text-sm", 'col-span-2 border-b border-black border-r h-full flex justify-center items-center')}>
                        { getPassFailStatus(subject) }
                    </div>

                </div>
            )})}

            {/* General average row */}
            <div className="grid grid-cols-12 w-full items-center text-center font-semibold  text-[0.55rem] leading-3">
                {sf10 && (

                    <div className={cn(
                        'col-span-5 h-full flex items-center border-x border-x-black border-b-black border-b pl-5 ',
                        'justify-start'
                    )}>
                    {}
                </div>
                )}
               
                  
                <div className={cn(sf9 ? "col-span-8 border-l-black border-l text-sm" : "col-span-3 text-xs",' border-b border-black border-r h-full  font-semibold italic flex justify-center items-center min-h-[1rem]')}>
                    General Average
                </div>
                  
                <div className={cn(sf9? "text-sm": "",'col-span-2 border-b border-black border-r h-full flex justify-center items-center min-h-[1.5rem]')}>
                {generalAverage?.toFixed(0)}
                </div>
                <div className={cn(sf9 ? "text-sm" : "",'col-span-2 border-b border-black border-r h-full flex justify-center items-center min-h-[1.5rem]')}>
                {generalAverage ? generalAverage <= 74 ? "Failed" : "Passed" : null}
                </div>
                    
            </div>
         

            {/* SF9-specific descriptors */}
            {sf9 && (
                <div className="mt-5">
                    <div className="grid grid-cols-3 font-semibold">
                        <h1>Descriptors</h1>
                        <h1>Grade Scaling</h1>
                        <h1>Remarks</h1>
                    </div>
                    <div className="grid grid-cols-3">
                        <h1>Outstanding</h1>
                        <h1>90-100</h1>
                        <h1>Passed</h1>
                    </div>
                    <div className="grid grid-cols-3">
                        <h1>Very Satisfactory</h1>
                        <h1>85-89</h1>
                        <h1>Passed</h1>
                    </div>
                    <div className="grid grid-cols-3">
                        <h1>Satisfactory</h1>
                        <h1>80-84</h1>
                        <h1>Passed</h1>
                    </div>
                    <div className="grid grid-cols-3">
                        <h1>Fairly Satisfactory</h1>
                        <h1>75-79</h1>
                        <h1>Passed</h1>
                    </div>
                    <div className="grid grid-cols-3">
                        <h1>Did Not Meet Expect</h1>
                        <h1>Below 76</h1>
                        <h1>Failed</h1>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JrGradesTemplate