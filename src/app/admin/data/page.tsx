"use client";

import { useQuery } from "convex/react";
import { UserDataTable } from "./_components/user-data-table";
import { usercolumns } from "./_components/usercolumns";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

const DataPage = () => {
  const users = useQuery(api.users.getAllUsers);

  if (!users) {
    return (
      <Skeleton>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse bg-gray-200 rounded-full h-12 w-12"></div>
        </div>
      </Skeleton>
    );
  }

  const roles = Array.from(new Set(users.map((user) => user.role)));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <UserDataTable columns={usercolumns} data={users} roles={roles} />
    </div>
  );
};

export default DataPage;
