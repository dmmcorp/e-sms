"use client";

import { Button } from "@/components/ui/button";
import { RoleType } from "@/lib/types";
import { formatRole } from "@/lib/utils";
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
      const router = useRouter();
      const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure you want to delete this user?",
        "This action cannot be undone."
      );
      const user = row.original;
      const { mutate: deleteUserMutation, isPending } = useMutation({
        mutationFn: useConvexMutation(api.users.deleteUser),
        onSuccess: () => {
          toast.success("User deleted successfully.");
        },
        onError: (error) => {
          if (error instanceof ConvexError) {
            toast.error(error.data);
          } else {
            toast.error("Failed to delete user.");
          }
        },
      });

      const onDelete = async () => {
        const confirmed = await confirm();

        if (confirmed) {
          await deleteUserMutation({ userId: user.id });
          // try {
          //   toast.success("User deleted successfully.");
          // } catch (error) {
          //   toast.error("Failed to delete user.");
          // }
        }
      };

      return (
        <>
          <ConfirmDialog />
          <div className="flex items-center justify-end gap-2 mr-7">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push(`/admin/user/edit/${user.id}`);
              }}
              disabled={isPending}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </>
      );
    },
  },
];
