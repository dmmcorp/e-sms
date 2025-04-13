"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { containerVariants } from "../../_components/variants";
import { UserFormData } from "@/lib/zod";
import { gradeLevels, schoolYears } from "@/lib/constants";

interface SectionFormProps {
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  isPending: boolean;
}

export const SectionForm = ({
  errors,
  formData,
  handleChange,
  setFormData,
  isPending,
}: SectionFormProps) => {
  useEffect(() => {
    if (!formData.sections || formData.sections.length === 0) {
      setFormData((prev) => ({
        ...prev,
        sections: [{ name: "", gradeLevel: undefined, schoolYear: undefined }],
      }));
    }
  }, []);

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        { name: "", gradeLevel: undefined, schoolYear: undefined },
      ],
    }));
  };

  const removeSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateSection = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedSections = [...(prev.sections || [])];
      updatedSections[index] = { ...updatedSections[index], [field]: value };
      return { ...prev, sections: updatedSections };
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Adviser Sections</h3>
        <Button
          type="button"
          onClick={addSection}
          variant="outline"
          size="sm"
          disabled={isPending}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {formData.sections?.map((section, index) => (
        <Card key={index} className="w-full">
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Section {index + 1}</h4>
              {formData.sections!.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(index)}
                  className="text-red-500"
                  disabled={isPending}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-x-3 w-full">
                <Label
                  htmlFor={`section-schoolYear-${index}`}
                  className="w-[20%]"
                >
                  School Year:
                </Label>
                <div className="w-[80%]">
                  <Select
                    disabled={isPending}
                    value={section.schoolYear || ""}
                    onValueChange={(value) =>
                      updateSection(index, "schoolYear", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select school year" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`section${index}SchoolYear`] && (
                    <p className="text-xs text-red-600">
                      {errors[`section${index}SchoolYear`]}
                    </p>
                  )}
                </div>
              </div>

              {section.schoolYear && (
                <p>School Year: {section.schoolYear || ""}</p>
              )}
              <div className="flex items-center gap-x-3 w-full mt-11">
                <Label
                  htmlFor={`section-gradeLevel-${index}`}
                  className="w-[20%]"
                >
                  Grade Level:
                </Label>
                <div className="w-[80%]">
                  <Select
                    disabled={isPending}
                    value={section.gradeLevel || ""}
                    onValueChange={(value) =>
                      updateSection(index, "gradeLevel", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`section${index}GradeLevel`] && (
                    <p className="text-xs text-red-600">
                      {errors[`section${index}GradeLevel`]}
                    </p>
                  )}
                </div>
              </div>

              <p className="font-bold underline underline-offset-4">
                Add Section
              </p>
              <div className="flex items-center gap-x-3 w-full">
                <Label htmlFor={`section-name-${index}`} className="w-[20%]">
                  Section Name:
                </Label>
                <div className="w-[80%]">
                  <Input
                    id={`section-name-${index}`}
                    disabled={isPending}
                    placeholder="Enter section name"
                    value={section.name}
                    onChange={(e) =>
                      updateSection(index, "name", e.target.value)
                    }
                  />
                  {errors[`section${index}Name`] && (
                    <p className="text-xs text-red-600">
                      {errors[`section${index}Name`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
};
