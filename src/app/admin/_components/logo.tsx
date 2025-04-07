'use client'
import { useQuery } from 'convex/react'
import React from 'react'
import { api } from '../../../../convex/_generated/api'
import Image from 'next/image'

function Logo() {
    const systemSettings = useQuery(api.systemSettings.get)
  return (
    <div className='flex items-center justify-center'>
        {systemSettings && systemSettings.schoolImage !== null ? (
            <div className="">
                <Image src={systemSettings.schoolImage} alt='Logo' fill priority className='object-cover'/>
            </div>
        ): (
            <div className="flex items-center justify-center">
                <h1>Logo</h1>
            </div>
        )}

    </div>
  )
}

export default Logo