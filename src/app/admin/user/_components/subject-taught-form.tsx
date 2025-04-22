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
  seniorHighGrades,
  subjectCategories,
} from "@/lib/constants";
import {
  GradeLevelsTypes,
  GradeWeights,
  QuarterType,
  SemesterType,
} from "@/lib/types";
import { UserFormData } from "@/lib/zod";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Doc } from "../../../../../convex/_generated/dataModel";

interface SubjectTaughtFormProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  errors: Record<string, string>;
  isPending: boolean;
  sections: Doc<"sections">[] | undefined;
}

type SubjectData = NonNullable<UserFormData["subjectsTaught"]>[number];

// == Internal Component for Subject Card ==
interface SubjectCardContentProps {
  subject: SubjectData;
  index: number;
  sections: Doc<"sections">[] | undefined;
  formData: UserFormData;
  errors: Record<string, string>;
  isPending: boolean;
  updateSubject: (index: number, field: keyof SubjectData, value: any) => void;
  updateGradeWeights: (
    index: number,
    gradeWeights: SubjectData["gradeWeights"]
  ) => void;
  handleOGCButton: (index: number, type: string, percentage: string) => void;
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
  handleOGCButton,
}) => {
  const [localNewComponentType, setLocalNewComponentType] = useState<string>(
    gradeComponentTypes[0]
  );
  const [localNewComponentPercentage, setLocalNewComponentPercentage] =
    useState<string>("");

  const handleAddWeightClick = () => {
    handleOGCButton(index, localNewComponentType, localNewComponentPercentage);
    setLocalNewComponentType(gradeComponentTypes[0]);
    setLocalNewComponentPercentage("");
  };

  const isSeniorHigh = useMemo(
    () => seniorHighGrades.includes(subject.gradeLevel),
    [subject.gradeLevel]
  );

  const existingSectionNames = new Set(
    sections
      ?.filter((s) => s.gradeLevel === subject.gradeLevel)
      .map((s) => s.name)
  );

  const availableDbSections = sections
    ?.filter((section) => section.gradeLevel === subject.gradeLevel)
    .map((section) => ({ id: section._id, name: section.name }));

  const availablePendingSections =
    formData.role === "adviser" || formData.role === "adviser/subject-teacher"
      ? formData.sections
        ?.filter(
          (formSection) =>
            formSection.gradeLevel === subject.gradeLevel &&
            formSection.name &&
            !existingSectionNames.has(formSection.name)
        )
        .map((formSection) => {
          const actualIndex = formData.sections?.findIndex(
            (s) =>
              s.name === formSection.name &&
              s.gradeLevel === formSection.gradeLevel
          );
          if (actualIndex === undefined || actualIndex < 0) return null;
          return {
            value: `pending-section-${actualIndex}`,
            name: formSection.name,
          };
        })
        .filter(Boolean) // Remove nulls if findIndex fails
      : [];

  const handleSemesterChange = (selectedSemesters: SemesterType[]) => {
    // Determine which quarters are *potentially* allowed by the new semester selection
    const newlyAllowedQuartersSet = new Set<QuarterType>();
    if (selectedSemesters.includes("1st semester")) {
      newlyAllowedQuartersSet.add("1st quarter");
      newlyAllowedQuartersSet.add("2nd quarter");
    }
    if (selectedSemesters.includes("2nd semester")) {
      newlyAllowedQuartersSet.add("3rd quarter");
      newlyAllowedQuartersSet.add("4th quarter");
    }

    // Filter the *currently selected* quarters to keep only those
    // that belong to the newly selected semesters.
    const updatedQuarters = (subject.quarter || []).filter((q) =>
      newlyAllowedQuartersSet.has(q)
    );

    // Update both semester and the potentially filtered quarter fields in formData
    updateSubject(index, "semester", selectedSemesters);
    updateSubject(index, "quarter", updatedQuarters);
  };

  const handleQuarterChange = (selectedQuarters: QuarterType[]) => {
    if (isSeniorHigh) {
      // For SHS, only allow quarters that belong to an already selected semester
      const allowedBasedOnSemesters = new Set(shsAllowedQuarters); // Use the memoized value
      const validSelectedQuarters = selectedQuarters.filter((q) =>
        allowedBasedOnSemesters.has(q)
      );
      updateSubject(index, "quarter", validSelectedQuarters);
    } else {
      // For JHS, allow any quarter selection
      updateSubject(index, "quarter", selectedQuarters);
      // Ensure semester is empty for JHS
      if (subject.semester && subject.semester.length > 0) {
        updateSubject(index, "semester", []);
      }
    }
  };

  // Determine which quarters are selectable/checked based on selected semesters for SHS
  const shsAllowedQuarters = useMemo(() => {
    if (!isSeniorHigh) return quarters; // All allowed for JHS
    const allowed: QuarterType[] = [];
    if (subject.semester?.includes("1st semester")) {
      allowed.push("1st quarter", "2nd quarter");
    }
    if (subject.semester?.includes("2nd semester")) {
      allowed.push("3rd quarter", "4th quarter");
    }
    return allowed;
  }, [isSeniorHigh, subject.semester]);

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

        {/* NEW: Category select for senior high */}
        <div className={`space-y-2 ${!isSeniorHigh ? "hidden" : ""}`}>
          {" "}
          {/* Hide if not SHS */}
          <Label htmlFor={`category-${index}`}>Category (SHS)</Label>
          <Select
            value={subject.category || ""}
            onValueChange={(value) => updateSubject(index, "category", value)}
            disabled={!isSeniorHigh || isPending} // Disable if not SHS or pending
          >
            <SelectTrigger id={`category-${index}`} className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {subjectCategories.map((cat) => (
                <SelectItem key={`${cat}-${index}`} value={cat}>
                  {/* Capitalize first letter for display */}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Optional: Add error display if needed */}
          {errors[`subject${index}Category`] && (
            <p className="text-xs text-red-600">
              {errors[`subject${index}Category`]}
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
              {availableDbSections?.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}

              {/* Pending Sections */}
              {availablePendingSections?.map((formSection) => (
                <SelectItem
                  // @ts-expect-error value might be null
                  key={formSection.value}
                  // @ts-expect-error value might be null
                  value={formSection.value}
                  className="bg-blue-50"
                >
                  {/* @ts-expect-error name might be null */}
                  {formSection.name}
                  {/* (Pending) Add (Pending) back */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[`subject${index}Section`] && (
            <p className="text-xs text-red-600">
              {errors[`subject${index}Section`]}
            </p>
          )}
        </div>
      </div>

      {/* --- Semester & Quarter Selection --- */}
      <h1 className="font-bold underline underline-offset-4 text-center mt-4">
        Semester & Quarter Assignment
      </h1>
      <div className="flex flex-col lg:flex-row gap-5 w-full">
        {/* Quarter Selection Card */}
        <Card className="p-4 w-full">
          <div className="flex justify-between items-center mb-2">
            <Label className="font-semibold">Quarters</Label>
            {errors[`subject${index}Quarter`] && (
              <p className="text-xs text-red-600">
                {errors[`subject${index}Quarter`]}
              </p>
            )}
            {/* Select All/Deselect All for Quarters */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentQuarters = subject.quarter || [];
                let quartersToSelect: QuarterType[];
                if (isSeniorHigh) {
                  // Select only quarters allowed by current semesters (create mutable copy)
                  quartersToSelect = [...shsAllowedQuarters];
                } else {
                  // Select all quarters for JHS (create mutable copy)
                  quartersToSelect = [...quarters];
                }
                // Toggle between selecting allowed/all and deselecting all
                const newQuarters =
                  currentQuarters.length === quartersToSelect.length
                    ? []
                    : [...quartersToSelect];
                handleQuarterChange(newQuarters); // Use updated handler
              }}
              className="col-span-2 sm:col-span-4 mb-1"
              // Disable Select All if SHS and no semesters are selected
              disabled={
                (isSeniorHigh && shsAllowedQuarters.length === 0) || isPending
              }
            >
              {/* Adjust button text based on context */}
              {subject.quarter?.length ===
                (isSeniorHigh ? shsAllowedQuarters.length : quarters.length) &&
                (isSeniorHigh ? shsAllowedQuarters.length > 0 : true)
                ? "Deselect All"
                : "Select All" + (isSeniorHigh ? " (Allowed)" : "")}
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 w-full gap-2">
            {quarters.map((q) => {
              // --- TOUCHED: Quarter disabling logic ---
              // Disable quarters if SHS and their corresponding semester is NOT selected
              const isQuarterDisabledForSHS =
                isSeniorHigh && !shsAllowedQuarters.includes(q);
              const isChecked = subject.quarter?.includes(q) || false;

              return (
                <label
                  key={`${q}-${index}`}
                  // --- TOUCHED: ClassName logic simplified ---
                  className={`flex items-center gap-2 ${isQuarterDisabledForSHS ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                >
                  <Checkbox
                    checked={isChecked}
                    // --- TOUCHED: onCheckedChange logic updated ---
                    // Allow direct changes for both JHS and SHS (if not disabled)
                    onCheckedChange={(checked) => {
                      // No need for isSeniorHigh check here, handler does it
                      const currentQuarters = subject.quarter || [];
                      const updatedQuarters = checked
                        ? [...currentQuarters, q]
                        : currentQuarters.filter((item) => item !== q);
                      handleQuarterChange(updatedQuarters); // Use updated handler
                    }}
                    // --- TOUCHED: disabled logic updated ---
                    // Disable only if SHS quarter is not allowed OR form is pending
                    disabled={isQuarterDisabledForSHS || isPending}
                  />
                  <span>{q}</span>
                </label>
              );
            })}
          </div>
        </Card>

        {/* SEMESTERS */}
        <Card
          className={`p-4 w-full ${!isSeniorHigh ? "opacity-50 bg-gray-50" : ""}`}
        >
          <div className="flex justify-between items-center mb-2">
            <Label className="font-semibold">Semesters (SHS Only)</Label>
            {errors[`subject${index}Semester`] && (
              <p className="text-xs text-red-600">
                {errors[`subject${index}Semester`]}
              </p>
            )}
            {/* Select All/Deselect All for Semesters */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentSemesters = subject.semester || [];
                const newSemesters =
                  currentSemesters.length === semesters.length
                    ? []
                    : [...semesters];
                handleSemesterChange(newSemesters); // Use updated handler
              }}
              className="col-span-2 mb-1"
              disabled={!isSeniorHigh || isPending} // Disable if not SHS
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
                className={`flex items-center gap-2 ${!isSeniorHigh ? "cursor-not-allowed" : "hover:bg-gray-50"}`}
              >
                <Checkbox
                  checked={subject.semester?.includes(s) || false}
                  onCheckedChange={(checked) => {
                    if (!isSeniorHigh) return; // Ignore clicks if not SHS
                    const currentSemesters = subject.semester || [];
                    const updatedSemesters = checked
                      ? [...currentSemesters, s]
                      : currentSemesters.filter((item) => item !== s);
                    handleSemesterChange(updatedSemesters); // Use updated handler
                  }}
                  disabled={!isSeniorHigh || isPending} // Disable if not SHS
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
                          (Must equal to 100%)
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
                          (Must equal to 100%)
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
                              (Must equal to 100%)
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
  sections,
}: SubjectTaughtFormProps) => {
  // Add a new empty subject directly to formData
  const addNewSubject = () => {
    const newSubject: SubjectData = {
      subjectName: "",
      sectionId: "",
      gradeLevel: gradeLevels[0],
      quarter: [],
      semester: [],
      category: undefined,
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

  // Remove a subject by index
  const removeSubject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subjectsTaught: (prev.subjectsTaught || []).filter((_, i) => i !== index),
    }));
  };

  const updateSubject = (
    index: number,
    field: keyof SubjectData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    setFormData((prev) => {
      const updatedSubjects = [...(prev.subjectsTaught || [])];
      if (updatedSubjects[index]) {
        // Special handling for gradeLevel change to reset dependent fields
        if (field === "gradeLevel") {
          const isNowSenior = seniorHighGrades.includes(
            value as GradeLevelsTypes
          );

          updatedSubjects[index] = {
            ...updatedSubjects[index],
            [field]: value,
            semester: [], // Reset semester
            quarter: [], // Reset quarter
            sectionId: "", // Reset section
            category: isNowSenior ? updatedSubjects[index].category : undefined,
          };
        } else {
          updatedSubjects[index] = {
            ...updatedSubjects[index],
            [field]: value,
          };
        }
      }
      return { ...prev, subjectsTaught: updatedSubjects };
    });
  };

  // Update grade weights for a specific subject
  const updateGradeWeights = (
    index: number,
    newGradeWeightsInput: SubjectData["gradeWeights"]
  ) => {
    setFormData((prev) => {
      const updatedSubjects = [...(prev.subjectsTaught || [])];
      if (updatedSubjects[index]) {
        let finalGradeWeights: GradeWeights;

        if (newGradeWeightsInput.type === "Face to face") {
          finalGradeWeights = {
            type: "Face to face",
            faceToFace: {
              ww: newGradeWeightsInput.faceToFace?.ww ?? 0,
              pt: newGradeWeightsInput.faceToFace?.pt ?? 0,
              majorExam: newGradeWeightsInput.faceToFace?.majorExam ?? 0,
            },
            modular: undefined,
            other: undefined,
          };
        } else if (newGradeWeightsInput.type === "Modular") {
          finalGradeWeights = {
            type: "Modular",
            modular: {
              ww: newGradeWeightsInput.modular?.ww ?? 0,
              pt: newGradeWeightsInput.modular?.pt ?? 0,
            },
            faceToFace: undefined,
            other: undefined,
          };
        } else {
          finalGradeWeights = {
            type: "Other",
            other: Array.isArray(newGradeWeightsInput.other)
              ? newGradeWeightsInput.other
              : [],
            faceToFace: undefined,
            modular: undefined,
          };
        }

        updatedSubjects[index] = {
          ...updatedSubjects[index],
          gradeWeights: finalGradeWeights,
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

  console.log("SubjectTaughtForm formData:", JSON.stringify(formData, null, 2));
  console.log("SubjectTaughtForm sections prop:", sections?.length);

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
