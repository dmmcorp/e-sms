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

export const juniorHighGrades = ["Grade 7", "Grade 8", "Grade 9", "Grade 10"];

export const seniorHighGrades = ["Grade 11", "Grade 12"];



  //transmulation table for 3 components (WW, PT, QE) 
  export const transmutationTable3 = [
    { "min": 100.00, "max": 100.00, "transmutedGrade": 100 },
    { "min": 98.40, "max": 99.99, "transmutedGrade": 99 },
    { "min": 96.80, "max": 98.39, "transmutedGrade": 98 },
    { "min": 95.20, "max": 96.79, "transmutedGrade": 97 },
    { "min": 93.60, "max": 95.19, "transmutedGrade": 96 },
    { "min": 92.00, "max": 93.59, "transmutedGrade": 95 },
    { "min": 90.40, "max": 91.99, "transmutedGrade": 94 },
    { "min": 88.80, "max": 90.39, "transmutedGrade": 93 },
    { "min": 87.20, "max": 88.79, "transmutedGrade": 92 },
    { "min": 85.60, "max": 87.19, "transmutedGrade": 91 },
    { "min": 84.00, "max": 85.59, "transmutedGrade": 90 },
    { "min": 82.40, "max": 83.99, "transmutedGrade": 89 },
    { "min": 80.80, "max": 82.39, "transmutedGrade": 88 },
    { "min": 78.20, "max": 80.79, "transmutedGrade": 87 },
    { "min": 77.60, "max": 79.19, "transmutedGrade": 86 },
    { "min": 76.00, "max": 77.59, "transmutedGrade": 85 },
    { "min": 74.40, "max": 75.99, "transmutedGrade": 84 },
    { "min": 72.80, "max": 74.38, "transmutedGrade": 83 },
    { "min": 71.20, "max": 72.79, "transmutedGrade": 82 },
    { "min": 69.60, "max": 71.19, "transmutedGrade": 81 },
    { "min": 68.00, "max": 69.59, "transmutedGrade": 80 },
    { "min": 66.40, "max": 67.98, "transmutedGrade": 79 },
    { "min": 64.80, "max": 66.39, "transmutedGrade": 78 },
    { "min": 63.20, "max": 64.79, "transmutedGrade": 77 },
    { "min": 61.60, "max": 63.19, "transmutedGrade": 76 },
    { "min": 60.00, "max": 61.59, "transmutedGrade": 75 },
    { "min": 56.00, "max": 59.99, "transmutedGrade": 74 },
    { "min": 52.00, "max": 55.99, "transmutedGrade": 73 },
    { "min": 48.00, "max": 51.99, "transmutedGrade": 72 },
    { "min": 44.00, "max": 47.99, "transmutedGrade": 71 },
    { "min": 40.00, "max": 43.99, "transmutedGrade": 70 },
    { "min": 36.00, "max": 39.99, "transmutedGrade": 69 },
    { "min": 32.00, "max": 35.99, "transmutedGrade": 68 },
    { "min": 28.00, "max": 31.99, "transmutedGrade": 67 },
    { "min": 24.00, "max": 27.99, "transmutedGrade": 66 },
    { "min": 20.00, "max": 23.99, "transmutedGrade": 65 },
    { "min": 16.00, "max": 19.99, "transmutedGrade": 64 },
    { "min": 12.00, "max": 15.99, "transmutedGrade": 63 },
    { "min": 8.00,  "max": 11.99, "transmutedGrade": 62 },
    { "min": 4.00,  "max": 7.99,  "transmutedGrade": 61 },
    { "min": 0.00,  "max": 3.99,  "transmutedGrade": 60 }
  ]

  //transmulation table for 2 components (WW, and PT) Transmutation Table for Grades 1–10 and Non-Core Subjects of TVL, Sports, and Arts & Design
  export const transmutationTableJRHigh2 = [
    { "min": 80.00, "max": 80.00, "transmutedGrade": 100 },
    { "min": 78.70, "max": 79.99, "transmutedGrade": 99 },
    { "min": 77.40, "max": 78.69, "transmutedGrade": 98 },
    { "min": 76.10, "max": 77.39, "transmutedGrade": 97 },
    { "min": 74.80, "max": 76.09, "transmutedGrade": 96 },
    { "min": 73.50, "max": 74.79, "transmutedGrade": 95 },
    { "min": 72.20, "max": 73.49, "transmutedGrade": 94 },
    { "min": 70.90, "max": 72.19, "transmutedGrade": 93 },
    { "min": 69.60, "max": 70.89, "transmutedGrade": 92 },
    { "min": 68.30, "max": 69.59, "transmutedGrade": 91 },
    { "min": 67.00, "max": 68.29, "transmutedGrade": 90 },
    { "min": 65.70, "max": 66.99, "transmutedGrade": 89 },
    { "min": 64.40, "max": 65.69, "transmutedGrade": 88 },
    { "min": 63.10, "max": 64.39, "transmutedGrade": 87 },
    { "min": 61.80, "max": 63.09, "transmutedGrade": 86 },
    { "min": 60.50, "max": 61.79, "transmutedGrade": 85 },
    { "min": 59.20, "max": 60.49, "transmutedGrade": 84 },
    { "min": 57.90, "max": 59.19, "transmutedGrade": 83 },
    { "min": 56.60, "max": 57.89, "transmutedGrade": 82 },
    { "min": 55.30, "max": 56.59, "transmutedGrade": 81 },
    { "min": 54.00, "max": 55.29, "transmutedGrade": 80 },
    { "min": 52.70, "max": 53.99, "transmutedGrade": 79 },
    { "min": 51.40, "max": 52.69, "transmutedGrade": 78 },
    { "min": 50.10, "max": 51.39, "transmutedGrade": 77 },
    { "min": 48.80, "max": 50.09, "transmutedGrade": 76 },
    { "min": 47.50, "max": 48.79, "transmutedGrade": 75 },
    { "min": 44.33, "max": 47.49, "transmutedGrade": 74 },
    { "min": 41.16, "max": 44.32, "transmutedGrade": 73 },
    { "min": 37.99, "max": 41.15, "transmutedGrade": 72 },
    { "min": 34.82, "max": 37.98, "transmutedGrade": 71 },
    { "min": 31.65, "max": 34.81, "transmutedGrade": 70 },
    { "min": 28.48, "max": 31.64, "transmutedGrade": 69 },
    { "min": 25.31, "max": 28.47, "transmutedGrade": 68 },
    { "min": 22.14, "max": 25.30, "transmutedGrade": 67 },
    { "min": 18.97, "max": 22.13, "transmutedGrade": 66 },
    { "min": 15.80, "max": 18.96, "transmutedGrade": 65 },
    { "min": 12.63, "max": 15.79, "transmutedGrade": 64 },
    { "min": 9.46, "max": 12.62, "transmutedGrade": 63 },
    { "min": 6.29, "max": 9.45, "transmutedGrade": 62 },
    { "min": 3.12, "max": 6.28, "transmutedGrade": 61 },
    { "min": 0.00, "max": 3.11, "transmutedGrade": 60 }
]
      

//transmutation table for 2 components (WW, and PT) for core subjects Work Immersion/Research/Business Enterprise/Simulation/Exhibit/Performance in the Academic Track
export const transmutationTableSHSCore2 = [
        { "min": 75.00, "max": 75.00, "transmutedGrade": 100 },
        { "min": 73.80, "max": 74.99, "transmutedGrade": 99 },
        { "min": 72.60, "max": 73.79, "transmutedGrade": 98 },
        { "min": 71.40, "max": 72.59, "transmutedGrade": 97 },
        { "min": 70.20, "max": 71.39, "transmutedGrade": 96 },
        { "min": 69.00, "max": 70.19, "transmutedGrade": 95 },
        { "min": 67.80, "max": 68.99, "transmutedGrade": 94 },
        { "min": 66.60, "max": 67.79, "transmutedGrade": 93 },
        { "min": 65.40, "max": 66.59, "transmutedGrade": 92 },
        { "min": 64.20, "max": 65.39, "transmutedGrade": 91 },
        { "min": 63.00, "max": 64.19, "transmutedGrade": 90 },
        { "min": 61.80, "max": 62.99, "transmutedGrade": 89 },
        { "min": 60.60, "max": 61.79, "transmutedGrade": 88 },
        { "min": 59.40, "max": 60.59, "transmutedGrade": 87 },
        { "min": 58.20, "max": 59.39, "transmutedGrade": 86 },
        { "min": 57.00, "max": 58.19, "transmutedGrade": 85 },
        { "min": 55.80, "max": 56.99, "transmutedGrade": 84 },
        { "min": 54.60, "max": 55.79, "transmutedGrade": 83 },
        { "min": 53.40, "max": 54.59, "transmutedGrade": 82 },
        { "min": 52.20, "max": 53.39, "transmutedGrade": 81 },
        { "min": 51.00, "max": 52.19, "transmutedGrade": 80 },
        { "min": 49.80, "max": 50.99, "transmutedGrade": 79 },
        { "min": 48.60, "max": 49.79, "transmutedGrade": 78 },
        { "min": 47.40, "max": 48.59, "transmutedGrade": 77 },
        { "min": 46.20, "max": 47.39, "transmutedGrade": 76 },
        { "min": 45.00, "max": 46.19, "transmutedGrade": 75 },
        { "min": 42.00, "max": 44.99, "transmutedGrade": 74 },
        { "min": 39.02, "max": 42.00, "transmutedGrade": 73 },
        { "min": 36.03, "max": 39.00, "transmutedGrade": 72 },
        { "min": 33.04, "max": 36.02, "transmutedGrade": 71 },
        { "min": 30.05, "max": 33.03, "transmutedGrade": 70 },
        { "min": 27.06, "max": 30.04, "transmutedGrade": 69 },
        { "min": 24.07, "max": 27.05, "transmutedGrade": 68 },
        { "min": 21.08, "max": 24.06, "transmutedGrade": 67 },
        { "min": 18.09, "max": 21.07, "transmutedGrade": 66 },
        { "min": 15.10, "max": 18.08, "transmutedGrade": 65 },
        { "min": 12.11, "max": 15.09, "transmutedGrade": 64 },
        { "min": 9.12, "max": 12.10, "transmutedGrade": 63 },
        { "min": 6.13, "max": 9.11, "transmutedGrade": 62 },
        { "min": 3.14, "max": 6.12, "transmutedGrade": 61 },
        { "min": 0.00, "max": 3.13, "transmutedGrade": 60 }
]

//2 components (WW, and PT). Transmutation Table for all other SHS Subjects in the Academic Track
export const transmutationTableSHS2 = [
    { "min": 70.00, "max": 70.00, "transmutedGrade": 100 },
    { "min": 68.90, "max": 69.99, "transmutedGrade": 99 },
    { "min": 67.80, "max": 68.89, "transmutedGrade": 98 },
    { "min": 66.70, "max": 67.79, "transmutedGrade": 97 },
    { "min": 65.60, "max": 66.69, "transmutedGrade": 96 },
    { "min": 64.50, "max": 65.59, "transmutedGrade": 95 },
    { "min": 63.40, "max": 64.49, "transmutedGrade": 94 },
    { "min": 62.30, "max": 63.39, "transmutedGrade": 93 },
    { "min": 61.20, "max": 62.29, "transmutedGrade": 92 },
    { "min": 60.10, "max": 61.19, "transmutedGrade": 91 },
    { "min": 59.00, "max": 60.09, "transmutedGrade": 90 },
    { "min": 57.90, "max": 58.99, "transmutedGrade": 89 },
    { "min": 56.80, "max": 57.89, "transmutedGrade": 88 },
    { "min": 55.70, "max": 56.79, "transmutedGrade": 87 },
    { "min": 54.60, "max": 55.69, "transmutedGrade": 86 },
    { "min": 53.50, "max": 54.59, "transmutedGrade": 85 },
    { "min": 52.40, "max": 53.49, "transmutedGrade": 84 },
    { "min": 51.30, "max": 52.39, "transmutedGrade": 83 },
    { "min": 50.20, "max": 51.29, "transmutedGrade": 82 },
    { "min": 49.10, "max": 50.19, "transmutedGrade": 81 },
    { "min": 48.00, "max": 49.09, "transmutedGrade": 80 },
    { "min": 46.90, "max": 47.99, "transmutedGrade": 79 },
    { "min": 45.80, "max": 46.89, "transmutedGrade": 78 },
    { "min": 44.70, "max": 45.79, "transmutedGrade": 77 },
    { "min": 43.60, "max": 44.69, "transmutedGrade": 76 },
    { "min": 42.50, "max": 43.59, "transmutedGrade": 75 },
    { "min": 39.67, "max": 42.49, "transmutedGrade": 74 },
    { "min": 36.84, "max": 39.66, "transmutedGrade": 73 },
    { "min": 34.00, "max": 36.83, "transmutedGrade": 72 },
    { "min": 31.18, "max": 34.00, "transmutedGrade": 71 },
    { "min": 28.35, "max": 31.17, "transmutedGrade": 70 },
    { "min": 25.52, "max": 28.34, "transmutedGrade": 69 },
    { "min": 22.69, "max": 25.51, "transmutedGrade": 68 },
    { "min": 19.86, "max": 22.68, "transmutedGrade": 67 },
    { "min": 17.03, "max": 19.85, "transmutedGrade": 66 },
    { "min": 14.20, "max": 17.02, "transmutedGrade": 65 },
    { "min": 11.37, "max": 14.19, "transmutedGrade": 64 },
    { "min": 8.54, "max": 11.36, "transmutedGrade": 63 },
    { "min": 5.71, "max": 8.53, "transmutedGrade": 62 },
    { "min": 2.88, "max": 5.70, "transmutedGrade": 61 },
    { "min": 0.00, "max": 2.87, "transmutedGrade": 60 }
  ]
  