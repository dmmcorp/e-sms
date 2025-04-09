import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { containerVariants, itemVariants } from '@/app/admin/_components/variants'

function Navigation() {
  return (
    <div className='space-y-5'>
       <h1 className='text-2xl font-stretch-extra-expanded text-white'> Continue as</h1>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-y-10"
      >
        <Link href={`/teacher/adviser`} className={cn(' text-white text-xl md:text-4xl tracking-widest font-extrabold ')}>
          <motion.h1
            whileHover={{scale: 1.06}}
            variants={itemVariants}
            className='hover:underline uppercase'
          >
            Adviser
          </motion.h1>
        </Link>
        <Link href={`/teacher/subject-teacher`} className={cn(' text-white text-xl md:text-4xl tracking-widest font-extrabold ')}>
          <motion.h1
            whileHover={{scale: 1.06}}
            variants={itemVariants}
            className='hover:underline uppercase'
          >
            Subject Teacher
          </motion.h1>
        </Link>
     
      </motion.div>
    </div>
  )
}

export default Navigation