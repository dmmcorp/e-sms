import { JuniorDepartmentAdviserList } from "./_components/junior-department-adviser-list";
import { SeniorDepartmentList } from "./_components/senior-department-list";

const ViewTeachersPage = () => {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Junior High Department</h1>
      <JuniorDepartmentAdviserList />

      <h1 className="text-3xl font-bold">Senior High Department</h1>
      <SeniorDepartmentList />
    </div>
  );
};

export default ViewTeachersPage;
