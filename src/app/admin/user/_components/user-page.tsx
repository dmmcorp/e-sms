"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { principalDepartments, roles } from "@/lib/constants";
import { PrincipalDepartmentType, RoleType } from "@/lib/types";
import { UserFormData } from "@/lib/zod";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { ConvexError } from "convex/values";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { containerVariants } from "../../_components/variants";
import { SectionForm } from "./section-form";
import { SubjectTaughtForm } from "./subject-taught-form";
import { useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";

function UserPage() {
  const initialFormValues: UserFormData = {
    role: "admin",
    principalType: undefined,
    fullName: "",
    email: "",
    password: "",
    subjectsTaught: [],
    sections: [],
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: createUser, isPending } = useMutation({
    mutationFn: useConvexMutation(api.users.createUser),
  });

  const sections = useQuery(api.sections.get, {});

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      principalType: undefined,
    }));
  }, [formData.role]);

  if (sections === undefined) {
    // Check if sections data is still loading
    return (
      <div className="w-full flex justify-center items-center h-screen">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2">Loading sections...</span>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous errors
    setErrors({});

    const fieldErrors: Record<string, string> = {};

    // Basic validations - Add more strict validation here
    if (!formData.fullName.trim()) {
      fieldErrors.fullName = "Name is required";
    }

    if (!formData.email.trim()) {
      fieldErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      fieldErrors.email = "Valid email is required";
    }

    if (!formData.password.trim()) {
      fieldErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters";
    }

    if (formData.role === undefined) {
      fieldErrors.role = "Role is required";
    }

    if (formData.role === "principal" && !formData.principalType) {
      fieldErrors.principalType = "Department is required for principal role";
    }

    // Adviser validations
    // if (
    //   formData.role === "adviser" ||
    //   formData.role === "adviser/subject-teacher"
    // ) {
    //   if (!formData.sections || formData.sections.length === 0) {
    //     fieldErrors.sections = "At least one section is required";
    //   } else {
    //     // Validate each section
    //     formData.sections.forEach((section, index) => {
    //       if (!section.name) {
    //         fieldErrors[`section${index}Name`] = "Section name is required";
    //       }
    //       if (!section.gradeLevel) {
    //         fieldErrors[`section${index}GradeLevel`] =
    //           "Grade level is required";
    //       }
    //       if (!section.schoolYear) {
    //         fieldErrors[`section${index}SchoolYear`] =
    //           "School year is required";
    //       }
    //     });
    //   }
    // }

    // Subject Teacher validations
    // if (
    //   formData.role === "subject-teacher" ||
    //   formData.role === "adviser/subject-teacher"
    // ) {
    //   if (!formData.subjectsTaught || formData.subjectsTaught.length === 0) {
    //     fieldErrors.subjectsTaught = "At least one subject is required";
    //   } else {
    //     // Validate each subject
    //     formData.subjectsTaught.forEach((subject, index) => {
    //       if (!subject.subjectName) {
    //         fieldErrors[`subject${index}Name`] = "Subject name is required";
    //       }
    //       if (!subject.gradeLevel) {
    //         fieldErrors[`subject${index}Grade`] = "Grade level is required";
    //       }
    //       if (!subject.sectionId) {
    //         fieldErrors[`subject${index}Section`] = "Section is required";
    //       }

    //       if (
    //         (subject.gradeLevel === "Grade 11" ||
    //           subject.gradeLevel === "Grade 12") &&
    //         !subject.category
    //       ) {
    //         fieldErrors[`subject${index}Category`] = "Category is required";
    //       }

    //       // MAPEH validation
    //       if (subject.isMapeh && !subject.mapehComponent) {
    //         fieldErrors[`subject${index}MapehComponent`] =
    //           "MAPEH component is required";
    //       }

    //       if (
    //         (!subject.quarter || subject.quarter.length === 0) &&
    //         (!subject.semester || subject.semester.length === 0)
    //       ) {
    //         fieldErrors[`subject${index}Period`] =
    //           "Select either quarters or semesters";
    //       }

    //       if (
    //         subject.gradeLevel === "Grade 11" ||
    //         subject.gradeLevel === "Grade 12"
    //       ) {
    //         if (!subject.quarter || subject.quarter.length === 0) {
    //           fieldErrors[`subject${index}Quarter`] = "Quarter is required";
    //         }
    //         if (!subject.semester || subject.semester.length === 0) {
    //           fieldErrors[`subject${index}Semester`] = "Semester is required";
    //         }
    //       }

    //       // Validate grade weights
    //       if (subject.gradeWeights) {
    //         const weights = subject.gradeWeights;
    //         let total = 0;

    //         if (weights.type === "Face to face" && weights.faceToFace) {
    //           total =
    //             weights.faceToFace.ww +
    //             weights.faceToFace.pt +
    //             weights.faceToFace.majorExam;
    //         } else if (weights.type === "Modular" && weights.modular) {
    //           total = weights.modular.ww + weights.modular.pt;
    //         } else if (weights.type === "Other" && weights.other) {
    //           // Check if other array exists and has elements
    //           total =
    //             weights.other && weights.other.length > 0
    //               ? weights.other.reduce(
    //                   (sum, item) => sum + item.percentage,
    //                   0
    //                 )
    //               : 0;
    //         }

    //         if (total !== 100) {
    //           fieldErrors[`subject${index}Weights`] =
    //             "Grade weights must total 100%";
    //         }
    //       }
    //     });
    //   }
    // }

    // If there are validation errors, show them and DON'T submit the form
    if (Object.keys(fieldErrors).length > 0) {
      console.log("Validation errors found:", fieldErrors);
      setErrors(fieldErrors);
      toast.error("Please fix the form errors");
      return; // Stop here and don't submit the form
    }

    // Only if validation passes, proceed with form submission
    try {
      const cleanedSubjects = formData.subjectsTaught?.map(
        ({
          // @ts-expect-error slight type issue
          id,
          // @ts-expect-error slight type issue
          newComponentType,
          // @ts-expect-error slight type issue
          newComponentPercentage,
          semester = [],
          ...subject
        }) => ({
          ...subject,
          semester: semester || [],
          sectionId: subject.sectionId as Id<"sections">,
          gradeWeights: {
            ...subject.gradeWeights,
            faceToFace:
              subject.gradeWeights.type === "Face to face"
                ? subject.gradeWeights.faceToFace
                : undefined,
            modular:
              subject.gradeWeights.type === "Modular"
                ? subject.gradeWeights.modular
                : undefined,
            other:
              subject.gradeWeights.type === "Other"
                ? subject.gradeWeights.other
                : undefined,
          },
        })
      );

      const cleanedSections = formData.sections
        ?.filter(
          (section) => section.name && section.gradeLevel && section.schoolYear
        )
        .map(({ adviserId, ...section }) => ({
          name: section.name,
          gradeLevel: section.gradeLevel!,
          schoolYear: section.schoolYear!,
        }));

      console.log("Form passed validation, submitting data");

      // Only call createUser if validation passes
      createUser(
        {
          role: formData.role as RoleType,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          principalType: formData.principalType,
          subjectsTaught:
            formData.role === "subject-teacher" ||
            formData.role === "adviser/subject-teacher"
              ? cleanedSubjects
              : undefined,
          sections:
            formData.role === "adviser" ||
            formData.role === "adviser/subject-teacher"
              ? cleanedSections
              : undefined,
        },
        {
          onSuccess: () => {
            setFormData(initialFormValues);
            toast.success("Successfully created a user");
          },
          onError: (error: unknown) => {
            console.error("Error creating user:", error);
            if (error instanceof ConvexError) {
              toast.error(error.data || "Failed to create user");
            } else {
              toast.error("An unexpected error occurred");
            }
          },
        }
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        toast.error(error.data || "Failed to create user");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="w-full space-y-5 px-2 py-7">
      {/* {formData.role === "adviser/subject-teacher" && (
        <div className="bg-blue-50 p-2 rounded border border-blue-200 text-sm mb-3">
          <p className="text-blue-700">
            Note: Sections you define above will be available for selection in
            the subjects below. They will appear with "(Pending)" next to them
            and will be created when you submit the form.
          </p>
        </div>
      )} */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full flex items-center justify-center"
      >
        <Card className="lg:w-1/2 ">
          <CardContent>
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm mb-4">
              <p className="text-blue-700">
                Note: If you are creating a MAPEH subject, please name it
                exactly as "MAPEH" (case sensitive).
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center gap-x-3 w-full">
                <Label htmlFor="role" className="w-[15%]">
                  Role:
                </Label>
                <div className="w-[85%]">
                  <Select
                    value={formData.role || ""}
                    disabled={isPending}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: value as RoleType,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        id="role"
                        placeholder="Select teacher role"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-xs text-red-600">{errors.role}</p>
                  )}
                </div>
              </div>

              {formData.role === "principal" && (
                <div className="flex items-center gap-x-3 w-full">
                  <Label htmlFor="role" className="w-[15%]">
                    Department:
                  </Label>
                  <div className="w-[85%]">
                    <Select
                      value={formData.principalType || ""}
                      disabled={isPending}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          principalType: value as PrincipalDepartmentType,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          id="departments"
                          placeholder="Select principal department"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {principalDepartments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.principalType && (
                      <p className="text-xs text-red-600">
                        {errors.principalType}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-x-3 w-full">
                <Label htmlFor="fullName" className="w-[15%]">
                  Name
                </Label>
                <div className="w-[85%]">
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Last Name, First Name, Middle Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full"
                    disabled={isPending}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600">{errors.fullName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-x-3 w-full">
                <Label htmlFor="email" className="w-[15%]">
                  Email
                </Label>
                <div className="w-[85%]">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                    disabled={isPending}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-x-3 w-full">
                <Label htmlFor="password" className="w-[15%]">
                  Password:
                </Label>
                <div className="w-[85%]">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full"
                    disabled={isPending}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <Separator className="my-3" />

              {(formData.role === "adviser" ||
                formData.role === "adviser/subject-teacher") && (
                <>
                  <SectionForm
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleChange={handleChange}
                    isPending={isPending}
                  />
                  {formData.role === "adviser/subject-teacher" && (
                    <Separator className="my-3" />
                  )}
                </>
              )}

              {(formData.role === "subject-teacher" ||
                formData.role === "adviser/subject-teacher") && (
                <SubjectTaughtForm
                  errors={errors}
                  formData={formData}
                  isPending={isPending}
                  setFormData={setFormData}
                  sections={sections}
                />
              )}

              <div className="flex justify-center mt-5">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-[120px]"
                >
                  Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default UserPage;
