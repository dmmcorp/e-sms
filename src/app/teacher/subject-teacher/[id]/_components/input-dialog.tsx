'use client'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'
import { DialogType } from './input-grades';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Lock, X } from 'lucide-react';
import { calculatePercentageScore, calculateWeightedScore, cn } from '@/lib/utils';
import { Doc, Id } from '../../../../../../convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { toast } from 'sonner';
import { StudentScoresType } from '@/lib/types';
import SubmitDialog from './submit-dialog';

interface InputDialogProps {
    dialogOpen: boolean;
    setDialogOpen: (value: boolean) => void;
    title: DialogType | undefined;
    learningMode: "Face to face" | "Modular" | "Other";
    highestScores: Doc<'highestScores'>[];
    wwGradeWeights: number | undefined;
    ptGradeWeights: number | undefined;
    meGradeWeights: number | undefined;
    loadId: Id<'teachingLoad'>;
    studentScores: StudentScoresType | undefined;
    transmutedGrade: number | undefined;
    isSubmitted: boolean | undefined
    component: "Written Works" | "Performance Tasks" | "Major Exam"
}

function InputDialog({
    dialogOpen, 
    setDialogOpen,
    title,
    highestScores,
    wwGradeWeights,
    ptGradeWeights,
    meGradeWeights,
    loadId,
    studentScores,
    transmutedGrade,
    isSubmitted,
    component,
}: InputDialogProps ) {
    const [scoresInput, setScoresInput] = useState<{ [key: number]: number }>({});
    const [maxInputs, setMaxInputs] = useState<number>(0);
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false);
    const totalScore = Object.values(scoresInput).reduce((acc, curr) => acc + curr, 0);
    
    const saveHighestScores = useMutation(api.teachingLoad.saveHighestScores);
    const createComponentScore = useMutation(api.classRecords.createComponentScore);
    const saveQuarterlyGrades = useMutation(api.classRecords.saveQuarterlyGrades);

    let gradeWeight;
    switch (component) {
        case "Written Works":
            gradeWeight = wwGradeWeights;
            break;
        case "Performance Tasks":
            gradeWeight = ptGradeWeights;
            break;
        case "Major Exam":
            gradeWeight = meGradeWeights;
            break;
        default:
            gradeWeight = undefined;
            break;
    };

    useEffect(() => {
        if (!dialogOpen) return;
    
        const formattedScores: { [key: number]: number } = {};
        let currentScores;
    
        if (title === 'highest scores') {
            // Highest scores: fixed limits
            if (component === 'Written Works' || component === 'Performance Tasks') {
                setMaxInputs(10);
            } else if (component === 'Major Exam') {
                setMaxInputs(1);
            }
    
            currentScores = highestScores.find(s => s.componentType === component)?.scores || [];
        } else {
            // Student scores: limit to number of items in highest scores
            const highest = highestScores.find(s => s.componentType === component);
            setMaxInputs(highest?.scores.length || 0);
    
            if (component === 'Written Works') {
                currentScores = studentScores?.written || [];
            }
            if (component === 'Performance Tasks') {
                currentScores = studentScores?.performance || [];
            }
            if (component === 'Major Exam') {
                currentScores = studentScores?.exam || [];
            }
        }
    
        if (currentScores) {
            currentScores.forEach(score => {
                formattedScores[score.assessmentNo] = score.score;
            });
            setScoresInput(formattedScores);
        }
    }, [dialogOpen, component, highestScores, studentScores, title]);
    

    const handleSaveScore = () =>{
        setIsSaving(true)
        const transformedScores = Object.entries(scoresInput)
            .filter(([_, score]) => !isNaN(score)) // filter out empty or invalid
            .map(([assessmentNo, score]) => ({
            assessmentNo: parseInt(assessmentNo),
            score: Number(score),
        }));
        if(title === 'highest scores') {
            toast.promise(saveHighestScores({
                loadId: loadId,
                componentType: component,
                scores: transformedScores
            }),{
                loading: "Saving scores...",
                success: "Scores saved successfully.",
                error: "Unable to save the scores"
            })
        } else {
            toast.promise(createComponentScore({
                classRecordId: studentScores?.classRecord._id,
                componentType: component,
                scores: transformedScores
            }),{
                loading: "Saving scores...",
                success: "Scores saved successfully.",
                error: "Unable to save the scores"
            })
        }
        setIsSaving(false)
        setDialogOpen(false)
    };

    const handleOnChange = (e:React.ChangeEvent<HTMLInputElement> ,index: number) =>{
        const rawValue = parseFloat(e.target.value);
        const highestScoreObj = highestScores.find(hs => hs.componentType === component);
        const maxScore = highestScoreObj?.scores.find(s => s.assessmentNo === index + 1)?.score ?? Infinity;

        if (!isNaN(rawValue) && rawValue <= maxScore) {
            setScoresInput(prev => ({
                ...prev,
                [index + 1]: rawValue
            }));
        } else if (rawValue > maxScore) {
            toast.warning(`Score cannot exceed the highest score (${maxScore})`);
        }
    }

    const handleSubmitGrades = () =>{
        setIsSaving(true)

        toast.promise(saveQuarterlyGrades({
            loadId: loadId,
            studentId: studentScores?._id,
            transmutedGrade: transmutedGrade,
        }),{
            loading: "Submitting grades...",
            success: "Submitted successfully/",
            error: "Failed to submit grades.",
        })
        setOpen(false)
        setDialogOpen(false)
        setIsSaving(false)
    }

    const isReadyToSubmit = () => {
        if (!studentScores) return false;
      
        return (
          studentScores.written.length >= 1 &&
          studentScores.performance.length >= 1 &&
          studentScores.exam.length >= 1
        );
      };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
        <DialogContent className=''>
            <div className="flex items-center justify-between w-full ">
                <DialogTitle className='capitalize '>
                    {title}
                </DialogTitle>
                <div className="text-sm font-medium text-gray-500">
                  {component}
                </div>
                {isSubmitted ? (
                    <div className="">
                      
                    </div>
                ):(
                    <div className="">
                        <Button 
                            variant="default" 
                            onClick={() => {setOpen(true)}}
                            className={cn(
                                !transmutedGrade ? "hidden" : "flex",
                            )}
                            disabled={isSubmitted || !isReadyToSubmit() || isSaving}
                            >
                            <Lock className="mr-2 h-4 w-4" />
                            Submit Grades
                        </Button>
                        <SubmitDialog 
                            transmutedGrade={transmutedGrade}
                            onOpenDialog={open}
                            setOpenDialog={setOpen}
                            isSaving={isSaving}
                            handleSumbit={handleSubmitGrades}
                        />
                    </div>
                )}
              
            </div>
            {component === "Major Exam" ? (
                <div className="space-y-2">
                    <div className="">
                        <Input
                            id={component + ("1")}
                            name={component + ("1")}
                            placeholder={`Enter exam score`}
                            value={scoresInput["1"] ?? ''}
                            max={highestScores.find(hs => hs.componentType === component)?.scores.find(s => s.assessmentNo === 1)?.score ?? Infinity}
                            onChange={(e) => {
                                const rawValue = parseFloat(e.target.value);
                                const highestScoreObj = highestScores.find(hs => hs.componentType === component);
                                const maxScore = highestScoreObj?.scores.find(s => s.assessmentNo === 1)?.score ?? Infinity;
                            
                                if (!isNaN(rawValue) && rawValue <= maxScore) {
                                    setScoresInput(prev => ({
                                        ...prev,
                                        ["1"]: rawValue
                                    }));
                                } else if (rawValue > maxScore) {
                                    toast.warning(`Score cannot exceed the highest score (${maxScore})`);
                                }
                            }}
                        />
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                    <h3 className='flex items-center justify-between font-medium'>
                        Total:
                        <span className='text-xl font-bold'>{totalScore}</span>
                    </h3>
                    <h3 className='flex items-center justify-between font-medium'>
                        Percentage Score:
                        <span className='text-xl font-bold'>
                        {
                            calculatePercentageScore(
                            totalScore,
                            title === "highest scores" 
                                ? totalScore 
                                : highestScores.find(s => s.componentType === component)?.scores
                                    .reduce((acc, score) => acc + score.score, 0) || 1 // prevent divide by 0
                            ).toFixed(1)
                        }
                        </span>
                    </h3>
                    <h3 className='flex items-center justify-between font-medium'>
                        Weighted Score:
                        <span className='text-xl font-bold'>
                        {
                            calculateWeightedScore(
                            calculatePercentageScore(
                                totalScore,
                                title === "highest scores" 
                                    ? totalScore 
                                    : highestScores.find(s => s.componentType === component)?.scores
                                        .reduce((acc, score) => acc + score.score, 0) || 1
                            ),
                            gradeWeight ?? 0
                            ).toFixed(1)
                        }
                        </span>
                    </h3>
                </div>
                </div>
            ):(
            <div className="space-y-2">
            
                <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: maxInputs }).map((_, index) => (
                    <div key={index} className="space-y-3">
                        <Label htmlFor={component+(index+1)} className='text-nowrap'>Score # {index + 1} </Label>
                        <Input
                            id={component + (index + 1)}
                            name={component + (index + 1)}
                            placeholder={`Score`}
                            type="number"
                            max={title === "highest scores" ? 100 : highestScores.find(s => s.componentType === component)?.scores[index]?.score ?? 100}
                            value={scoresInput[index + 1] ?? ''}
                            onChange={(e) => handleOnChange(e,index)}
                        />

                    </div>
                ))}
                </div>
                <div className="bg-muted p-4 rounded-lg">
                    <h3 className='flex items-center justify-between font-medium'>
                        Total:
                        <span className='text-xl font-bold'>{totalScore}</span>
                    </h3>
                    <h3 className='flex items-center justify-between font-medium'>
                        Percentage Score:
                        <span className='text-xl font-bold'>
                        {
                            calculatePercentageScore(
                                totalScore,
                                title === "highest scores" 
                                    ? totalScore 
                                    : highestScores.find(s => s.componentType === component)?.scores
                                        .reduce((acc, score) => acc + score.score, 0) || 1
                            ).toFixed(1)
                        }
                        </span>
                    </h3>
                    <h3 className='flex items-center justify-between font-medium'>
                        Weighted Score:
                        <span className='text-xl font-bold'>
                        {
                            calculateWeightedScore(
                            calculatePercentageScore(
                                totalScore,
                                title === "highest scores" 
                                    ? totalScore 
                                    : highestScores.find(s => s.componentType === component)?.scores
                                        .reduce((acc, score) => acc + score.score, 0) || 1
                            ),
                            gradeWeight ?? 0
                            ).toFixed(1)
                        }
                        </span>
                    </h3>
                </div>
            </div>
            )}
            <DialogFooter>
            
                <div className="flex gap-x-5">
                    <Button variant="outline" onClick={() => {setDialogOpen(false)}}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button onClick={handleSaveScore} >
                    {isSaving ? (
                        <span className="flex items-center">
                        <span className="animate-spin mr-2">⏳</span> Saving...
                    </span>
                    ): (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Save
                        </>
                    )}
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default InputDialog