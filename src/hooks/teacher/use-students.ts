'use client'
import React, { useEffect } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

function useStudents({
    sectionId
}: {
    sectionId: Id<'sections'>
}) {
    const sectionStudents = useQuery(api.students.getSectionStudents, { sectionId: sectionId})
    const isLoading = sectionStudents === undefined

    return {
        students: sectionStudents,
        isLoading,
    }
}

export default useStudents