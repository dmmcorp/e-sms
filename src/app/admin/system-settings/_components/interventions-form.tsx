"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const InterventionsForm = () => {
  const createUserLogs = useMutation(api.logs.createUserLogs);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createIntervention = useMutation(api.interventions.create);
  const interventions = useQuery(api.interventions.get);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createIntervention(values);
      toast.success("Intervention created successfully");
      await createUserLogs({
        action: "create",
        target: "interventions",
        details: `Intervention created on ${new Date().toISOString().split("T")[0]}`,
      });
      form.reset();
    } catch (error) {
      toast.error("Failed to create intervention");
      await createUserLogs({
        action: "create",
        target: "interventions",
        details: `Intervention creation failed on ${new Date().toISOString().split("T")[0]}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interventions</CardTitle>
        <CardDescription>
          Add new interventions that can be used for student support.
        </CardDescription>
      </CardHeader>
      <Separator className="my-3" />
      <CardContent>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter intervention name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter intervention description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Add Intervention</Button>
            </form>
          </Form>

          {interventions && interventions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">
                Existing Interventions
              </h4>
              <div className="space-y-2">
                {interventions.map((intervention) => (
                  <div
                    key={intervention._id}
                    className="p-3 bg-muted rounded-lg"
                  >
                    <p className="font-medium">{intervention.name}</p>
                    {intervention.description && (
                      <p className="text-sm text-muted-foreground">
                        {intervention.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
