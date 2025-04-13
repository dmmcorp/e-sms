import { Doc } from "../../convex/_generated/dataModel";

export type SchoolYearTypes =
  "2024-2025" |
  "2025-2026" |
  "2026-2027" |
  "2027-2028" |
  "2028-2029" |
  "2029-2030" |
  "2030-2031" |
  "2031-2032" |
  "2032-2033" |
  "2033-2034" |
  "2034-2035" |
  "2035-2036" |
  "2036-2037" |
  "2037-2038" |
  "2038-2039" |
  "2039-2040" |
  "2040-2041" |
  "2041-2042" |
  "2042-2043" |
  "2043-2044" |
  "2044-2045";

export type GradeLevelsTypes =
  "Grade 7" |
  "Grade 8" |
  "Grade 9" |
  "Grade 10" |
  "Grade 11" |
  "Grade 12";

export type SemesterType =
  "1st semester" |
  "2nd semester";

export type QuarterType =
  "1st quarter" |
  "2nd quarter" |
  "3rd quarter" |
  "4th quarter";

export type RoleType =
| "admin"
| "subject-teacher"
| "adviser"
| "adviser/subject-teacher"
| "principal"
| "registrar";

export type PrincipalDepartmentType =
  "junior-department" |
  "senior-department" |
  "entire-school"

export type SectionType = Doc<'sections'>;
export type TeacherTypes = Doc<'users'>;
export type SubjectTypes = Doc<'subjectThought'>;
export type StudentTypes = Doc<'students'>;

interface ClassRecordWithStudentInfo extends Doc<'classRecords'>{
  student: Doc<'students'> 
}
interface subjectThoughtWithTeacherInfo extends Doc<'subjectThought'>{
  teacher: Doc<'users'> | null
}

interface EnrollmentWithSection extends Doc<'enrollment'>{
  section: Doc<'sections'> | null
}

export interface StudentWithEnrollment extends Doc<'students'>{
  enrollment: EnrollmentWithSection[],
  currentSection: EnrollmentWithSection | undefined
}

export interface TeachingLoadType extends Doc<'teachingLoad'>{
  section: Doc<'sections'>
  subjectThought: subjectThoughtWithTeacherInfo;
  classRecords: ClassRecordWithStudentInfo[];
  highestScores: Doc<'highestScores'>[]

}
