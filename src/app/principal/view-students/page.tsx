import React from "react";
import { StudentsList } from "./_components/students-list";

const ViewStudentsPage = () => {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Student List</h1>
      <StudentsList />
    </div>
  );
};

export default ViewStudentsPage;
