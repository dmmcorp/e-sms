"use client";

import { Button } from "@/components/ui/button";
import { RoleType } from "@/lib/types";
import { formatDate, formatRole } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useConfirm } from "@/hooks/use-confirm";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

// Define the User type kahit di na siguro Doc, but if needed just use Doc
export type ActivityLogsType = {
  _id: Id<"logs">;
  _creationTime: number;
  details?: string | undefined;
  fullName: string;
  role: string;
  userId: Id<"users">;
  action: string;
};

export const activityLogsColumn: ColumnDef<ActivityLogsType>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      const role = row.original.role as RoleType;
      return <span>{formatRole(role)}</span>;
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      const details = row.original.details ?? "-";
      const action = row.original.action;
      return (
        <p>
          <span className="font-semibold capitalize">{action}:</span>{" "}
          <span className="">{details}</span>
        </p>
      );
    },
  },
  {
    accessorKey: "_creationTime",
    header: "Time Stamp",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => {
      const creationTime = row.original._creationTime;
      const dateAndTime = formatDate(creationTime);
      return <span>{dateAndTime}</span>;
    },
  },
];
