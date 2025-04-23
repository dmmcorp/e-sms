import { Doc, Id } from "../../convex/_generated/dataModel";

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
  "entire-school";


export type AssessmentNoType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type SectionType = Doc<'sections'>;
export type TeacherTypes = Doc<'users'>;
export type SubjectTypes = Doc<'subjectTaught'>;
export type StudentTypes = Doc<'students'>;
export type ClassRecordTypes = Doc<'classRecords'>;
export type SubjectTaughtTypes = Doc<'subjectTaught'>;

interface ClassRecordWithStudentInfo extends Doc<'classRecords'> {
  student: Doc<'students'>
}
interface subjectThoughtWithTeacherInfo extends Doc<'subjectTaught'> {
  teacher: Doc<'users'> | null
}

interface SubjectWithDetailsTypes {
  subject: Doc<'subjectTaught'> | null;

}

export interface EnrollmentWithSection extends Doc<'enrollment'> {
  section: Doc<'sections'> | null;
  subjectsWithDetails: SubjectWithDetailsTypes[];
  sectionSubjects: SubjectWithDetailsTypes[];
}

export interface StudentWithEnrollment extends Doc<'students'> {
  enrollment: EnrollmentWithSection[],
  currentSection: EnrollmentWithSection | undefined
}

export interface ClassRecordsWithTeachingLoad extends Doc<'classRecords'> {
  teachingLoad: Doc<'teachingLoad'> | null
}
export interface StudentWithGrades extends Doc<'students'> {
  grades: ClassRecordsWithTeachingLoad[]
}
export interface StudentWithSectionStudent extends Doc<'students'> {
  sectionStudentId: Id<'sectionStudents'>
  sectionDoc: Doc<'sections'>
  adviser: Doc<'users'>
  classRecords: Doc<'classRecords'>[]
}


export interface TeachingLoadType extends Doc<'teachingLoad'> {
  section: Doc<'sections'>
  subjectTaught: subjectThoughtWithTeacherInfo;
  classRecords: ClassRecordWithStudentInfo[];
  highestScores: Doc<'highestScores'>[]

}

export type OtherComponent = {
  component: "Written Works" | "Performance Tasks" | "Major Exam";
  percentage: number;
};

export type GradeWeightType = "Face to face" | "Modular" | "Other";
export type GradeWeights = {
  type: GradeWeightType;
  faceToFace?: { ww: number; pt: number; majorExam: number; };
  modular?: { ww: number; pt: number; };
  other?: OtherComponent[];
};

export type MapehComponentType = 'Music' | 'Arts' | 'Physical Education' | 'Health';

export interface SubjectTaughtQueryResult {
  id: string;
  subjectName: string;
  gradeLevel: GradeLevelsTypes;
  sectionId: Id<"sections">;
  quarter: string[];
  semester: string[];
  gradeWeights: GradeWeights;
  category?: 'core' | 'specialized' | 'applied';
  isMapeh?: boolean;
  mapehComponent?: MapehComponentType;
}

export interface StudentScoresType extends Doc<'students'> {
  written: Doc<'writtenWorks'>[];
  enrollment: Doc<'enrollment'> | null;
  performance: Doc<'performanceTasks'>[];
  exam: Doc<'majorExams'>[];
  classRecord: Doc<'classRecords'>;
  isSubmitted: boolean | undefined
}

export interface StudentNeedsIntervention extends Doc<'students'> {
  classRecord: Doc<'classRecords'> | null
}

interface StudentGradesTypes{
  subjects: StudentWithSectionStudent[] | undefined,
  section:  Doc<'sections'> ,
  adviser:  Doc<'users'> ,
  enrollment:  Doc<'enrollment'> | null,
}
export interface StudentSF10Types extends Doc<'students'> {
  currentSection: Doc<'sections'> | null;
  studentGrades: StudentGradesTypes[];
}



export type Quarter = "1st" | "2nd" | "3rd" | "4th";
export type QuarterGrades = Record<Quarter, number | undefined>;
export type QuarterAverages = Record<Quarter, number>;
export type ValidCounts = Record<Quarter, number>;

export type SubjectCategory = 'core' | 'specialized' | 'applied';

export interface BaseSubject {
  _id: string;
  subjectName: string;
  grades: QuarterGrades;
}

export interface MapehComponent extends BaseSubject {
  interventions?: {
    [key in Quarter]?: {
      grade: number;
      remarks: string;
      used: string[];
    };
  };
  isMapehComponent?: boolean;
}

export interface MapehMainSubject extends BaseSubject {
  isMapehMain: boolean;
}

export interface ShsSubject extends BaseSubject {
  category: SubjectCategory;
  semester: SemesterType[];
  interventions?: {
    [key in Quarter]?: {
      grade: number;
      remarks: string;
      used: string[];
    };
  };
}

export type SubjectType = MapehComponent | MapehMainSubject | ShsSubject;

export interface StudentEnrollmentSection extends Doc<'sections'> {
    sectionSubjects: Id<"subjectTaught">[] | undefined
    adviser: Doc<"users"> | null
    sectionStudentId: Id<'sectionStudents'>
}

export type OrganizedGrade = {
    gradeLevel: string;
    data: StudentEnrollmentSection | undefined;
};