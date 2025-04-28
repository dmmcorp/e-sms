"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader } from "@/components/loader";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";

interface StudentStatusDialogProps {
  studentId: Id<"students"> | null;
  enrollmentId: Id<"enrollment"> | null | undefined;
  studentName: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentStatusdDialog({
  enrollmentId,
  isOpen,
  onOpenChange,
  studentId,
  studentName,
}: StudentStatusDialogProps) {
  const statusDetails = useQuery(
    api.principal.getStudentStatusDetails,
    studentId && enrollmentId ? { studentId, enrollmentId } : "skip"
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Status Details: {studentName ?? "Loading..."}
          </DialogTitle>
          <DialogDescription>
            Quarterly academic status overview.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {statusDetails === undefined && <Loader />}
          {statusDetails === null && studentId && enrollmentId && (
            <p className="text-muted-foreground">
              Could not load status details.
            </p>
          )}
          {statusDetails && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Overall Enrollment Status:</span>
                <Badge
                  variant={
                    statusDetails.overallStatus === "promoted" || statusDetails.overallStatus === "conditionally-promoted"
                      ? "default"
                      : statusDetails.overallStatus === "retained"
                        ? "destructive"
                        : statusDetails.overallStatus === "enrolled"
                          ? "default"
                          : "secondary"
                  }
                >
                  {statusDetails.overallStatus}
                </Badge>
              </div>
              <h4 className="font-medium text-sm text-muted-foreground pt-2 border-t">
                Quarterly Status
              </h4>
              <ul className="space-y-2">
                {statusDetails.quarterlyStatus.map((qStatus) => (
                  <li
                    key={qStatus.quarter}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{qStatus.quarter}:</span>
                    <Badge
                      variant={
                        qStatus.status === "Passed"
                          ? "default"
                          : qStatus.status === "Failed"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {qStatus.status}
                    </Badge>
                  </li>
                ))}
              </ul>
              {/* <p className="text-xs text-muted-foreground italic pt-2">
                Note: Detailed quarterly status calculation needs implementation
                based on grading rules.
              </p> */}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
