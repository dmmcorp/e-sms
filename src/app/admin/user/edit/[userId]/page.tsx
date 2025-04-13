"use client";

import { containerVariants } from "@/app/admin/_components/variants";
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
import {
  PrincipalDepartmentType,
  RoleType,
  SchoolYearTypes,
} from "@/lib/types";
import { UserFormData } from "@/lib/zod";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  use,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { SectionForm } from "../../_components/section-form";
import { SubjectTaughtForm } from "../../_components/subject-taught-form";
import { principalDepartments, roles } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface EditUserPageProps {
  params: {
    userId: Id<"users">;
  };
}

const EditUserPage = ({ params }: EditUserPageProps) => {
  const { userId } = params;

  const initialFormValues: UserFormData = {
    role: "admin",
    principalType: undefined,
    fullName: "",
    email: "",
    password: "", // Empty for editing
    subjectsTaught: [],
    sections: [],
  };

  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>(initialFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data
  const user = useQuery(api.users.getUser, { userId });

  // Update user mutation
  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: useConvexMutation(api.users.updateUser),
  });

  // Load user data when available
  useEffect(() => {
    // Only run if user data is available
    if (user) {
      console.log("User data received:", JSON.stringify(user, null, 2)); // Log fetched data

      // Map sections, ensuring correct types
      const mappedSections = (user.sections || []).map((section) => ({
        name: section.name,
        gradeLevel: section.gradeLevel,
        schoolYear: section.schoolYear as SchoolYearTypes | undefined,
        // adviserId: section.adviserId,
      }));

      const mappedSubjects = (user.subjectsTaught || []).map((subject) => ({
        subjectName: subject.subjectName || "",
        gradeLevel: subject.gradeLevel,
        sectionId: subject.sectionId || "",
        quarter: Array.isArray(subject.quarter) ? subject.quarter : [],
        semester: Array.isArray(subject.semester) ? subject.semester : [],
        gradeWeights: {
          type: subject.gradeWeights?.type || "Face to face",
          faceToFace: subject.gradeWeights?.faceToFace || undefined,
          modular: subject.gradeWeights?.modular || undefined,
          other: subject.gradeWeights?.other || undefined,
        },
      }));

      // Set the entire form data state at once
      setFormData({
        role: user.role,
        principalType: user.principalType,
        fullName: user.fullName,
        email: user.email,
        password: "",
        // @ts-expect-error slight type issue
        subjectsTaught: Array.isArray(mappedSubjects) ? mappedSubjects : [],
        sections: Array.isArray(mappedSections) ? mappedSections : [],
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fieldErrors: Record<string, string> = {};

    // Basic validations
    if (!formData.fullName.trim()) {
      fieldErrors.fullName = "Name is required";
    }

    if (!formData.email.trim()) {
      fieldErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      fieldErrors.email = "Valid email is required";
    }

    // Password is optional when editing
    if (formData.password && formData.password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters";
    }

    // Role-specific validations (same as in user-page.tsx)
    if (formData.role === "principal" && !formData.principalType) {
      fieldErrors.principalType = "Department is required for principal role";
    }

    // Adviser validations
    if (
      formData.role === "adviser" ||
      formData.role === "adviser/subject-teacher"
    ) {
      if (!formData.sections || formData.sections.length === 0) {
        fieldErrors.sections = "At least one section is required";
      } else {
        // Validate each section
        formData.sections.forEach((section, index) => {
          if (!section.name) {
            fieldErrors[`section${index}Name`] = "Section name is required";
          }
          if (!section.gradeLevel) {
            fieldErrors[`section${index}GradeLevel`] =
              "Grade level is required";
          }
          if (!section.schoolYear) {
            fieldErrors[`section${index}SchoolYear`] =
              "School year is required";
          }
        });
      }
    }

    // Subject Teacher validations
    if (
      formData.role === "subject-teacher" ||
      formData.role === "adviser/subject-teacher"
    ) {
      if (!formData.subjectsTaught || formData.subjectsTaught.length === 0) {
        fieldErrors.subjectsTaught = "At least one subject is required";
      } else {
        // Other validation logic from user-page.tsx
        // ...
      }
    }

    // If there are validation errors, show them
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Please fix the form errors");
      return;
    }

    try {
      if (!userId) return;

      // Process form data for submission
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
          sectionId: subject.sectionId,
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

      // Update user
      updateUser(
        {
          userId,
          role: formData.role as RoleType,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password || undefined,
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
            toast.success("User updated successfully");
          },
          onError: (error: unknown) => {
            if (error instanceof ConvexError) {
              toast.error(error.data || "Failed to update user");
            } else {
              toast.error("An unexpected error occurred");
            }
          },
        }
      );
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  console.log(`FormData: ${JSON.stringify(formData)}`);

  return (
    <div className="container mx-auto">
      <div className="w-full space-y-5 px-2 py-7">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex items-center justify-center"
        >
          <Card className="lg:w-1/2">
            <CardContent>
              {!user ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                          <SelectValue id="role" placeholder="Select role" />
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
                      <Label htmlFor="principalType" className="w-[15%]">
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
                            <SelectValue placeholder="Select department" />
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
                      Name:
                    </Label>
                    <div className="w-[85%]">
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full"
                        disabled={isPending}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-x-3 w-full">
                    <Label htmlFor="email" className="w-[15%]">
                      Email:
                    </Label>
                    <div className="w-[85%]">
                      <Input
                        id="email"
                        name="email"
                        type="email"
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
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full"
                        placeholder="Leave empty to keep current password"
                        disabled={isPending}
                      />
                      {errors.password && (
                        <p className="text-xs text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Role-specific forms */}
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
                    />
                  )}

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => {
                        router.push("/admin/data");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EditUserPage;
