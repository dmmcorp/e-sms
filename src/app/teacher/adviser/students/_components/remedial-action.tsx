'use client'
import { StudentWithFinalGrades } from '@/lib/types';
import { Calculator, CalendarIcon, Edit, Save, User } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '../../../../../../convex/_generated/dataModel';

interface ActionCeilProps {
    student: StudentWithFinalGrades
}
function RemedialActions({
    student
}: ActionCeilProps) {
    const createLogs = useMutation(api.logs.createUserLogs);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const router = useRouter()
    const studentName = `${student.lastName}, ${student.firstName} ${student.middleName}`
    const grades = student.finalGrades
    const [conductedFrom, setConductedFrom] = useState<Date | undefined>(undefined)
    const [conductedTo, setConductedTo] = useState<Date | undefined>(undefined)
    const [remedialMarks, setRemedialMarks] = useState<Record<Id<'finalGrades'>, number>>({});
    const saveRemedialData = useMutation(api.finalGrades.saveRemedialData)

    useEffect(() => {
        if (student.finalGrades.length > 0) {
            // Set default values for conductedFrom and conductedTo
            setConductedFrom(student.finalGrades[0]?.remedialConductedFrom ? new Date(student.finalGrades[0]?.remedialConductedFrom) : undefined);
            setConductedTo(student.finalGrades[0]?.remedialConductedTo ? new Date(student.finalGrades[0]?.remedialConductedTo) : undefined);

            // Set default values for remedialMarks
            if (student.finalGrades) {
                const initialRemedialMarks: Record<Id<'finalGrades'>, number> = {};
                student.finalGrades.forEach((grade) => {
                    if (grade.remedialGrade !== undefined) {
                        initialRemedialMarks[grade._id] = grade.remedialGrade;
                    }
                });
                setRemedialMarks(initialRemedialMarks);
            }
        }
    }, [student]);
    
    const handleInputChange = (key: Id<'finalGrades'>, value: number) => {
        setRemedialMarks((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const formatDate = (date: Date) => {
        return format(date, "MMM d, yyyy")
    }

    function handleSave():void {
        if(!conductedFrom || !conductedTo) {
            toast.error("Please select both 'Conducted From' and 'Conducted To' dates before saving.")
            return
        }
        toast.promise(
            saveRemedialData({
            remedialMarks: remedialMarks,
            conductedFrom: conductedFrom.toISOString(),
            conductedTo: conductedTo.toISOString(),
            studentId: student._id,
            }),
            {
            loading: "Saving remedial data...",
            success: async () => {
                await createLogs({
                    action: "update",
                    details: `Saved remedial data for ${studentName}`,
                });
                return "Remedial data saved successfully!"
            },
            error: async (error) => {
                await createLogs({
                    action: "update",
                    details: `Failed to save remedial data for ${studentName}`,
                });
                return "Failed to save remedial data. Please try again."
            }
            }
        );

        setDialogOpen(false)
    }
    return (    
        <div>
            <Button size={'icon'} variant={'outline'} onClick={() => setDialogOpen(true)}><Edit/></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='md:max-w-6xl max-h-screen overflow-auto'>
                    <DialogTitle>Manage Summer/Remedial Class</DialogTitle>
                    <div className="flex gap-x-1 items-center ">
                        <User className="size-7 mr-2" />
                        <h1 className='text-lg font-semibold capitalize'>{studentName}</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="conductedFrom" className="text-sm text-muted-foreground">
                            Conducted From
                            </Label>
                            <Popover>
                            <PopoverTrigger className='w-full'>
                                <Button variant="outline" className="w-full justify-start text-left font-normal" id="conductedFrom">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {conductedFrom ? formatDate(conductedFrom) : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={conductedFrom} onSelect={setConductedFrom} initialFocus />
                            </PopoverContent>
                            </Popover>
                            {!conductedFrom && (
                            <p className="text-red-500 text-sm mt-1">This field is required.</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="conductedTo" className="text-sm text-muted-foreground">
                            Conducted To
                            </Label>
                            <Popover>
                            <PopoverTrigger className='w-full'>
                                <Button variant="outline" className="w-full justify-start text-left font-normal" id="conductedTo">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {conductedTo ? formatDate(conductedTo) : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={conductedTo}
                                onSelect={(date) => {
                                    if (date) {
                                    setConductedTo(date);
                                    }
                                }}
                                initialFocus
                                disabled={(date) => (conductedFrom ? date < conductedFrom : false)}
                                />
                            </PopoverContent>
                            </Popover>
                            {!conductedTo && (
                            <p className="text-red-500 text-sm mt-1">This field is required.</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {grades.map((grade, index) => (
                             <Card key={index}>
                             
                             <CardContent>
                               <div className="space-y-4">
                                 <div>
                                   <Label className="text-sm text-muted-foreground">Subject</Label>
                                   <p className="font-medium text-lg">{grade.subject?.subjectName}</p>
                                 </div>
                   
                                 <div>
                                   <Label className="text-sm text-muted-foreground">Final Rating</Label>
                                   <p className={`font-medium text-lg`}>{grade.generalAverage}</p>
                                 </div>
                   
                                 <div>
                                   <Label htmlFor="remedialMark" className="text-sm text-muted-foreground">
                                     Remedial Mark
                                   </Label>
                                   <Input
                                        type="number"
                                        className="mt-2 p-1 border rounded text-sm w-40"
                                        placeholder="Enter grade"
                                        required
                                        value={remedialMarks[grade._id] || ''}
                                        onChange={(e) => handleInputChange(grade._id, Number(e.target.value))}
                                    />
                                 </div>
                   
                                 <Separator />
                   
                                 <div>
                                   <Label className="text-sm text-muted-foreground">Recomputed Final Grade</Label>
                                   <div className="flex items-center mt-1">
                                     { remedialMarks[grade._id] ?  (
                                        (remedialMarks[grade._id] + grade.generalAverage)/2
                                        ) : 
                                        "Enter remedial mark to calculate"
                                    }
                                   </div>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                        ))}
                    </div>
                    <div className="mt-6 text-sm text-muted-foreground">
                        <p className="flex items-center">
                        <Calculator className="h-4 w-4 mr-2" />
                            Formula: Final Grade = (Final Rating + Remedial Mark) ÷ 2
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant={'secondary'} onClick={()=> setDialogOpen(false)} className="mt-4 md:mt-0">
                           
                            Close
                        </Button>
                        <Button onClick={handleSave} className="mt-4 md:mt-0">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default RemedialActions