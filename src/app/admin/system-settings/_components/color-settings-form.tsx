"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useDynamicTheme } from "@/components/theme-provider-with-dynamic-colors";

export function ColorSettingsForm() {
  const settings = useQuery(api.systemSettings.getColor);
  const updatePrimaryColor = useMutation(api.systemSettings.updatePrimaryColor);
  const { primaryColor: currentThemeColor } = useDynamicTheme();
  const [color, setColor] = useState(currentThemeColor);

  // Update state when settings are loaded
  useState(() => {
    if (settings?.primaryColor) {
      setColor(settings.primaryColor);
    }
  });

  useEffect(() => {
    const initialColor = settings?.primaryColor || currentThemeColor;
    setColor(initialColor);
  }, [settings, currentThemeColor]);

  const handleSave = async () => {
    try {
      await updatePrimaryColor({
        primaryColor: color,
      });

      toast.success("Settings updated.");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>
          Customize the primary color for all users in the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex items-center gap-4">
            <Input
              id="primaryColor"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#0f172a"
            />
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Preview:</h3>
          <div className="flex flex-wrap gap-2">
            <div
              className="w-24 h-10 rounded"
              style={{ backgroundColor: color }}
            ></div>
            <Button style={{ backgroundColor: color }}>Button</Button>
            <Button variant="outline" style={{ borderColor: color, color }}>
              Outline
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
