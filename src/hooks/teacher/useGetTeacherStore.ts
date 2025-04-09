import useTeacherStore from "@/app/teacher/_store/useTeacher"
import { useCurrentUser } from "@/features/current/api/use-current-user"
import { TeacherTypes } from "@/lib/types"

// This function sets the teacher data in the context store(zustand)
export const useGetTeacherStore = () =>{
    const {user, isLoading} = useCurrentUser()
    const setTeacher = useTeacherStore(state => state.setTeacher)
  
    if(!isLoading && user ) {
       setTeacher(user as TeacherTypes)
    } 

    return
}