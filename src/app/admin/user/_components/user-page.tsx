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
import React, { useState } from "react";
import { z } from "zod";
import AdviserForm from "./adviser-form";
import { motion } from "framer-motion";
import { containerVariants } from "../../_components/variants";
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
const formSchema = z.object({
  role: z
    .enum([
      "admin",
      "subject-teacher",
      "adviser",
      "adviser/subject-teacher",
      "principal",
      "registrar",
    ])
    .optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormData = z.infer<typeof formSchema>;

function UserPage() {
  const initialFormValues: FormData = {
    role: undefined,
    name: "",
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = formSchema.safeParse(formData);

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
        // Proceed with form submission logic here
      }
    }
  };

  return (
    <div className="space-y-5">
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
                <Label htmlFor="name" className=" w-20">
                  Name
                </Label>
                <div className="w-full">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter teacher complete name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">{errors.name}</p>
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
                    placeholder="Enter teacher email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
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
                    placeholder="Enter teacher password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <Button type="submit">Save</Button>
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
