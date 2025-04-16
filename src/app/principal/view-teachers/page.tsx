"use client";
import { useQuery } from "convex/react";
import { JuniorDepartmentAdviserList } from "./_components/junior-department-adviser-list";
import { SeniorDepartmentList } from "./_components/senior-department-list";
import { api } from "../../../../convex/_generated/api";

const ViewTeachersPage = () => {
  const principal = useQuery(api.principal.getPrincipal);

  return (
    <div className="container mx-auto py-10 space-y-8">
      {principal ? (
        <>
          {(principal.principalType === "junior-department" ||
            principal.principalType === "entire-school") && (
            <>
              <h1 className="text-3xl font-bold">Junior High Department</h1>
              <JuniorDepartmentAdviserList />
            </>
          )}

          {(principal.principalType === "senior-department" ||
            principal.principalType === "entire-school") && (
            <>
              <h1 className="text-3xl font-bold">Senior High Department</h1>
              <SeniorDepartmentList />
            </>
          )}
        </>
      ) : (
        <div>Error no principal account found.</div>
      )}
    </div>
  );
};

export default ViewTeachersPage;
