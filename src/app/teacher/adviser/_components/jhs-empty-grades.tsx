import { Quarter } from "@/lib/types";
import { cn } from "@/lib/utils"

export default function JhsEmptyGrades() {
      // List of main subjects
  const mainSubjects = [
    "Filipino",
    "English",
    "Mathematics",
    "Science",
    "Araling Panlipunan (AP)",
    "Edukasyon sa Pagpapakatao (EsP)",
    "Technology and Livelihood Education (TLE)",
  ]

  // MAPEH sub-subjects
  const mapehSubjects = ["Music", "Arts", "Physical Education", "Health"]
  const quarters: Quarter[] = ["1st", "2nd", "3rd", "4th"];

    return (
    <div className='text-[0.55rem]  w-full gap-x-10'>
        {/* Header row */}
        <div className="grid grid-cols-12 w-full text-xs items-center text-center font-semibold  bg-gray-200">
            <div className='col-span-5 text-xs h-full flex items-center justify-center pl-4 border-x border-x-black border-b-black border-b border-t-black border-t'>Learning Areas</div>
            <div className="col-span-3 grid grid-cols-4 text-center items-center">
                <div className={cn("col-span-4 border-b border-black border-r border-r-black border-y border-y-black")}>Quarter</div>
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="col-span-1 border-b border-black border-r border-r-black text-[0.55rem] leading-3">
                        {i + 1}
                    </div>
                ))}
            </div>
            <div className='col-span-2 flex items-center border-y border-y-black border-r-black border-r justify-center h-full'>Final Rating</div>
            <div className='col-span-2 flex items-center justify-center h-full border-y border-y-black border-r-black border-r'>Remarks</div>
            
        </div>
        {mainSubjects.map((subject)=> (
            <div key={subject} className="grid grid-cols-12 w-full items-center text-center font-semibold  text-[0.55rem] leading-3 border-b-black border-b h-4">
                <h1 className={cn(
                    'col-span-5 flex items-center border-x border-x-black  px-2 leading-none h-full',
                    'justify-start'
                )}>
                    {subject}
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
                    { }
                </div>
                    
            </div>
        ))}
        {mapehSubjects.map((subject)=> (
            <div key={subject} className="grid grid-cols-12 w-full  items-center text-center font-semibold  text-[0.55rem] leading-3 border-b-black border-b h-4">
                <h1 className={cn(
                    'col-span-5 flex items-center border-x  border-x-black  px-2 leading-none h-full justify-start pl-5'
                )}>
                    {subject}
                </h1>
                <div className="col-span-3 grid grid-cols-4">
                    {quarters.map((quarter) =>  (
                        <div key={quarter} className='col-span-1   border-black border-r h-full flex justify-center items-center min-h-[1rem]'>
                        </div>
                    ))}
                </div>
                <div className='col-span-2 border-b border-black border-r h-full flex justify-center items-center '>
                 
                </div>
                <div className='col-span-2 border-b border-black border-r h-full flex justify-center items-center'>
                    { }
                </div>
                    
            </div>
        ))}
         <div className="grid grid-cols-12 w-full items-center text-center font-semibold  text-[0.55rem] leading-3">
                <div className={cn(
                    'col-span-5 h-full flex items-center border-x border-x-black border-b-black border-b pl-5 ',
                    'justify-start'
                )}>
                    {}
                </div>
               
                  
                <div className='col-span-3 border-b border-black border-r h-full text-xs font-semibold italic flex justify-center items-center min-h-[1.5rem]'>
                    General Average
                </div>
                  
                <div className='col-span-2 border-b border-black border-r h-full flex justify-center items-center min-h-[1.5rem]'>
                 
                </div>
                <div className='col-span-2 border-b border-black border-r h-full flex justify-center items-center min-h-[1.5rem]'>
                    { }
                </div>
                    
            </div>
    </div>
    )
  }
  