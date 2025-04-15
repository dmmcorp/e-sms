export const DEFAULT_COLOR = "#3962c0";

export const gradeLevels = [
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
] as const;

export const quarters = [
    "1st quarter",
    "2nd quarter",
    "3rd quarter",
    "4th quarter",
] as const;

export const semesters = ["1st semester", "2nd semester"] as const;

export const gradeComponentTypes = [
    "Written Works",
    "Performance Tasks",
    "Major Exam",
] as const;

export const schoolYears = [
    "2024-2025", "2025-2026", "2026-2027", "2027-2028", "2028-2029",
    "2029-2030", "2030-2031", "2031-2032", "2032-2033", "2033-2034", "2034-2035",
    "2035-2036",
    "2036-2037",
    "2037-2038",
    "2038-2039",
    "2039-2040",
    "2040-2041",
    "2041-2042",
    "2042-2043",
    "2043-2044",
    "2044-2045"
];


export const roles = [
    {
        display: "Admin",
        value: "admin",
    },
    {
        display: "Subject Teacher",
        value: "subject-teacher",
    },
    {
        display: "Adviser",
        value: "adviser",
    },
    {
        display: "Adviser/Subject Teacher",
        value: "adviser/subject-teacher",
    },
    {
        display: "Principal",
        value: "principal",
    },
    {
        display: "Registrar",
        value: "registrar",
    },
];

export const principalDepartments = [
    {
        display: "Junior Department",
        value: "junior-department",
    },
    {
        display: "Senior Department",
        value: "senior-department",
    },
    {
        display: "Entire School",
        value: "entire-school",
    },
];

export const modules = [
    { id: "users", label: "Users" },
    { id: "systemSettings", label: "System Settings" },
    { id: "students", label: "Students" },
    { id: "enrollments", label: "Enrollments" },
    { id: "sections", label: "Sections" },
    { id: "subjects", label: "Subjects & Teaching Loads" },
    { id: "grades", label: "Grades & Class Records" },
];