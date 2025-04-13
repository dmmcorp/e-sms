"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  gradeComponentTypes,
  gradeLevels,
  quarters,
  semesters,
} from "@/lib/constants";
import { useQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserFormData } from "@/lib/zod";
import { api } from "../../../../../convex/_generated/api";
import { Doc } from "../../../../../convex/_generated/dataModel";

// Define a subject interface to manage multiple subjects
// interface Subject {
//   id: string;
//   subjectName: string;
//   gradeLevel: string | undefined;
//   sectionId: string | undefined;
//   quarter: string[] | undefined;
//   semester: string[] | undefined;
//   gradeWeights: {
//     type: "Face to face" | "Modular" | "Other";
//     faceToFace?: {
//       ww: number;
//       pt: number;
//       majorExam: number;
//     };
//     modular?: {
//       ww: number;
//       pt: number;
//     };
//     other?: {
//       component: "Written Works" | "Performance Tasks" | "Major Exam";
//       percentage: number;
//     }[];
//   };
//   newComponentType?: string;
//   newComponentPercentage?: string;
// }

interface SubjectTaughtFormProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  errors: Record<string, string>;
  isPending: boolean;
}

type SubjectData = NonNullable<UserFormData["subjectsTaught"]>[number];

// == Internal Component for Subject Card ==
interface SubjectCardContentProps {
  subject: SubjectData;
  index: number;
  sections: Doc<"sections">[] | undefined; // Pass sections data
  formData: UserFormData; // Pass full formData for pending sections logic
  errors: Record<string, string>;
  isPending: boolean;
  updateSubject: (index: number, field: keyof SubjectData, value: any) => void;
  updateGradeWeights: (
    index: number,
    gradeWeights: SubjectData["gradeWeights"]
  ) => void;
  handleOGCButton: (index: number, type: string, percentage: string) => void; // Adjusted handler signature
}

const SubjectCardContent: React.FC<SubjectCardContentProps> = ({
  subject,
  index,
  sections,
  formData,
  errors,
  isPending,
  updateSubject,
  updateGradeWeights,
  handleOGCButton, // Receive the handler
}) => {
  const [localNewComponentType, setLocalNewComponentType] = useState<string>(
    gradeComponentTypes[0]
  );
  const [localNewComponentPercentage, setLocalNewComponentPercentage] =
    useState<string>("");

  const handleAddWeightClick = () => {
    // Call the handler passed from parent with local state values
    handleOGCButton(index, localNewComponentType, localNewComponentPercentage);
    // Reset local state after adding
    setLocalNewComponentType(gradeComponentTypes[0]);
    setLocalNewComponentPercentage("");
  };

  return (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subject Name Input */}
        <div className="space-y-2">
          <Label htmlFor={`subjectName-${index}`}>Subject Name</Label>
          <Input
            id={`subjectName-${index}`}
            value={subject.subjectName}
            onChange={(e) =>
              updateSubject(index, "subjectName", e.target.value)
            }
            placeholder="Enter subject name"
            disabled={isPending}
          />
          {errors[`subject${index}Name`] && (
            <p className="text-xs text-red-600">
              {errors[`subject${index}Name`]}
            </p>
          )}
        </div>

        {/* Grade Level Select */}
        <div className="space-y-2">
          <Label htmlFor={`gradeLevel-${index}`}>Grade Level</Label>
          <Select
            value={subject.gradeLevel || ""}
            onValueChange={(value) => updateSubject(index, "gradeLevel", value)}
            disabled={isPending}
          >
            <SelectTrigger id={`gradeLevel-${index}`} className="w-full">
              <SelectValue placeholder="Select grade level" />
            </SelectTrigger>
            <SelectContent>
              {gradeLevels.map((level) => (
                <SelectItem key={`${level}-${index}`} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[`subject${index}GradeLevel`] && (
            <p className="text-xs text-red-600">
              {errors[`subject${index}GradeLevel`]}
            </p>
          )}
        </div>

        {/* Section Select */}
        <div className="space-y-2">
          <Label htmlFor={`section-${index}`}>Section</Label>
          <Select
            value={subject.sectionId || ""}
            onValueChange={(value) => updateSubject(index, "sectionId", value)}
            disabled={isPending || !subject.gradeLevel}
          >
            <SelectTrigger id={`section-${index}`} className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {/* Existing Sections */}
              {sections
                ?.filter((section) => section.gradeLevel === subject.gradeLevel)
                .map((section) => (
                  <SelectItem key={section._id} value={section._id}>
                    {section.name}
                  </SelectItem>
                ))}
              {/* Pending Sections */}
              {formData.role === "adviser/subject-teacher" &&
                formData.sections
                  ?.filter(
                    (section) =>
                      section.name && section.gradeLevel === subject.gradeLevel
                  )
                  .map((section) => {
                    const actualIndex = formData.sections?.findIndex(
                      (s) =>
                        s.name === section.name &&
                        s.gradeLevel === section.gradeLevel
                    );
                    // Ensure actualIndex is found before rendering
                    if (actualIndex === undefined || actualIndex < 0)
                      return null;
                    return (
                      <SelectItem
                        key={`pending-${actualIndex}`}
                        value={`pending-section-${actualIndex}`}
                        className="bg-blue-50"
                      >
                        {section.name} (Pending)
                      </SelectItem>
                    );
                  })}
            </SelectContent>
          </Select>
          {errors[`subject${index}Section`] && (
            <p className="text-xs text-red-600">
              {errors[`subject${index}Section`]}
            </p>
          )}
        </div>
      </div>

      <h1 className="font-bold underline underline-offset-4 text-center mt-4">
        Quarter & Semester
      </h1>

      <div className="flex flex-col lg:flex-row gap-5 w-full">
        <Card className="p-4 w-full">
          <div className="flex justify-between items-center mb-2">
            <Label className="font-semibold">Quarters</Label>
            {errors.quarter && (
              <p className="text-xs text-red-600">{errors.quarter}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const allQuarters = [...quarters];
                updateSubject(
                  index,
                  "quarter",
                  subject.quarter?.length === quarters.length ? [] : allQuarters
                );
              }}
              className="col-span-2 sm:col-span-4 mb-1"
              disabled={subject.semester && subject.semester.length > 0}
            >
              {subject.quarter?.length === quarters.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-2"> */}

          <div className="grid grid-cols-2 lg:grid-cols-1 w-full gap-2">
            {quarters.map((q) => (
              <label
                key={`${q}-${index}`}
                className={`flex items-center gap-2 ${
                  subject.semester && subject.semester.length > 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                <Checkbox
                  checked={subject.quarter?.includes(q) || false}
                  onCheckedChange={(checked) => {
                    if (subject.semester && subject.semester.length > 0) return;

                    const currentQuarters = subject.quarter || [];
                    const updatedQuarters = checked
                      ? [...currentQuarters, q]
                      : currentQuarters.filter((item) => item !== q);

                    updateSubject(index, "quarter", updatedQuarters);
                  }}
                  disabled={subject.semester && subject.semester.length > 0}
                />
                <span>{q}</span>
              </label>
            ))}
          </div>
          {/* </div> */}
        </Card>

        <Card className="p-4 w-full">
          <div className="flex justify-between items-center mb-2">
            <Label className="font-semibold">Semesters</Label>
            {errors.semester && (
              <p className="text-xs text-red-600">{errors.semester}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const allSemesters = [...semesters];
                updateSubject(
                  index,
                  "semester",
                  subject.semester?.length === semesters.length
                    ? []
                    : allSemesters
                );
              }}
              className="col-span-2 mb-1"
              disabled={subject.quarter && subject.quarter.length > 0}
            >
              {subject.semester?.length === semesters.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            {semesters.map((s) => (
              <label
                key={`${s}-${index}`}
                className={`flex items-center gap-2 ${
                  subject.quarter && subject.quarter.length > 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50"
                }`}
              >
                <Checkbox
                  checked={subject.semester?.includes(s) || false}
                  onCheckedChange={(checked) => {
                    if (subject.quarter && subject.quarter.length > 0) return;

                    const currentSemesters = subject.semester || [];
                    const updatedSemesters = checked
                      ? [...currentSemesters, s]
                      : currentSemesters.filter((item) => item !== s);

                    updateSubject(index, "semester", updatedSemesters);
                  }}
                  disabled={subject.quarter && subject.quarter.length > 0}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      {/* Grade Weights Section */}
      <div className="space-y-3">
        <h3 className="font-medium">Grade Weights</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Face to Face Option */}
          <Card
            className={`p-4 ${subject.gradeWeights.type !== "Face to face" ? "opacity-60" : ""}`}
          >
            <div className="flex items-center mb-3">
              <input
                type="radio"
                id={`faceToFace-${index}`}
                name={`gradingType-${index}`}
                checked={subject.gradeWeights.type === "Face to face"}
                onChange={() => {
                  updateGradeWeights(index, {
                    type: "Face to face",
                    faceToFace: { ww: 0, pt: 0, majorExam: 0 },
                  });
                }}
                className="mr-2"
              />
              <Label htmlFor={`faceToFace-${index}`} className="font-semibold">
                Face to Face
              </Label>
            </div>

            <div
              className={
                subject.gradeWeights.type !== "Face to face"
                  ? "pointer-events-none"
                  : ""
              }
            >
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`written-${index}`}>Written Works (%)</Label>
                  <Input
                    id={`written-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={subject.gradeWeights.faceToFace?.ww || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      updateGradeWeights(index, {
                        type: "Face to face",
                        faceToFace: {
                          ...(subject.gradeWeights.faceToFace ?? {}),
                          ww: value,
                          pt: subject.gradeWeights.faceToFace?.pt ?? 0,
                          majorExam:
                            subject.gradeWeights.faceToFace?.majorExam ?? 0,
                        },
                        modular: undefined,
                        other: undefined,
                      });
                    }}
                    disabled={subject.gradeWeights.type !== "Face to face"}
                  />
                </div>

                <div>
                  <Label htmlFor={`performance-${index}`}>
                    Performance Tasks (%)
                  </Label>
                  <Input
                    id={`performance-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={subject.gradeWeights.faceToFace?.pt || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      updateGradeWeights(index, {
                        type: "Face to face",
                        faceToFace: {
                          ...(subject.gradeWeights.faceToFace ?? {}),
                          pt: value,
                          ww: subject.gradeWeights.faceToFace?.ww ?? 0,
                          majorExam:
                            subject.gradeWeights.faceToFace?.majorExam ?? 0,
                        },
                        modular: undefined,
                        other: undefined,
                      });
                    }}
                    disabled={subject.gradeWeights.type !== "Face to face"}
                  />
                </div>

                <div>
                  <Label htmlFor={`majorExam-${index}`}>Major Exam (%)</Label>
                  <Input
                    id={`majorExam-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={subject.gradeWeights.faceToFace?.majorExam || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      updateGradeWeights(index, {
                        type: "Face to face",
                        faceToFace: {
                          ...(subject.gradeWeights.faceToFace ?? {}),
                          majorExam: value,
                          ww: subject.gradeWeights.faceToFace?.ww ?? 0,
                          pt: subject.gradeWeights.faceToFace?.pt ?? 0,
                        },
                        modular: undefined,
                        other: undefined,
                      });
                    }}
                    disabled={subject.gradeWeights.type !== "Face to face"}
                  />
                </div>

                {subject.gradeWeights.faceToFace && (
                  <div className="mt-2 text-sm">
                    Total:{" "}
                    {(subject.gradeWeights.faceToFace.ww || 0) +
                      (subject.gradeWeights.faceToFace.pt || 0) +
                      (subject.gradeWeights.faceToFace.majorExam || 0)}
                    %
                    {(subject.gradeWeights.faceToFace.ww || 0) +
                      (subject.gradeWeights.faceToFace.pt || 0) +
                      (subject.gradeWeights.faceToFace.majorExam || 0) !==
                      100 && (
                      <span className="text-red-500 ml-2">
                        (Must equal 100%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Modular Option */}
          <Card
            className={`p-4 ${subject.gradeWeights.type !== "Modular" ? "opacity-60" : ""}`}
          >
            <div className="flex items-center mb-3">
              <input
                type="radio"
                id={`modular-${index}`}
                name={`gradingType-${index}`}
                checked={subject.gradeWeights.type === "Modular"}
                onChange={() => {
                  updateGradeWeights(index, {
                    type: "Modular",
                    modular: { ww: 0, pt: 0 },
                  });
                }}
                className="mr-2"
              />
              <Label htmlFor={`modular-${index}`} className="font-semibold">
                Modular
              </Label>
            </div>

            <div
              className={
                subject.gradeWeights.type !== "Modular"
                  ? "pointer-events-none"
                  : ""
              }
            >
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`modularWritten-${index}`}>
                    Written Works (%)
                  </Label>
                  <Input
                    id={`modularWritten-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={subject.gradeWeights.modular?.ww || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      updateGradeWeights(index, {
                        type: "Modular",
                        modular: {
                          ...(subject.gradeWeights.modular ?? {}),
                          ww: value,
                          pt: subject.gradeWeights.modular?.pt ?? 0,
                        },
                        faceToFace: undefined,
                        other: undefined,
                      });
                    }}
                    disabled={subject.gradeWeights.type !== "Modular"}
                  />
                </div>

                <div>
                  <Label htmlFor={`modularPerformance-${index}`}>
                    Performance Tasks (%)
                  </Label>
                  <Input
                    id={`modularPerformance-${index}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={subject.gradeWeights.modular?.pt || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      updateGradeWeights(index, {
                        type: "Modular",
                        modular: {
                          ...(subject.gradeWeights.modular ?? {}),
                          pt: value,
                          ww: subject.gradeWeights.modular?.ww ?? 0, // Ensure ww exists
                        },
                        faceToFace: undefined,
                        other: undefined,
                      });
                    }}
                    disabled={subject.gradeWeights.type !== "Modular"}
                  />
                </div>

                {subject.gradeWeights.modular && (
                  <div className="mt-2 text-sm">
                    Total:{" "}
                    {(subject.gradeWeights.modular.ww || 0) +
                      (subject.gradeWeights.modular.pt || 0)}
                    %
                    {(subject.gradeWeights.modular.ww || 0) +
                      (subject.gradeWeights.modular.pt || 0) !==
                      100 && (
                      <span className="text-red-500 ml-2">
                        (Must equal 100%)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Other/Custom Option */}
          <Card
            className={`p-4 ${subject.gradeWeights.type !== "Other" ? "opacity-60" : ""}`}
          >
            <div className="flex items-center mb-3">
              <input
                type="radio"
                id={`other-${index}`}
                name={`gradingType-${index}`}
                checked={subject.gradeWeights.type === "Other"}
                onChange={() => {
                  updateGradeWeights(index, {
                    type: "Other",
                    other: [],
                  });
                }}
                className="mr-2"
              />
              <Label htmlFor={`other-${index}`} className="font-semibold">
                Other Grade Computation
              </Label>
            </div>

            <div
              className={
                subject.gradeWeights.type !== "Other"
                  ? "pointer-events-none"
                  : ""
              }
            >
              <div className="space-y-3">
                {/* List of added components */}
                {subject.gradeWeights.other &&
                  subject.gradeWeights.other.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {subject.gradeWeights.other.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span>
                            {item.component}: {item.percentage}%
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedOther =
                                subject.gradeWeights.other?.filter(
                                  (_, i) => i !== idx
                                ) || [];
                              updateGradeWeights(index, {
                                ...subject.gradeWeights,
                                other: updatedOther,
                              });
                            }}
                            disabled={subject.gradeWeights.type !== "Other"}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}

                      <div className="text-sm mt-2">
                        Total:{" "}
                        {subject.gradeWeights.other.reduce(
                          (sum, item) => sum + item.percentage,
                          0
                        )}
                        %
                        {subject.gradeWeights.other.reduce(
                          (sum, item) => sum + item.percentage,
                          0
                        ) !== 100 && (
                          <span className="text-red-500 ml-2">
                            (Must equal 100%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {/* Add new component form */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="w-full">
                      <Select
                        value={localNewComponentType}
                        onValueChange={setLocalNewComponentType} // Update local state
                        disabled={subject.gradeWeights.type !== "Other"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select component" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeComponentTypes.map((type) => (
                            <SelectItem key={`${type}-${index}`} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="%"
                        value={localNewComponentPercentage}
                        onChange={(e) =>
                          setLocalNewComponentPercentage(e.target.value)
                        } // Update local state
                        disabled={subject.gradeWeights.type !== "Other"}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddWeightClick} // Use the wrapper function
                    disabled={
                      subject.gradeWeights.type !== "Other" ||
                      !localNewComponentPercentage ||
                      Number(localNewComponentPercentage) <= 0
                    }
                    className="w-full"
                    type="button"
                  >
                    Add Weight
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </CardContent>
  );
};

export const SubjectTaughtForm = ({
  errors,
  formData,
  setFormData,
  isPending,
}: SubjectTaughtFormProps) => {
  const sections = useQuery(api.sections.get, {});

  // Add a new empty subject directly to formData
  const addNewSubject = () => {
    const newSubject: SubjectData = {
      subjectName: "",
      sectionId: "",
      gradeLevel: gradeLevels[0],
      quarter: [],
      semester: [],
      gradeWeights: {
        type: "Face to face" as const,
        faceToFace: { ww: 0, pt: 0, majorExam: 0 },
        modular: undefined,
        other: undefined,
      },
    };

    setFormData((prev) => ({
      ...prev,
      subjectsTaught: [...(prev.subjectsTaught || []), newSubject],
    }));
  };

  // Remove a subject by ID
  const removeSubject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subjectsTaught: (prev.subjectsTaught || []).filter((_, i) => i !== index),
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSubject = (
    index: number,
    field: keyof SubjectData,
    value: any
  ) => {
    setFormData((prev) => {
      const updatedSubjects = [...(prev.subjectsTaught || [])];
      if (updatedSubjects[index]) {
        updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
      }
      return { ...prev, subjectsTaught: updatedSubjects };
    });
  };

  // Update grade weights for a specific subject
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateGradeWeights = (
    index: number,
    gradeWeights: SubjectData["gradeWeights"]
  ) => {
    setFormData((prev) => {
      const updatedSubjects = [...(prev.subjectsTaught || [])];
      if (updatedSubjects[index]) {
        // Ensure deep copy for safety, especially if 'other' exists
        const newGradeWeights = JSON.parse(JSON.stringify(gradeWeights));
        updatedSubjects[index] = {
          ...updatedSubjects[index],
          gradeWeights: newGradeWeights,
        };
      }
      return { ...prev, subjectsTaught: updatedSubjects };
    });
  };

  const handleOGCButton = (index: number, type: string, percentage: string) => {
    // Basic validation (already done in button disable, but good practice)
    if (!percentage || Number(percentage) <= 0 || !type) {
      return;
    }

    setFormData((prev) => {
      const subjects = [...(prev.subjectsTaught || [])];
      const currentSubject = subjects[index];

      // Ensure the subject exists and is of type 'Other'
      if (!currentSubject || currentSubject.gradeWeights.type !== "Other") {
        console.warn("Attempted to add 'Other' component to non-Other subject");
        return prev;
      }

      const newComponent = {
        component: type as "Written Works" | "Performance Tasks" | "Major Exam",
        percentage: Number(percentage),
      };

      // Ensure 'other' array exists before spreading
      const existingOther = Array.isArray(currentSubject.gradeWeights.other)
        ? [...currentSubject.gradeWeights.other]
        : [];

      const newComponentsArray = [...existingOther, newComponent];

      // Update the specific subject in the array
      subjects[index] = {
        ...currentSubject,
        gradeWeights: {
          ...currentSubject.gradeWeights,
          other: newComponentsArray,
        },
      };

      // Return the updated state
      return { ...prev, subjectsTaught: subjects };
    });
  };

  console.log(formData);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full">
      <h1 className="font-bold underline underline-offset-4 text-xl">
        Subjects Taught
      </h1>

      {/* List of subjects - Render SubjectCardContent */}
      {formData.subjectsTaught && formData.subjectsTaught.length > 0 ? (
        formData.subjectsTaught.map((subject, index) => (
          <Card key={index} className="w-full">
            {" "}
            {/* Key remains here */}
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Subject {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubject(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </CardHeader>
            {/* Render the internal component */}
            <SubjectCardContent
              subject={subject}
              index={index}
              sections={sections}
              formData={formData}
              errors={errors}
              isPending={isPending}
              updateSubject={updateSubject}
              updateGradeWeights={updateGradeWeights}
              handleOGCButton={handleOGCButton} // Pass the handler down
            />
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No subjects added yet.</p>
      )}

      {/* Add Subject Button */}
      <Button
        onClick={addNewSubject}
        variant="outline"
        className="flex items-center gap-2"
        type="button"
        disabled={isPending}
      >
        <Plus className="h-4 w-4" />
        Add Another Subject
      </Button>
    </div>
  );
};
