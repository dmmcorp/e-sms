'use client'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMutation, useQuery } from 'convex/react'
import { Pencil } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MultiSelect } from '@/components/ui/multi-select'
import { api } from '../../../../../../convex/_generated/api'
import { ClassRecordTypes } from '@/lib/types'

interface InterventionDialogProp {
    open: boolean,
    setOpen: (value: boolean) => void,
    quarterlyGrade: number | undefined
    usedIntervention: string[],
    classRecord: ClassRecordTypes | null
}

export const InterventionFormSchema = z.object({
    remarks: z.string().min(1, { message: "Remarks are required." }), 
    interventionUsed: z.array(z.string()).min(1, { message: "Please select at least one intervention method." }),
    interventionGrade: z.coerce.number().min(0, { message: "Grade must be a positive number." }) 
  
})

function InterventionDialog({
    quarterlyGrade, 
    open, 
    setOpen, 
    usedIntervention,
    classRecord
}: InterventionDialogProp) {
    const interventions = useQuery(api.interventions.get)
    const saveInterventionStats = useMutation(api.classRecords.saveInterventionGrade)

    const interventionNames = interventions ? interventions.map(i => {
        return{
          label: i.name, 
          value: i.name,
          
        }
      }) : []

    const remarksValue = classRecord?.interventionRemarks ?? ""
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const modifiedG = classRecord?.interventionGrade
  

     const form = useForm<z.infer<typeof InterventionFormSchema>>({
            resolver: zodResolver(InterventionFormSchema),
            defaultValues:{
              remarks: remarksValue,
              interventionUsed: usedIntervention,
              interventionGrade: modifiedG,
            }
        })

      function onSubmit(data: z.infer<typeof InterventionFormSchema>) {
        setIsLoading(true);
        toast.promise(
          saveInterventionStats({
          id: classRecord?._id,
          remarks: data.remarks,
          interventionUsed: data.interventionUsed,
          interventionGrade: data.interventionGrade
          }),{
            loading: "Saving Interventions details",
            success: "Interventions details save successfully. :)",
            error: "Failed to save Interventions details. :(",
        });

        setIsLoading(false)
        setOpen(false)

      }
  return (
    <Dialog open={open}>
    <DialogTrigger onClick={() =>setOpen(true)}>
      <Pencil/>
    </DialogTrigger>
    <DialogContent className=' max-h-screen max-w-4xl overflow-auto text-primary space-y-2 gap-y-2'>
    <Form {...form}> 
    <form onSubmit={form.handleSubmit(onSubmit)}>
    <DialogHeader>
        <DialogTitle>
          Student Intervention Information
        </DialogTitle>
    </DialogHeader>
    <div className="my-5">
      <FormField
        name="interventionUsed"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Intervention Methods<span className='text-red-700'>*</span></FormLabel>
            <FormControl>
              <MultiSelect
                options={interventionNames}
                onValueChange={field.onChange}
                defaultValue={usedIntervention}
                placeholder="Select Intervention Methods"
                variant="default"
                className='bg-white'
              />
            </FormControl>
            <FormMessage/>
        </FormItem>
      )}/>
    </div>
    <div className="mb-5">
      <FormField
        name="remarks"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remarks<span className='text-red-700'>*</span></FormLabel>
            <FormControl>
              <Textarea 
                id="remarks"
                placeholder="Type your remarks here." 
                value={field.value} 
                onChange={field.onChange} 
                required
                className='bg-white h-36'
              />
            </FormControl>
            <FormMessage/>
        </FormItem>
      )}/>
    </div>
    <div className="mb-5">
      <FormField
        name="interventionGrade"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modified Grade<span className='text-red-700'>*</span></FormLabel>
            <FormControl>
            <Input 
              type='number'
              id="modifiedGrade"
              onChange={field.onChange}
              min={classRecord?.quarterlyGrade}
              value={field.value}
              required
              className='bg-white '
            />
            </FormControl>
            <FormMessage/>
        </FormItem>
      )}/>
    </div>
    <DialogFooter>
        <Button onClick={()=> setOpen(false)} type='button' variant={'outline'} className='text-primary'>Cancel</Button>
        <Button type='submit' disabled={isLoading} className='text-white w-32'>Save</Button>
    </DialogFooter>
    </form>
    </Form>
    </DialogContent>
  
  </Dialog>
  )
}

export default InterventionDialog