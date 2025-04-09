// Importing the TeacherTypes type from a shared types file
import { TeacherTypes } from "@/lib/types";
// Importing the Zustand library for state management
import { create } from "zustand";

// Defining the structure of the store's state
type PropertyStore = {
    teacher: TeacherTypes | null | undefined; // The teacher object, which can be undefined
    setTeacher: (teacher: TeacherTypes | undefined) => void;
};

// Creating a Zustand store for managing teacher-related state
const useTeacherStore = create<PropertyStore>((set) => ({
        teacher: undefined, // Initial state of the teacher is undefined

        // Function to update the teacher state
        setTeacher: (teacher: TeacherTypes | null | undefined) => set({ teacher }),
}));

export default useTeacherStore;