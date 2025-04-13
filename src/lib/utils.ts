import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SectionType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const gradeLevels = [
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
]

export const schoolYears = [
  "2024-2025",
  "2025-2026",
  "2026-2027",
  "2027-2028",
  "2028-2029",
  "2029-2030",
  "2030-2031",
  "2031-2032",
  "2032-2033",
  "2033-2034",
  "2034-2035",
  "2035-2036",
  "2036-2037",
  "2037-2038",
  "2038-2039",
  "2039-2040",
  "2040-2041",
  "2041-2042",
  "2042-2043",
  "2043-2044",
  "2044-2045",
];

export function formatDate(convexDate: number | undefined) {
  if(!convexDate) return undefined
  const roundedTimestamp = Math.floor(convexDate);

  const readableDate = new Date(roundedTimestamp);
  const formattedDate = readableDate.toLocaleString();

  return formattedDate
}

export function calculatePercentageScore(totalScore: number, highestPossibleScore: number): number {
  if (highestPossibleScore === 0 || totalScore === 0) {
    return 0; // Returning 0 instead of throwing an error
  }
  return (totalScore / highestPossibleScore) * 100;
};

export function calculateWeightedScore(percentageScore: number, gradeWeightPercentage: number): number {
  if (gradeWeightPercentage < 0 || gradeWeightPercentage > 100) {
    return 0; // Returning 0 instead of throwing an error
  }

  const gradeWeightDecimal = gradeWeightPercentage / 100; // Convert to decimal
  return percentageScore * gradeWeightDecimal;
}
type Scores = {
  assessmentNo: number;
  score: number;
}[] | undefined
export function getTotalScore(scores: Scores,) {
  if (!scores) return 0

  return scores.reduce((sum, item)=> sum + item.score, 0)
};

export function isSHS(section: SectionType){
  const gradeLevel = section.gradeLevel
  if(gradeLevel === "Grade 11" || gradeLevel === "Grade 12"){
    return true
  } else {
    return false
  }
}


// Generate a unique ID for each subject
export const generateId = () =>
  `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;