"use client";
import { useMemo, useState } from "react";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import { StudentStatusdDialog } from "./student-status-dialog";

type StudentWithStatus = Doc<"students"> & {
  currentStatus: string;
  enrollmentId?: Id<"enrollment">;
};

const gradeLevelOrder = [
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

export function StudentsList() {
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>(
    undefined
  );
  const [selectedSectionId, setSelectedSectionId] = useState<
    Id<"sections"> | undefined
  >(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithStatus | null>(null);

  const groupedSectionsData = useQuery(api.principal.getSectionsGroupedByGrade);

  const students = useQuery(
    api.principal.getStudentsBySection,
    selectedSectionId ? { sectionId: selectedSectionId } : "skip"
  );

  const sectionsForSelectedGrade = useMemo(() => {
    if (!selectedGrade || !groupedSectionsData) {
      return [];
    }
    return groupedSectionsData[selectedGrade] || [];
  }, [selectedGrade, groupedSectionsData]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSectionId(undefined); // Reset section when grade changes
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId as Id<"sections">);
  };

  const handleViewStatusClick = (student: StudentWithStatus) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const sortedGradeLevels = useMemo(() => {
    if (!groupedSectionsData) return [];
    return Object.keys(groupedSectionsData).sort(
      (a, b) => gradeLevelOrder.indexOf(a) - gradeLevelOrder.indexOf(b)
    );
  }, [groupedSectionsData]);

  return (
    <div className="space-y-6">
      {/* Filter Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select onValueChange={handleGradeChange} value={selectedGrade}>
            <SelectTrigger>
              <SelectValue placeholder="Select Grade Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Grade Level</SelectLabel>
                {groupedSectionsData === undefined && (
                  <SelectItem value="loading" disabled>
                    Loading grades...
                  </SelectItem>
                )}
                {sortedGradeLevels.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            onValueChange={handleSectionChange}
            value={selectedSectionId}
            disabled={!selectedGrade || sectionsForSelectedGrade.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Section</SelectLabel>
                {!selectedGrade && (
                  <SelectItem value="no-grade" disabled>
                    Select a grade first
                  </SelectItem>
                )}
                {selectedGrade && sectionsForSelectedGrade.length === 0 && (
                  <SelectItem value="no-sections" disabled>
                    No sections found
                  </SelectItem>
                )}
                {sectionsForSelectedGrade.map((section) => (
                  <SelectItem key={section._id} value={section._id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LRN</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!selectedSectionId && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground h-24"
                >
                  Please select a grade level and section.
                </TableCell>
              </TableRow>
            )}
            {selectedSectionId && students === undefined && (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  <Loader />
                </TableCell>
              </TableRow>
            )}
            {selectedSectionId && students && students.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground h-24"
                >
                  No students found in this section.
                </TableCell>
              </TableRow>
            )}
            {selectedSectionId &&
              students &&
              students.length > 0 &&
              students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.lrn}</TableCell>
                  <TableCell>{`${student.lastName}, ${student.firstName} ${student.middleName}`}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewStatusClick(student)}
                      disabled={!student.enrollmentId} // Disable if no enrollment found
                      title={
                        !student.enrollmentId
                          ? "No enrollment data found"
                          : "View Status Details"
                      }
                    >
                      View Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Status Dialog */}
      <StudentStatusdDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        studentId={selectedStudent?._id ?? null}
        enrollmentId={selectedStudent?.enrollmentId ?? null}
        studentName={
          selectedStudent
            ? `${selectedStudent.lastName}, ${selectedStudent.firstName}`
            : null
        }
      />
    </div>
  );
}
