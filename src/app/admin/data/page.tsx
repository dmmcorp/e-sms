"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { UserDataTable } from "./_components/user-data-table";
import { UserLogsTable } from "./_components/user-logs-table";
import { usercolumns } from "./_components/usercolumns";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { activityLogsColumn } from "./_components/activity-logs-column";
import DownloadPdf from "./_components/download-pdf";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const DataPage = () => {
  const users = useQuery(api.users.getAllUsers);

  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>("");
  const activityLogs = useQuery(api.logs.getUserLogs);

  const roles = Array.from(new Set(users?.map((user) => user.role)));

  const filteredLogs = activityLogs?.filter((log) => {
    if (!startDate && !endDate) return true;
    const logDate = new Date(log._creationTime).toISOString().slice(0, 10);
    if (startDate && endDate) {
      return logDate >= startDate && logDate <= endDate;
    }
    if (startDate) {
      return logDate >= startDate;
    }
    if (endDate) {
      return logDate <= endDate;
    }
    return true;
  });

  return (
    <div className="container grid grid-cols-12 gap-10 mx-auto py-10">
      {users ? (
        <Card className="col-span-12 lg:col-span-12">
          <CardContent>
            <h1 className="text-2xl font-bold mb-6">Users</h1>
            <UserDataTable columns={usercolumns} data={users} roles={roles} />
          </CardContent>
        </Card>
      ) : (
        <Skeleton>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-pulse bg-gray-200 rounded-full h-12 w-12"></div>
          </div>
        </Skeleton>
      )}

      <Card className="col-span-12 lg:col-span-12">
        <CardContent>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>
            <div className="flex justify-center items-center">
              <div className="flex items-center justify-center space-x-2">
                <Label htmlFor="startDate">From</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full"
                />
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Label htmlFor="endDate">To</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full"
                />
              </div>
            </div>
            {filteredLogs && (
              <DownloadPdf
                logs={filteredLogs}
                startDate={startDate}
                endDate={endDate}
              />
            )}
          </div>
          {filteredLogs && (
            <UserLogsTable
              columns={activityLogsColumn}
              data={filteredLogs}
              roles={roles}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPage;
