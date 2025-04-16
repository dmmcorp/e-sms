'use client'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'
import { DialogType } from './input-grades';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { TabsList } from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { calculatePercentageScore, calculateWeightedScore } from '@/lib/utils';
import { Doc, Id } from '../../../../../../convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { toast } from 'sonner';
import { StudentScoresType } from '@/lib/types';

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
}
type GradeComponentsType = 'Written Works' | 'Performance Tasks'| 'Major Exam';

function InputDialog({
    dialogOpen, 
    setDialogOpen,
    title,
    learningMode,
    highestScores,
    wwGradeWeights,
    ptGradeWeights,
    meGradeWeights,
    loadId,
    studentScores,
}: InputDialogProps ) {
    const [scoresInput, setScoresInput] = useState<{ [key: number]: number }>({});
    const [maxInputs, setMaxInputs] = useState<number>(0);
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const gradeComponents = ['Written Works', 'Performance Tasks', 'Major Exam']
    const [selectedContent, setSelectedContent ] = useState<GradeComponentsType>("Written Works")        
    const totalScore = Object.values(scoresInput).reduce((acc, curr) => acc + curr, 0);
    
    const saveHighestScores = useMutation(api.teachingLoad.saveHighestScores)
    const createComponentScore = useMutation(api.classRecords.createComponentScore)

    let gradeWeight
    switch (selectedContent) {
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
            if (selectedContent === 'Written Works' || selectedContent === 'Performance Tasks') {
                setMaxInputs(10);
            } else if (selectedContent === 'Major Exam') {
                setMaxInputs(1);
            }
    
            currentScores = highestScores.find(s => s.componentType === selectedContent)?.scores || [];
        } else {
            // Student scores: limit to number of items in highest scores
            const highest = highestScores.find(s => s.componentType === selectedContent);
            setMaxInputs(highest?.scores.length || 0);
    
            if (selectedContent === 'Written Works') {
                currentScores = studentScores?.written || [];
            }
            if (selectedContent === 'Performance Tasks') {
                currentScores = studentScores?.performance || [];
            }
            if (selectedContent === 'Major Exam') {
                currentScores = studentScores?.exam || [];
            }
        }
    
        if (currentScores) {
            currentScores.forEach(score => {
                formattedScores[score.assessmentNo] = score.score;
            });
            setScoresInput(formattedScores);
        }
    }, [dialogOpen, selectedContent, highestScores, studentScores, title]);
    

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
                componentType: selectedContent,
                scores: transformedScores
            }),{
                loading: "Saving scores...",
                success: "Scores saved successfully.",
                error: "Unable to save the scores"
            })
        } else {
            toast.promise(createComponentScore({
                classRecordId: studentScores?.classRecord._id,
                componentType: selectedContent,
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
        const highestScoreObj = highestScores.find(hs => hs.componentType === selectedContent);
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

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className=''>
            <DialogTitle className='capitalize'>{title}</DialogTitle>
            <Tabs onValueChange={(value) => setSelectedContent(value as GradeComponentsType)}>
                <TabsList className='bg-muted p-1 grid grid-cols-3'>
                    {gradeComponents.map(c => (
                        <TabsTrigger key={c} value={c} className='rounded-none'>{c}</TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value={selectedContent}>
                    {selectedContent === "Major Exam" ? (
                        <div className="space-y-2">
                            <div className="">
                                <Input
                                    id={selectedContent + ("1")}
                                    name={selectedContent + ("1")}
                                    placeholder={`Enter exam score`}
                                    value={scoresInput["1"] ?? ''}
                                    onChange={(e) => {
                                        const rawValue = parseFloat(e.target.value);
                                        const highestScoreObj = highestScores.find(hs => hs.componentType === selectedContent);
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
                            <div className="bg-muted p-1">
                                <h3 className='flex items-center justify-between'>Total: 
                                    <span>{totalScore}</span>
                                </h3>
                                <h3 className='flex items-center justify-between'>Percentage Score: 
                                    <span>{calculatePercentageScore(totalScore, totalScore)}</span>
                                </h3>
                                <h3 className='flex items-center justify-between'>Weighted Score: 
                                    <span>{ 
                                        calculateWeightedScore(
                                            calculatePercentageScore(totalScore, totalScore),
                                            gradeWeight ?? 0
                                    )}
                                    </span>
                                </h3>
                            </div>
                        </div>
                    ):(
                    <div className="space-y-2">
                    
                        <div className="grid grid-cols-5 gap-3">
                        {Array.from({ length: maxInputs }).map((_, index) => (
                            <div key={index} className="space-y-3">
                                <Label htmlFor={selectedContent+(index+1)} className='text-nowrap'>Score # {index + 1} </Label>
                                <Input
                                    id={selectedContent + (index + 1)}
                                    name={selectedContent + (index + 1)}
                                    placeholder={`Score`}
                                    type="number"
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
                                    highestScores.find(s => s.componentType === selectedContent)?.scores
                                        .reduce((acc, score) => acc + score.score, 0) || 1 // prevent divide by 0
                                    )
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
                                        highestScores.find(s => s.componentType === selectedContent)?.scores
                                        .reduce((acc, score) => acc + score.score, 0) || 1
                                    ),
                                    gradeWeight ?? 0
                                    )
                                }
                                </span>
                            </h3>
                        </div>
                    </div>
                    )}
                    
                </TabsContent>
            </Tabs>
            <DialogFooter>
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
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default InputDialog