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
import { api } from "../../../../../convex/_generated/api";

// Define a subject interface to manage multiple subjects
interface Subject {
  id: string;
  subjectName: string;
  gradeLevel: string | undefined;
  sectionId: string | undefined;
  quarter: string[] | undefined;
  semester: string[] | undefined;
  gradeWeights: {
    type: "Face to face" | "Modular" | "Other";
    faceToFace?: {
      ww: number;
      pt: number;
      majorExam: number;
    };
    modular?: {
      ww: number;
      pt: number;
    };
    other?: {
      component: "Written Works" | "Performance Tasks" | "Major Exam";
      percentage: number;
    }[];
  };
  newComponentType?: string;
  newComponentPercentage?: string;
}

interface SubjectTaughtFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  isPending: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export const SubjectTaughtForm = ({
  errors,
  formData,
  setFormData,
  isPending,
  handleChange,
}: SubjectTaughtFormProps) => {
  // State for managing multiple subjects
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const sections = useQuery(api.sections.get, {});

  // Initialize with one empty subject if none exists
  useEffect(() => {
    // Only add a subject if there are no subjects yet
    if (subjects.length === 0) {
      const newSubject: Subject = {
        id: generateId(),
        subjectName: "",
        sectionId: "",
        gradeLevel: undefined,
        quarter: [],
        semester: [],
        gradeWeights: {
          type: "Face to face",
          faceToFace: { ww: 0, pt: 0, majorExam: 0 },
        },
        newComponentType: gradeComponentTypes[0], // Initialize this field
      };

      setSubjects([newSubject]);
      updateFormDataWithSubjects([newSubject]);
    }
  }, []);

  // Generate a unique ID for each subject
  const generateId = () =>
    `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a new empty subject
  const addNewSubject = () => {
    const newSubject: Subject = {
      id: generateId(),
      subjectName: "",
      sectionId: "",
      gradeLevel: undefined,
      quarter: [],
      semester: [],
      gradeWeights: {
        type: "Face to face",
        faceToFace: { ww: 0, pt: 0, majorExam: 0 },
      },
      newComponentType: "Written Works", // Use string directly to avoid typo
    };

    setSubjects((prev) => [...prev, newSubject]);
    updateFormDataWithSubjects([...subjects, newSubject]);
  };

  // Remove a subject by ID
  const removeSubject = (id: string) => {
    const updatedSubjects = subjects.filter((subject) => subject.id !== id);
    setSubjects(updatedSubjects);

    // Update the form data with the updated subjects array
    updateFormDataWithSubjects(updatedSubjects);
  };

  // Update the form data with the current subjects
  const updateFormDataWithSubjects = (updatedSubjects: Subject[]) => {
    // Create deep copies of everything to avoid reference issues
    const cleanedSubjects = updatedSubjects.map((subject) => {
      // Create a cleaned copy of the subject without UI-only fields
      const { newComponentType, newComponentPercentage, ...subjectBase } =
        subject;

      // Handle grade weights properly with deep copying
      const gradeWeights = {
        type: subject.gradeWeights.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      // Copy the appropriate fields based on type
      if (
        subject.gradeWeights.type === "Face to face" &&
        subject.gradeWeights.faceToFace
      ) {
        gradeWeights.faceToFace = { ...subject.gradeWeights.faceToFace };
      }

      if (
        subject.gradeWeights.type === "Modular" &&
        subject.gradeWeights.modular
      ) {
        gradeWeights.modular = { ...subject.gradeWeights.modular };
      }

      if (subject.gradeWeights.type === "Other") {
        // Deep copy the other array and its contents
        gradeWeights.other = subject.gradeWeights.other
          ? [...subject.gradeWeights.other.map((item) => ({ ...item }))]
          : [];
      }

      // Return the cleaned, deep-copied subject
      return {
        ...subjectBase,
        gradeWeights,
      };
    });

    console.log(
      "About to update formData with:",
      JSON.stringify(cleanedSubjects)
    );

    // Update the form data with the cleaned subjects array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      subjectsTaught: cleanedSubjects,
    }));
  };

  // Update a specific subject's data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSubject = (id: string, field: string, value: any) => {
    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === id) {
        return { ...subject, [field]: value };
      }
      return subject;
    });

    setSubjects(updatedSubjects);
    updateFormDataWithSubjects(updatedSubjects);
  };

  // Update grade weights for a specific subject
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateGradeWeights = (id: string, gradeWeights: any) => {
    console.log("Updating grade weights:", id, JSON.stringify(gradeWeights));

    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === id) {
        // Create a proper deep copy to avoid reference issues
        const updatedGradeWeights = {
          type: gradeWeights.type,
          // Handle each type of grade weight properly
          faceToFace:
            gradeWeights.type === "Face to face"
              ? { ...gradeWeights.faceToFace }
              : undefined,
          modular:
            gradeWeights.type === "Modular"
              ? { ...gradeWeights.modular }
              : undefined,
          other:
            gradeWeights.type === "Other"
              ? // Make a deep copy of the array and each object inside
                [
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ...(gradeWeights.other || []).map((item: any) => ({
                    ...item,
                  })),
                ]
              : undefined,
        };

        console.log(
          "Updated grade weights:",
          JSON.stringify(updatedGradeWeights)
        );

        return {
          ...subject,
          gradeWeights: updatedGradeWeights,
        };
      }
      return subject;
    });

    // Update both the subjects state and the form data
    setSubjects(updatedSubjects);
    updateFormDataWithSubjects(updatedSubjects);
  };

  const handleOGCButton = (subject: Subject) => {
    // Validate inputs
    if (
      !subject.newComponentPercentage ||
      Number(subject.newComponentPercentage) <= 0 ||
      !subject.newComponentType
    ) {
      return;
    }

    // Find the current subject with latest state
    const currentSubject = subjects.find((s) => s.id === subject.id);
    if (!currentSubject) return;

    // Create new component
    const newComponent = {
      component: subject.newComponentType as
        | "Written Works"
        | "Performance Tasks"
        | "Major Exam",
      percentage: Number(subject.newComponentPercentage),
    };

    // Important: Create a proper COPY of the existing components array
    const existingOther = Array.isArray(currentSubject.gradeWeights.other)
      ? [...currentSubject.gradeWeights.other]
      : [];

    console.log("BEFORE: Existing components:", JSON.stringify(existingOther));

    // Create an entirely new array with the new component
    const newComponentsArray = [...existingOther, newComponent];

    console.log(
      "AFTER: New components array:",
      JSON.stringify(newComponentsArray)
    );

    // Create an entirely new gradeWeights object
    const updatedGradeWeights = {
      type: "Other" as const,
      other: newComponentsArray,
    };

    // Update the subjects array directly instead of through updateGradeWeights
    const updatedSubjects = subjects.map((s) => {
      if (s.id === subject.id) {
        return {
          ...s,
          gradeWeights: updatedGradeWeights,
          newComponentPercentage: "", // Reset input fields
          newComponentType: gradeComponentTypes[0], // Reset select
        };
      }
      return s;
    });

    // Update both state and form data in one go
    setSubjects(updatedSubjects);

    // Directly update form data with the new subjects array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      subjectsTaught: updatedSubjects.map(
        ({ newComponentType, newComponentPercentage, ...rest }) => rest
      ),
    }));

    console.log("Updated subjects:", updatedSubjects);
  };

  console.log(formData);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full">
      <h1 className="font-bold underline underline-offset-4 text-xl">
        Subjects Taught
      </h1>

      {/* List of subjects */}
      {subjects.map((subject, index) => (
        <Card key={subject.id} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Subject {index + 1}</CardTitle>
              {subjects.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubject(subject.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject Name and Grade Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`subjectName-${subject.id}`}>
                  Subject Name
                </Label>
                <Input
                  id={`subjectName-${subject.id}`}
                  value={subject.subjectName}
                  onChange={(e) =>
                    updateSubject(subject.id, "subjectName", e.target.value)
                  }
                  placeholder="Enter subject name"
                  disabled={isPending}
                />
                {errors.subjectName && (
                  <p className="text-xs text-red-600">{errors.subjectName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`gradeLevel-${subject.id}`}>Grade Level</Label>
                <Select
                  value={subject.gradeLevel || ""}
                  onValueChange={(value) =>
                    updateSubject(subject.id, "gradeLevel", value)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger
                    id={`gradeLevel-${subject.id}`}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map((level) => (
                      <SelectItem key={`${level}-${subject.id}`} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gradeLevel && (
                  <p className="text-xs text-red-600">{errors.gradeLevel}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`section-${subject.id}`}>Section</Label>
                <Select
                  value={subject.sectionId || ""}
                  onValueChange={(value) =>
                    updateSubject(subject.id, "sectionId", value)
                  }
                  disabled={isPending || !subject.gradeLevel}
                >
                  <SelectTrigger
                    id={`section-${subject.id}`}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections
                      ?.filter(
                        (section) => section.gradeLevel === subject.gradeLevel
                      )
                      .map((section) => (
                        <SelectItem key={section._id} value={section._id}>
                          {section.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.sectionId && (
                  <p className="text-xs text-red-600">{errors.sectionId}</p>
                )}
              </div>
            </div>

            {/* Quarters and Semesters Section */}
            <h1 className="font-bold underline underline-offset-4 text-center mt-4">
              Quarter & Semester
            </h1>

            <div className="flex flex-col lg:flex-row gap-5 w-full">
              {/* Quarters Section */}
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
                        subject.id,
                        "quarter",
                        subject.quarter?.length === quarters.length
                          ? []
                          : allQuarters
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
                      key={`${q}-${subject.id}`}
                      className={`flex items-center gap-2 ${
                        subject.semester && subject.semester.length > 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={subject.quarter?.includes(q) || false}
                        onCheckedChange={(checked) => {
                          if (subject.semester && subject.semester.length > 0)
                            return;

                          const currentQuarters = subject.quarter || [];
                          const updatedQuarters = checked
                            ? [...currentQuarters, q]
                            : currentQuarters.filter((item) => item !== q);

                          updateSubject(subject.id, "quarter", updatedQuarters);
                        }}
                        disabled={
                          subject.semester && subject.semester.length > 0
                        }
                      />
                      <span>{q}</span>
                    </label>
                  ))}
                </div>
                {/* </div> */}
              </Card>

              {/* Semesters Section */}
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
                        subject.id,
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
                      key={`${s}-${subject.id}`}
                      className={`flex items-center gap-2 ${
                        subject.quarter && subject.quarter.length > 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={subject.semester?.includes(s) || false}
                        onCheckedChange={(checked) => {
                          if (subject.quarter && subject.quarter.length > 0)
                            return;

                          const currentSemesters = subject.semester || [];
                          const updatedSemesters = checked
                            ? [...currentSemesters, s]
                            : currentSemesters.filter((item) => item !== s);

                          updateSubject(
                            subject.id,
                            "semester",
                            updatedSemesters
                          );
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
                      id={`faceToFace-${subject.id}`}
                      name={`gradingType-${subject.id}`}
                      checked={subject.gradeWeights.type === "Face to face"}
                      onChange={() => {
                        updateGradeWeights(subject.id, {
                          type: "Face to face",
                          faceToFace: { ww: 0, pt: 0, majorExam: 0 },
                        });
                      }}
                      className="mr-2"
                    />
                    <Label
                      htmlFor={`faceToFace-${subject.id}`}
                      className="font-semibold"
                    >
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
                        <Label htmlFor={`written-${subject.id}`}>
                          Written Works (%)
                        </Label>
                        <Input
                          id={`written-${subject.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter percentage"
                          value={subject.gradeWeights.faceToFace?.ww || ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            updateGradeWeights(subject.id, {
                              ...subject.gradeWeights,
                              faceToFace: {
                                ...subject.gradeWeights.faceToFace,
                                ww: value,
                              },
                            });
                          }}
                          disabled={
                            subject.gradeWeights.type !== "Face to face"
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor={`performance-${subject.id}`}>
                          Performance Tasks (%)
                        </Label>
                        <Input
                          id={`performance-${subject.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter percentage"
                          value={subject.gradeWeights.faceToFace?.pt || ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            updateGradeWeights(subject.id, {
                              ...subject.gradeWeights,
                              faceToFace: {
                                ...subject.gradeWeights.faceToFace,
                                pt: value,
                              },
                            });
                          }}
                          disabled={
                            subject.gradeWeights.type !== "Face to face"
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor={`majorExam-${subject.id}`}>
                          Major Exam (%)
                        </Label>
                        <Input
                          id={`majorExam-${subject.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter percentage"
                          value={
                            subject.gradeWeights.faceToFace?.majorExam || ""
                          }
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            updateGradeWeights(subject.id, {
                              ...subject.gradeWeights,
                              faceToFace: {
                                ...subject.gradeWeights.faceToFace,
                                majorExam: value,
                              },
                            });
                          }}
                          disabled={
                            subject.gradeWeights.type !== "Face to face"
                          }
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
                      id={`modular-${subject.id}`}
                      name={`gradingType-${subject.id}`}
                      checked={subject.gradeWeights.type === "Modular"}
                      onChange={() => {
                        updateGradeWeights(subject.id, {
                          type: "Modular",
                          modular: { ww: 0, pt: 0 },
                        });
                      }}
                      className="mr-2"
                    />
                    <Label
                      htmlFor={`modular-${subject.id}`}
                      className="font-semibold"
                    >
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
                        <Label htmlFor={`modularWritten-${subject.id}`}>
                          Written Works (%)
                        </Label>
                        <Input
                          id={`modularWritten-${subject.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter percentage"
                          value={subject.gradeWeights.modular?.ww || ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            updateGradeWeights(subject.id, {
                              ...subject.gradeWeights,
                              modular: {
                                ...subject.gradeWeights.modular,
                                ww: value,
                              },
                            });
                          }}
                          disabled={subject.gradeWeights.type !== "Modular"}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`modularPerformance-${subject.id}`}>
                          Performance Tasks (%)
                        </Label>
                        <Input
                          id={`modularPerformance-${subject.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter percentage"
                          value={subject.gradeWeights.modular?.pt || ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            updateGradeWeights(subject.id, {
                              ...subject.gradeWeights,
                              modular: {
                                ...subject.gradeWeights.modular,
                                pt: value,
                              },
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
                      id={`other-${subject.id}`}
                      name={`gradingType-${subject.id}`}
                      checked={subject.gradeWeights.type === "Other"}
                      onChange={() => {
                        updateGradeWeights(subject.id, {
                          type: "Other",
                          other: [],
                        });
                      }}
                      className="mr-2"
                    />
                    <Label
                      htmlFor={`other-${subject.id}`}
                      className="font-semibold"
                    >
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
                                    updateGradeWeights(subject.id, {
                                      ...subject.gradeWeights,
                                      other: updatedOther,
                                    });
                                  }}
                                  disabled={
                                    subject.gradeWeights.type !== "Other"
                                  }
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
                              value={
                                subject.newComponentType ||
                                gradeComponentTypes[0]
                              }
                              onValueChange={(value) => {
                                updateSubject(
                                  subject.id,
                                  "newComponentType",
                                  value
                                );
                              }}
                              disabled={subject.gradeWeights.type !== "Other"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select component" />
                              </SelectTrigger>
                              <SelectContent>
                                {gradeComponentTypes.map((type) => (
                                  <SelectItem
                                    key={`${type}-${subject.id}`}
                                    value={type}
                                  >
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
                              value={subject.newComponentPercentage || ""}
                              onChange={(e) => {
                                updateSubject(
                                  subject.id,
                                  "newComponentPercentage",
                                  e.target.value
                                );
                              }}
                              disabled={subject.gradeWeights.type !== "Other"}
                            />
                          </div>
                        </div>

                        <Button
                          onClick={() => handleOGCButton(subject)}
                          disabled={
                            subject.gradeWeights.type !== "Other" ||
                            !subject.newComponentPercentage ||
                            Number(subject.newComponentPercentage) <= 0
                          }
                          className="w-full"
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
        </Card>
      ))}

      {/* Add Subject Button */}
      <Button
        onClick={addNewSubject}
        variant="outline"
        className="flex items-center gap-2"
        type="button"
      >
        <Plus className="h-4 w-4" />
        Add Another Subject
      </Button>
    </div>
  );
};
