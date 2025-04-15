"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2Icon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { modules } from "@/lib/constants";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { unparse } from "papaparse";
import JSZip from "jszip";

export const BackupCard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedModules, setSelectedModules] = useState<
    Record<string, boolean>
  >({
    users: false,
    systemSettings: false,
    students: false,
    enrollments: false,
    sections: false,
    subjects: false,
    grades: false,
  });
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("csv");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const exportDataMutation = useMutation(api.backup.exportData);

  const downloadFile = (data: any, filename: string) => {
    if (exportFormat === "json") {
      // For JSON, keep the current approach
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // For CSV, use JSZip to create a zip with multiple CSV files
      if (Object.keys(data).length === 1) {
        // Single module export - just download the CSV directly
        const moduleName = Object.keys(data)[0];
        const csvData = unparse(data[moduleName]);
        const blob = new Blob([csvData], { type: "text/csv" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Multiple modules - create a zip file with separate CSVs
        const zip = new JSZip();
        const baseFilename = filename.split(".")[0];

        // Create a separate CSV file for each module
        Object.entries(data).forEach(([moduleName, moduleData]) => {
          // Get a user-friendly module name
          const moduleLabel =
            modules.find((m) => m.id === moduleName)?.label || moduleName;
          // Convert the module data to CSV
          const csvData = unparse(moduleData as any[]);
          // Add the CSV to the zip
          zip.file(`${moduleLabel}.csv`, csvData);
        });

        // Generate the zip file
        toast.info("Preparing multiple CSV files in a zip archive...");
        zip
          .generateAsync({ type: "blob" })
          .then((zipBlob) => {
            // Download the zip file
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${baseFilename}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Export complete! Downloaded as zip archive.");
          })
          .catch((error: unknown) => {
            console.error("Error creating zip file:", error);
            toast.error("Failed to create zip file. See console for details.");
          });
      }
    }
  };

  const convertToCSV = (data: any) => {
    const flattenedData: Record<string, any>[] = [];

    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item: any) => {
          flattenedData.push({
            module: key,
            ...item,
          });
        });
      }
    });

    if (flattenedData.length === 0) return "";

    const headers = Object.keys(flattenedData[0]);
    const csvRows = [
      headers.join(","),
      ...flattenedData.map((row) =>
        headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")
      ),
    ];

    return csvRows.join("\n");
  };

  const handleFullExport = async () => {
    setIsExporting(true);
    toast.info("Starting full system export...");
    try {
      const allModules = modules.map((m) => m.id);

      const startTimestamp = startDate
        ? new Date(startDate).getTime()
        : undefined;
      const endTimestamp = endDate ? new Date(endDate).getTime() : undefined;

      const result = await exportDataMutation({
        modules: allModules,
        format: exportFormat,
        startDate: startTimestamp,
        endDate: endTimestamp,
      });

      const exportData = JSON.parse(result);

      downloadFile(
        exportData,
        `full-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`
      );

      toast.success("Full system export complete!");
    } catch (error) {
      console.error("Full export failed:", error);
      toast.error("Full system export failed. Check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectiveExport = async () => {
    const modulesToExport = Object.entries(selectedModules)
      .filter(([, isSelected]) => isSelected)
      .map(([moduleName]) => moduleName);

    if (modulesToExport.length === 0) {
      toast.warning("Please select at least one module to export.");
      return;
    }

    setIsExporting(true);
    toast.info(`Starting export for: ${modulesToExport.join(", ")}...`);
    try {
      const startTimestamp = startDate
        ? new Date(startDate).getTime()
        : undefined;
      const endTimestamp = endDate ? new Date(endDate).getTime() : undefined;

      const result = await exportDataMutation({
        modules: modulesToExport,
        format: exportFormat,
        startDate: startTimestamp,
        endDate: endTimestamp,
      });

      const exportData = JSON.parse(result);
      downloadFile(
        exportData,
        `selective-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`
      );

      toast.success("Selective export complete!");
    } catch (error) {
      console.error("Selective export failed:", error);
      toast.error("Export failed: " + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleModuleChange = (
    moduleName: string,
    checked: boolean | "indeterminate"
  ) => {
    if (typeof checked === "boolean") {
      setSelectedModules((prev) => ({ ...prev, [moduleName]: checked }));
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
          <CardDescription>
            Choose the export format and optional date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="exportFormat">Export Format</Label>
            <Select
              value={exportFormat}
              onValueChange={(value: "json" | "csv") => setExportFormat(value)}
              disabled={isExporting}
            >
              <SelectTrigger id="exportFormat">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              CSV format may simplify nested data.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isExporting}
              className="block w-full"
            />
            <p className="text-xs text-muted-foreground">
              Filters records created on or after this date.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isExporting}
              className="block w-full"
            />
            <p className="text-xs text-muted-foreground">
              Filters records created on or before this date.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Full System Export</CardTitle>
            <CardDescription>
              Export all data tables from the system using the configuration
              above.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={handleFullExport}
              disabled={isExporting}
              className="w-full sm:w-auto"
            >
              {isExporting ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="mr-2 h-4 w-4" />
              )}
              Export All Data
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selective Export</CardTitle>
            <CardDescription>
              Choose specific data modules to export using the configuration
              above.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="font-medium">Select Modules to Export:</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              {modules.map((module) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={selectedModules[module.id]}
                    onCheckedChange={(checked) =>
                      handleModuleChange(module.id, checked)
                    }
                    disabled={isExporting}
                  />
                  <Label
                    htmlFor={`module-${module.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {module.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSelectiveExport}
              disabled={
                isExporting || Object.values(selectedModules).every((v) => !v)
              }
              className="w-full sm:w-auto"
            >
              {isExporting ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="mr-2 h-4 w-4" />
              )}
              Export Selected
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};
