"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/loader";
import { Users, GraduationCap } from "lucide-react";
import { gradeLevels } from "@/lib/constants";

export function DashboardStats() {
  const stats = useQuery(api.dashboard.getDashboardStats);

  if (stats === undefined) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          {" "}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Loader />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Students per Grade Level
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Loader />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stats === null) {
    return (
      <p className="text-destructive">Could not load dashboard statistics.</p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          <p className="text-xs text-muted-foreground">
            Advisers & Subject Teachers
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Enrolled Students per Grade Level
          </CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {gradeLevels.map((grade) => (
              <div
                key={grade}
                className="text-center p-3 rounded-lg bg-muted/50 shadow-sm"
              >
                <div className="text-xl font-bold">
                  {" "}
                  {stats.studentsPerGrade[grade] ?? 0}
                </div>
                <p className="text-sm text-muted-foreground">{grade}</p>{" "}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
