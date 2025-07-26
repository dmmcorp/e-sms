"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { UserDataTable } from "./_components/user-data-table";
import { usercolumns } from "./_components/usercolumns";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

const DataPage = () => {
  const users = useQuery(api.users.getAllUsers);
  const { results, status, loadMore } = usePaginatedQuery(
    api.logs.getUserLogs,
    {},
    { initialNumItems: 5 }
  );

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
    <div className="container grid grid-cols-12 gap-10 mx-auto py-10">
      <div className="col-span-12 lg:col-span-8">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        <UserDataTable columns={usercolumns} data={users} roles={roles} />
      </div>
    </div>
  );
};

export default DataPage;
