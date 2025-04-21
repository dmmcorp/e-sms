'use client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { Edit, Save } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ValuesFormSchema } from '@/lib/validation/validation-form';

interface ValuesProps {
    studentId: Id<'students'>,
    sectionStudentId: Id<'sectionStudents'>
    sf9?: boolean,
    isSHS?: boolean | string
    edit?: boolean;
    setValuesDialog: (value: boolean) => void
}
function Values({
    sf9,
    studentId,
    sectionStudentId,
    isSHS,
    edit,
    setValuesDialog
}: ValuesProps) {
    const [isEditing, setIsEditing] = useState<boolean>(edit ?? false);
  

    const value = useQuery(api.values.get, {studentId: studentId, sectionStudentId: sectionStudentId})
    const addValues = useMutation(api.values.add)

    const form = useForm<z.infer<typeof ValuesFormSchema>>({
        resolver: zodResolver(ValuesFormSchema),
        defaultValues:{
            studentId: studentId,
            sectionStudentId: sectionStudentId,
            makaDyos: {
              first: {
                first: value?.makaDyos.first.first ,
                second:value?.makaDyos.first.second,
                third: value?.makaDyos.first.third,
                fourth: value?.makaDyos.first.fourth
              },
              second:{
                first: value?.makaDyos.second.first,
                second: value?.makaDyos.second.second,
                third: value?.makaDyos.second.third,
                fourth: value?.makaDyos.second.fourth
              }
            },
            makaTao: {
              first: {
                first: value?.makaTao.first.first,
                second: value?.makaTao.first.second,
                third: value?.makaTao.first.third,
                fourth: value?.makaTao.first.fourth,
              },
              second: {
                first: value?.makaTao.second.first,
                second: value?.makaTao.second.second,
                third: value?.makaTao.second.third,
                fourth: value?.makaTao.second.fourth,
              }
            },
            makakalikasan: {
              first: {
                first: value?.makakalikasan.first.first,
                second: value?.makakalikasan.first.second,
                third: value?.makakalikasan.first.third,
                fourth: value?.makakalikasan.first.fourth,
              }
            },
            makaBansa: {
              first: {
                first: value?.makaBansa.first.first,
                second: value?.makaBansa.first.second,
                third: value?.makaBansa.first.third,
                fourth: value?.makaBansa.first.fourth,
              },
              second:{
                first: value?.makaBansa.second.first,
                second: value?.makaBansa.second.second,
                third: value?.makaBansa.second.third,
                fourth: value?.makaBansa.second.fourth,
              }
            },
        }
    })


    const valuesSelection = ["AO", "SO", "RO", "NO"]

    const onSubmit = (data: z.infer<typeof ValuesFormSchema>) =>{
        toast.promise(addValues({
            ...data,
            studentId: data.studentId as Id<'students'>,
            sectionStudentId: data.sectionStudentId as Id<'sectionStudents'>
        }),{
            loading: "Saving your input",
            success: "Values marking save successfully :)",
            error: "Saving Values marking failed :("
        })
        setIsEditing(!isEditing);
        setValuesDialog(false)
    }

  return (
    <div className="">
        <div className={cn(sf9? "hidden" : "flex justify-end")}>
            {!isEditing && (
                <Button
                type="button"
                size="default"
                variant="outline"
                className="h-7 gap-1 bg-gray-100 py-2 ml-auto"
                onClick={()=> setIsEditing(!isEditing)}
                >
                <Edit className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Edit
                </span>
                </Button>
            )}
        </div>

    <Form {...form}> 
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-end">
            {isEditing && (
                <Button
                    type="submit"
                    size="default"
                    variant="default"
                    className="h-7 text-white gap-1 py-2 ml-auto"
                >
                <Save className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Save
                </span>
                </Button>
            )}
      </div>
        
        <h1 className={cn(isSHS ? "text-[0.6rem]" : "text-lg" ,' font-semibold text-center ')}>REPORT ON LEARNER&apos;S OBSERVANCE OF VALUES</h1>
        
        <div className="grid grid-cols-12 w-full border-collapse border border-black  border-b-0 bg-gray-200 items-center text-center font-semibold text-sm">
            <div className={cn(sf9 ? "text-xs col-span-3": "col-span-4",' flex items-center justify-center  h-full border-r border-r-black ')}>Core Values</div>
            <div className={cn(sf9 ? "text-xs col-span-5": "col-span-4",' flex items-center justify-center h-full border-r border-r-black')}>Behavior Statements</div>
            <div className="col-span-4 grid grid-cols-4  text-center  items-center">
                <h1 className={cn(sf9 ? "text-xs": "",'col-span-4 border-b border-b-black')}>Quarter</h1>
                <h1 className={cn(sf9 ? "text-xs": "",'col-span-1 ')}>1</h1>
                <h1 className={cn(sf9 ? "text-xs": "",'col-span-1 border-l border-l-black')}>2</h1>
                <h1 className={cn(sf9 ? "text-xs": "",'col-span-1 border-l border-l-black')}>3</h1>
                <h1 className={cn(sf9 ? "text-xs": "",'col-span-1 border-l border-l-black')}>4</h1>
            </div>
        </div>

        {/* Core Values and Behavior Statements Section */}
        <div className="">
            {/* Maka-Diyos */}
            <div className="grid grid-cols-12 items-center text-center font-medium text-sm border border-black">
                <div  className={cn(sf9 ? "text-xs col-span-3": "col-span-4",' flex items-center justify-center  h-full border-r border-r-black ')}>Maka-Diyos</div>
                <div className={cn(sf9 ? "col-span-5" : "col-span-4" ,' h-full border-r border-r-black')}>
                    <p className={cn(sf9 ? "p-1 text-xs": "p-2", "border-b border-black leading-[1.5] text-left")}>Expresses one&apos;s spiritual beliefs while respecting the spiritual beliefs of others.</p>
                    <p className={cn(sf9 ? "p-1 text-xs": "p-2 ", "leading-[1.5] text-left")}>Shows adherence to ethical principles by upholding truth in all undertakings.</p>
                </div>
                <div className="col-span-4  h-full">
                   
                        {isEditing ? (
                            <div className="grid grid-cols-4 h-1/2">
                                <FormField
                                name="makaDyos.first.first"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaDyos.first.second"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaDyos.first.third"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaDyos.first.fourth"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                            </div>
                        ):(
                            <div className="grid grid-cols-4 h-1/2 text-xs">
                                <h1 className='flex justify-center items-center '>{value?.makaDyos.first.first}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black '>{value?.makaDyos.first.second}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaDyos.first.third}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaDyos.first.fourth}</h1>
                            </div>
                        )}
                        
                       
                        {isEditing ? (
                            <div className="grid grid-cols-4 h-1/2">
                                <FormField
                                name="makaDyos.second.first"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaDyos.second.second"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaDyos.second.third"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaDyos.second.fourth"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                            </div>
                        ):(
                            <div className="grid grid-cols-4 h-1/2 border-t border-t-black text-xs">
                                <h1 className='flex justify-center items-center '>{value?.makaDyos.second.first}</h1>
                                <h1 className='flex justify-center items-center  border-l border-l-black'>{value?.makaDyos.second.second}</h1>
                                <h1 className='flex justify-center items-center  border-l border-l-black'>{value?.makaDyos.second.third}</h1>
                                <h1 className='flex justify-center items-center  border-l border-l-black'>{value?.makaDyos.second.fourth}</h1>
                            </div>
                        )}
                </div>
            </div>

            {/* Makatao */}
            <div className="grid grid-cols-12 items-center text-center font-medium text-sm border-b border-b-black border-x border-x-black">
                <div  className={cn(sf9 ? "text-xs col-span-3": "col-span-4",' flex items-center justify-center  h-full border-r border-r-black ')}>Maka-Tao</div>
                <div className={cn(sf9 ? "col-span-5" : "col-span-4" ,' h-full border-r border-r-black text-left')}>
                    <p className={cn(sf9 ? "p-1 text-xs": "p-2", "border-b border-black leading-[1.5]")}>Is sensitive to individual, social, and cultural differences.</p>
                    <p className={cn(sf9 ? "p-1 text-xs": "p-2", "leading-[1.5]")}>Demonstrates contributions towards solidarity.</p>
                </div>
                <div className="col-span-4  h-full">
                {isEditing ? (
                            <div className="grid grid-cols-4 h-1/2">
                                <FormField
                                name="makaTao.first.first"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaTao.first.second"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaTao.first.third"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaTao.first.fourth"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                            </div>
                        ):(
                            <div className="grid grid-cols-4 h-1/2 text-xs">
                                <h1 className='flex justify-center items-center '>{value?.makaTao.first.first}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaTao.first.second}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaTao.first.third}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaTao.first.fourth}</h1>
                            </div>
                        )}
                    {isEditing ? (
                        <div className="grid grid-cols-4 h-1/2">
                            <FormField
                            name="makaTao.second.first"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makaTao.second.second"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makaTao.second.third"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makaTao.second.fourth"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                        </div>
                    ):(
                        <div className="grid grid-cols-4 h-1/2  border-t border-t-black text-xs">
                            <h1 className='flex justify-center items-center '>{value?.makaTao.second.first}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaTao.second.second}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaTao.second.third}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaTao.second.fourth}</h1>
                        </div>
                    )}
                </div>
            </div>

            {/* Maka-Kalikasan */}
            <div className="grid grid-cols-12 items-center text-center font-medium text-sm  border-x border-x-black">
                <div  className={cn(sf9 ? "text-xs col-span-3": "col-span-4",' flex items-center justify-center  h-full border-r border-r-black ')}>Maka-Kalikasan</div>
                <div className={cn(sf9 ? "col-span-5" : "col-span-4" ,' h-full border-r border-r-black')}>
                    <p className={cn(sf9 ? "p-1 text-xs": "p-2", "text-left leading-[1.5]")}>Cares for the environment and utilizes resources wisely, judiciously, and economically.</p>
                    
                </div>
                <div className="col-span-4 h-full">
                {isEditing ? (
                        <div className="grid grid-cols-4 h-1/2">
                            <FormField
                            name="makakalikasan.first.first"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makakalikasan.first.second"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makakalikasan.first.third"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makakalikasan.first.fourth"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                        </div>
                    ):(
                        <div className="grid grid-cols-4 h-full text-xs">
                            <h1 className='flex justify-center items-center '>{value?.makakalikasan.first.first}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makakalikasan.first.second}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makakalikasan.first.third}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makakalikasan.first.fourth}</h1>
                        </div>
                    )}
                   
                </div>
            </div>

            {/* Maka-Bansa */}
            <div className="grid grid-cols-12 items-center text-center font-medium text-sm border border-black">
                <div  className={cn(sf9 ? "text-xs col-span-3": "col-span-4",' flex items-center justify-center  h-full border-r border-r-black ')}>Maka-Bansa</div>
                <div className={cn(sf9 ? "col-span-5" : "col-span-4" ,' h-full border-r border-r-black')}>
                    <p className={cn(sf9 ? "p-1 text-xs": "p-2", "border-b border-black text-left leading-[1.5]")}>Demonstrates pride in being a Filipino; exercises the rights and responsibilities of a Filipino citizen.</p>
                    <p className={cn(sf9 ? "p-1 text-xs": "p-2", "text-left leading-[1.5]")}>Demonstrates appropriate behavior in carrying out activities in school, community, and country.</p>
                </div>
                <div className="col-span-4 h-full ">
                {isEditing ? (
                            <div className="grid grid-cols-4 h-1/2">
                                <FormField
                                name="makaBansa.first.first"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaBansa.first.second"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaBansa.first.third"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                                <FormField
                                name="makaBansa.first.fourth"
                                control={form.control}
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                            }}
                                            value={field.value} >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valuesSelection.map((selection) => (
                                                    <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                                )}
                                />
                            </div>
                        ):(
                            <div className="grid grid-cols-4 h-1/2 border-b border-b-black text-xs">
                                <h1 className='flex justify-center items-center '>{value?.makaBansa.first.first}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaBansa.first.second}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaBansa.first.third}</h1>
                                <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaBansa.first.fourth}</h1>
                            </div>
                        )}
                    {isEditing ? (
                        <div className="grid grid-cols-4 h-1/2">
                            <FormField
                            name="makaBansa.second.first"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makaBansa.second.second"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makaBansa.second.third"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                            <FormField
                            name="makaBansa.second.fourth"
                            control={form.control}
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Select 
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value} >
                                        <SelectTrigger className='w-full'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valuesSelection.map((selection) => (
                                                <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                            )}
                            />
                        </div>
                    ):(
                        <div className="grid grid-cols-4 h-1/2 text-xs">
                            <h1 className='flex justify-center items-center '>{value?.makaBansa.second.first}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaBansa.second.second}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaBansa.second.third}</h1>
                            <h1 className='flex justify-center items-center border-l border-l-black'>{value?.makaBansa.second.fourth}</h1>
                        </div>
                    )}
                   
                   
                </div>
            </div>
        </div>
        {isSHS ? (
        <div className="grid grid-cols-2 mt-5">
           
             <div className="flex flex-col justify-start items-center ">
                 <h1 className='text-xs text-center font-semibold border-b w-full  py-1'>Marking</h1>
                 <h2 className='text-[0.6rem] text-center w-full  '>AO</h2>
                 <h2 className='text-[0.6rem] text-center  w-full   '>SO</h2>
                 <h2 className='text-[0.6rem] text-center  w-full  '>RO</h2>
                 <h2 className='text-[0.6rem] text-center  w-full  '>NO</h2>
             </div>
             <div className="flex flex-col justify-start items-center ">
                 <h1 className='text-xs text-center font-semibold w-full  py-1'>Non-Numerical Rating</h1>
                 <h2 className='text-[0.6rem] text-center w-full  '>Always observed</h2>
                 <h2 className='text-[0.6rem] text-center w-full  '>Sometimes Observed</h2>
                 <h2 className='text-[0.6rem] text-center w-full  '>Rarely Observed</h2>
                 <h2 className='text-[0.6rem] text-center w-full  '>Not Observed</h2>
             </div>
         </div>
        ): (
        <div className="grid grid-cols-2 mt-5">
            <div className="flex flex-col justify-start items-center">
                <h1 className='text-sm font-semibold'>Marking</h1>
                <h2 className='text-sm text-left'>AO</h2>
                <h2 className='text-sm text-left'>SO</h2>
                <h2 className='text-sm text-left'>RO</h2>
                <h2 className='text-sm text-left'>NO</h2>
            </div>
            <div className="flex flex-col justify-start items-start">
                <h1 className='text-sm font-semibold'>Non-Numerical Rating</h1>
                <h2 className='text-sm text-left'>Always observed</h2>
                <h2 className='text-sm text-left'>Sometimes Observed</h2>
                <h2 className='text-sm text-left'>Rarely Observed</h2>
                <h2 className='text-sm text-left'>Not Observed</h2>
            </div>
        </div>
        )}
      
        {sf9 && isSHS && !isEditing &&  (
        <div className=" mt-5">
           
            <div className="grid grid-cols-3 font-semibold text-center text-xs">
                <h1 className='py-1'>Descriptors</h1>
                <h1 className=" py-1">Grade Scaling</h1>
                <h1 className='py-1'>Remarks</h1>
            </div>
            <div className="grid grid-cols-3  text-center text-xs">
                <h1 className=''>Outstanding</h1>
                <h1 className=" ">90-100</h1>
                <h1 className=''>Passed</h1>
            </div>
            <div className="grid grid-cols-3  text-center text-xs">
                <h1 className=''>Very Satisfactory</h1>
                <h1 className=" ">85-89</h1>
                <h1 className=''>Passed</h1>
            </div>
            <div className="grid grid-cols-3  text-center text-xs">
                <h1 className=''>Satisfactory</h1>
                <h1 className=" ">80-84</h1>
                <h1 className=''>Passed</h1>
            </div>
            <div className="grid grid-cols-3  text-center text-xs">
                <h1 className=''>Fairly Satisfactory</h1>
                <h1 className="">75-79</h1>
                <h1 className=''>Passed</h1>
            </div>
            <div className="grid grid-cols-3  text-center text-xs">
                <h1 className=''>Did Not Meet Expect</h1>
                <h1 className=" ">Below 76</h1>
                <h1 className=''>Failed</h1>
            </div>
        </div>
        )}
    </form>
    </Form>

   
    </div>
  )
}

export default Values