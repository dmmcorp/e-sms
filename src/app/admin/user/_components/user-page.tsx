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
import { UserForm, UserFormData } from "@/lib/zod";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { containerVariants } from "../../_components/variants";
import AdviserForm from "./adviser-form";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { PrincipalDepartmentType, RoleType } from "@/lib/types";
import { SubjectTaughtForm } from "./subject-taught-form";
import { Separator } from "@/components/ui/separator";
import { Id } from "../../../../../convex/_generated/dataModel";

const roles = [
  {
    display: "Admin",
    value: "admin",
  },
  {
    display: "Subject Teacher",
    value: "subject-teacher",
  },
  {
    display: "Adviser",
    value: "adviser",
  },
  {
    display: "Adviser/Subject Teacher",
    value: "adviser/subject-teacher",
  },
  {
    display: "Principal",
    value: "principal",
  },
  {
    display: "Registrar",
    value: "registrar",
  },
];

const principalDepartments = [
  {
    display: "Junior Department",
    value: "junior-department",
  },
  {
    display: "Senior Department",
    value: "senior-department",
  },
  {
    display: "Entire School",
    value: "entire-school",
  },
];

function UserPage() {
  const initialFormValues: UserFormData = {
    role: "admin",
    principalType: undefined,
    fullName: "",
    email: "",
    password: "",
    subjectsTaught: [],
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: createUser, isPending } = useMutation({
    mutationFn: useConvexMutation(api.users.createUser),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors: Record<string, string> = {};

    // Basic validations
    if (formData.role === undefined) {
      fieldErrors.role = "Role is required";
    }

    if (formData.role === "principal" && !formData.principalType) {
      fieldErrors.principalType = "Department is required for principal role";
    }

    // Subject Teacher validations
    if (formData.role === "subject-teacher") {
      if (!formData.subjectsTaught || formData.subjectsTaught.length === 0) {
        fieldErrors.subjectsTaught = "At least one subject is required";
      } else {
        // Validate each subject
        formData.subjectsTaught.forEach((subject, index) => {
          if (!subject.subjectName) {
            fieldErrors[`subject${index}Name`] = "Subject name is required";
          }
          if (!subject.gradeLevel) {
            fieldErrors[`subject${index}Grade`] = "Grade level is required";
          }
          if (!subject.sectionId) {
            fieldErrors[`subject${index}Section`] = "Section is required";
          }

          if (
            (!subject.quarter || subject.quarter.length === 0) &&
            (!subject.semester || subject.semester.length === 0)
          ) {
            fieldErrors[`subject${index}Period`] =
              "Select either quarters or semesters";
          }

          // Validate grade weights
          if (subject.gradeWeights) {
            const weights = subject.gradeWeights;
            let total = 0;

            if (weights.type === "Face to face" && weights.faceToFace) {
              total =
                weights.faceToFace.ww +
                weights.faceToFace.pt +
                weights.faceToFace.majorExam;
            } else if (weights.type === "Modular" && weights.modular) {
              total = weights.modular.ww + weights.modular.pt;
            } else if (weights.type === "Other" && weights.other) {
              total = weights.other.reduce(
                (sum, item) => sum + item.percentage,
                0
              );
            }

            if (total !== 100) {
              fieldErrors[`subject${index}Weights`] =
                "Grade weights must total 100%";
            }
          }
        });
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    // Submit the form
    try {
      // Replace the existing cleanedSubjects code with this:
      const cleanedSubjects = formData.subjectsTaught?.map(
        ({
          // @ts-expect-error slight type issue
          id,
          // @ts-expect-error slight type issue
          newComponentType,
          // @ts-expect-error slight type issue
          newComponentPercentage,
          semester = [], // Provide default empty array
          ...subject
        }) => ({
          ...subject,
          semester: semester || [], // Ensure semester is always an array
          sectionId: subject.sectionId as Id<"sections">, // Keep original type
          gradeWeights: {
            ...subject.gradeWeights,
            // Clean up grade weights based on type
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

      await createUser({
        role: formData.role as RoleType,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        principalType: formData.principalType,
        subjectsTaught:
          formData.role === "subject-teacher" ? cleanedSubjects : undefined,
      });

      setFormData(initialFormValues);
      toast.success("Successfully created a user");
    } catch (error) {
      toast.error(error as string);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      principalType: undefined,
    }));
  }, [formData.role]);

  return (
    <div className="w-full space-y-5 px-2 py-7">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full flex items-center justify-center"
      >
        <Card className="lg:w-1/2 ">
          <CardContent>
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
                    placeholder="Enter full name"
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

              {/* Subject Teacher UI component */}
              {formData.role === "subject-teacher" && (
                <SubjectTaughtForm
                  errors={errors}
                  formData={formData}
                  isPending={isPending}
                  setFormData={setFormData}
                  handleChange={handleChange}
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
      {formData.role === "adviser" && <AdviserForm />}
    </div>
  );
}

export default UserPage;
