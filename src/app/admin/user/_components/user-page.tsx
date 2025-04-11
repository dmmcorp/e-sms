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
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { containerVariants } from "../../_components/variants";
import AdviserForm from "./adviser-form";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";

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

type RoleType =
  | "admin"
  | "subject-teacher"
  | "adviser"
  | "adviser/subject-teacher"
  | "principal"
  | "registrar";

// Define a Zod schema for form validation

function UserPage() {
  const initialFormValues: UserFormData = {
    role: undefined,
    fullName: "",
    email: "",
    password: "",
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

    const result = UserForm.safeParse(formData);

    const fieldErrors: Record<string, string> = {};

    // Check if Zod parsing failed
    if (!result.success) {
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });

      // Additional check for role if it's not handled by Zod
      if (formData.role === undefined) {
        fieldErrors.role = "Role is required";
      }

      setErrors(fieldErrors);
    } else {
      // Even if parsing is successful, ensure role is set
      if (formData.role === undefined) {
        setErrors({ role: "Role is required" });
      } else {
        setErrors({});

        // if all checks passed, and success create the user
        try {
          await createUser({
            ...result.data,
            role: result.data.role as RoleType,
          });
        } catch (error) {
          toast.error(error as string);
        }
      }
    }
  };

  return (
    <div className="space-y-5 px-2 pt-7">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className=""
      >
        <Card className="lg:w-1/2 ">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center gap-x-3 w-full">
                <Label htmlFor="role" className=" w-20">
                  Role:
                </Label>
                <div className="w-full">
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
              <div className="flex items-center gap-x-3 w-full">
                <Label htmlFor="fullName" className=" w-20">
                  Name
                </Label>
                <div className="w-full">
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
                <Label htmlFor="email" className=" w-20">
                  Email
                </Label>
                <div className="w-full">
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
                <Label htmlFor="password" className=" w-20">
                  Password:
                </Label>
                <div className="w-full">
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
              <div className="flex justify-end mt-5">
                <Button type="submit" disabled={isPending}>
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
