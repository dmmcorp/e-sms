"use client";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnrollmentWithSection } from "@/lib/types";
import React, { useState } from "react";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSection: EnrollmentWithSection | undefined;
  enrollmentId: Id<"enrollment"> | undefined;
  studentId: Id<"students">;
}
function SubjectDialog({
  open,
  onOpenChange,
  currentSection,
  enrollmentId,
  studentId,
}: SubjectDialogProps) {
  const createLogs = useMutation(api.logs.createUserLogs);
  const currentSubjects =
    currentSection?.subjectsWithDetails
      .map((subject) => subject.subject?._id)
      .filter((s) => s !== undefined) || ([] as Id<"subjectTaught">[]);
  const [subjects, setSubjects] =
    useState<Id<"subjectTaught">[]>(currentSubjects);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editSubjects = useMutation(api.enrollment.editSubjects);

  const handleSubmit = () => {
    setIsLoading(true);
    toast.promise(
      editSubjects({
        enrollmentId: enrollmentId,
        subjects: subjects,
        studentId: studentId,
      }),
      {
        loading: "Updating subjects for the student...",
        success: async () => {
          setIsLoading(false);
          await createLogs({
            action: "update",
            details: `Updated subjects for ${studentId}`,
          });
          return "Subjects have been successfully updated!";
        },
        error: async (error) => {
          setIsLoading(false);
          await createLogs({
            action: "update",
            details: `Failed to update subjects for ${studentId}`,
          });
          const errorMes = error.message
            ? error.message
            : "An unexpected error occurred while updating subjects. Please try again later.";
          return errorMes;
        },
      }
    );
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subjects</DialogTitle>
        </DialogHeader>
        <div className="space-x-2 space-y-2">
          <Label className="">
            Selected subjects: <span>{subjects.length}</span>
          </Label>
          {currentSection?.sectionSubjects.map((subject, index) => (
            <Badge
              key={`${subject.subject?._id}-${index}`}
              className={cn(
                subject.subject?._id && subjects.includes(subject.subject._id)
                  ? ""
                  : "text-black bg-muted shadow-md ",
                "hover:cursor-pointer transition-colors duration-300 ease-in-out p-0"
              )}
            >
              <label className="hover:cursor-pointer size-full px-2 py-1 rounded-md">
                <Checkbox
                  checked={
                    subject.subject?._id &&
                    subjects.includes(subject.subject._id)
                      ? true
                      : false
                  }
                  onCheckedChange={(checked) => {
                    if (checked && subject.subject?._id) {
                      setSubjects([...subjects, subject.subject._id]);
                    } else {
                      const remove = subjects.filter(
                        (s) => s !== subject.subject?._id
                      );
                      setSubjects(remove);
                    }
                  }}
                  className="hidden"
                  disabled={
                    subject.subject?.semester &&
                    subject.subject.semester.length > 0
                  }
                />
                <span className="capitalize text-sm">
                  {subject.subject?.subjectName}
                </span>
              </label>
            </Badge>
          ))}
        </div>
        <DialogFooter className="flex items-center justify-end">
          <div className="flex items-center justify-evenly gap-5 ml-auto">
            <Button
              onClick={() => onOpenChange(false)}
              variant={"secondary"}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={"default"}
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SubjectDialog;
