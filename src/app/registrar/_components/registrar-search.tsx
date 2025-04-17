"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z
  .object({
    lrn: z.string().optional(),
    fullName: z.string().optional(),
  })
  .refine((data) => data.lrn || data.fullName, {
    message: "Please enter either LRN or Student Name",
    path: ["lrn"],
  });

export function RegistrarSearch() {
  const [searchResults, setSearchResults] = useState<Doc<"students">[] | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 1. Define form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lrn: "",
      fullName: "",
    },
  });

  const [searchArgs, setSearchArgs] = useState<{
    searchText?: string;
    searchLrn?: string;
  } | null>(null);
  const results = useQuery(api.registrar.searchStudents, {
    searchLRN: form.getValues("lrn"),
    searchText: form.getValues("fullName"),
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSearching(true);
    setSearchResults(null);
    setSearchError(null);
    setSearchArgs({ searchLrn: values.lrn, searchText: values.fullName });
  }

  useEffect(() => {
    if (results !== undefined) {
      setSearchResults(results);
      setIsSearching(false);
      if (
        results.length === 0 &&
        (searchArgs?.searchLrn || searchArgs?.searchText)
      ) {
        setSearchError("No students found matching your criteria.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const handleViewForm137 = (studentId: string) => {
    // TODO: Implement navigation or modal display for Form 137. A simple dialog/modal would do.
    console.log("View Form 137 for student:", studentId);
    toast.success("Form 137 Here");
  };

  return (
    <div className="min-h-dvh max-w-2xl w-full flex flex-col items-center mx-auto pt-10 space-y-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Student Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="lrn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student LRN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 12-digit LRN"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) form.setValue("fullName", ""); // Clear other field
                        }}
                        maxLength={12}
                      />
                    </FormControl>
                    <FormDescription>
                      Search using LRN (clears name field).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-center text-sm text-muted-foreground">
                OR
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter first, middle, or last name"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) form.setValue("lrn", ""); // Clear other field
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Search using name (clears LRN field).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && ( // Display general form error if refine fails
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Button type="submit" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {isSearching && <p>Loading results...</p>}
      {searchError && <p className="text-red-500">{searchError}</p>}
      {searchResults && searchResults.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {searchResults.map((student) => (
                <li
                  key={student._id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{`${student.lastName}, ${student.firstName} ${student.middleName || ""}`}</p>
                    <p className="text-sm text-muted-foreground">
                      LRN: {student.lrn}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewForm137(student._id)}
                  >
                    View Form 137
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
