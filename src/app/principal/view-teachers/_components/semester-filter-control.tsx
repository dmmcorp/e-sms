import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Filter } from "lucide-react";

export function SemesterFilterControl({
  semesterFilter,
  setSemesterFilter,
}: {
  semesterFilter: string;
  setSemesterFilter: (value: string) => void;
}) {
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Filter by Semester</h3>
      </div>
      <RadioGroup
        value={semesterFilter}
        onValueChange={setSemesterFilter}
        className="flex flex-wrap gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all">All Semesters</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1st semester" id="first" />
          <Label htmlFor="first">1st Semester</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="2nd semester" id="second" />
          <Label htmlFor="second">2nd Semester</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
