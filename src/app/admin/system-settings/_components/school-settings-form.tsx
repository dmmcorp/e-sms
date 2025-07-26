"use client";

import { motion } from "framer-motion";
import { containerVariants } from "../../_components/variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2Icon, UploadCloudIcon } from "lucide-react";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../../../../convex/_generated/api";
import { useMutation } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// define zod validation schema for system settings
const formSchema = z.object({
  schoolName: z.string().min(2, "Invalid school name format"),
  schoolImage: z.string().min(2, "School image is required"),
});

type FormData = z.infer<typeof formSchema>;

export function SchoolSettingsForm() {
  const createUserLogs = useConvexMutation(api.logs.createUserLogs);
  const [schoolSettings, setSchoolSettings] = useState<FormData>({
    schoolName: "",
    schoolImage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logoStorageId, setLogoStorageId] = useState<string | undefined>("");

  // calling the backend api that we made for system settings
  const generateUploadUrl = useConvexMutation(api.files.generateUploadUrl);
  const { mutate: updateSchoolSettings, isPending } = useMutation({
    mutationFn: useConvexMutation(api.systemSettings.create),
  });

  const logoUrl = useQuery(
    api.files.getStorageUrl,
    logoStorageId ? { storageId: logoStorageId } : "skip"
  );

  // function to be able to read and upload the image to our own database
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();
      setLogoStorageId(storageId);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // function to handle the input of user to our backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = {
        schoolName: schoolSettings.schoolName,
        schoolImage: logoStorageId || "",
      };

      const validatedData = formSchema.parse(formData);

      updateSchoolSettings(validatedData);
      toast.success("School settings updated successfully");
      await createUserLogs({
        action: "update",
        target: "school-settings",
        details: `School settings updated on ${new Date().toISOString().split("T")[0]}`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        await createUserLogs({
          action: "update",
          target: "school-settings",
          details: `School settings update failed on ${new Date().toISOString().split("T")[0]}`,
        });
      } else {
        toast.error("Failed to update school settings");
        console.error("Error updating school settings:", error);
        await createUserLogs({
          action: "update",
          target: "school-settings",
          details: `School settings update failed on ${new Date().toISOString().split("T")[0]}`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <form onSubmit={handleSubmit} className="space-y-2">
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>
                Update your school&apos;s name and logo. These will be displayed
                throughout the application.
              </CardDescription>
            </CardHeader>
            <Separator className="my-3" />
            <CardContent>
              {/* Initialize form for school settings */}
              <div className="flex items-center gap-x-3 w-full">
                {/* Set input for school name */}
                <Label htmlFor="school-name">School Name:</Label>
                <Input
                  id="school-name"
                  placeholder="Enter school name"
                  value={schoolSettings.schoolName}
                  onChange={(e) =>
                    setSchoolSettings((prev) => ({
                      ...prev,
                      schoolName: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-4">
                {/* <Label htmlFor="school-logo">School Logo</Label> */}
                <div className="flex flex-col items-center gap-4 mt-7">
                  <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="School logo preview"
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        No logo selected
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Input
                        id="school-logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          document.getElementById("school-logo")?.click()
                        }
                        disabled={isLoading || isPending}
                      >
                        <UploadCloudIcon className="mr-2 h-4 w-4" />
                        Upload Logo
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: Circle image, at least 64x64px. PNG or JPG
                      format.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={isLoading || isPending}
                className="ml-auto cursor-pointer"
              >
                {isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
