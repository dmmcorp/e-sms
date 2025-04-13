"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { RoleType } from "@/lib/types";
import { formatRole } from "@/lib/utils";

// Define the User type
export type User = {
  id: Id<"users">;
  email: string;
  role: RoleType;
  fullName: string;
};

export const usercolumns: ColumnDef<User>[] = [
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
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center justify-end gap-2 mr-7">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("Edit user", user.id)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => console.log("Delete user", user.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      );
    },
  },
];
