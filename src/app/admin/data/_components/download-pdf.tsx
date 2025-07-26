"use client";
import React, { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import UserActivityDocument from "./user-activity-document";
import { ActivityLogsType } from "./activity-logs-column";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
interface DownloadPdfProps {
  logs: ActivityLogsType[];
  startDate: string;
  endDate: string;
}
function DownloadPdf({ logs, startDate, endDate }: DownloadPdfProps) {
  const [isClient, setIsClient] = useState<boolean>(false);

  // Initialize client-side rendering only once
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the document to avoid re-creating on every render
  const memoizedDocument = useMemo(() => {
    return (
      <UserActivityDocument
        logs={logs}
        startDate={startDate}
        endDate={endDate}
      />
    );
  }, [logs, startDate, endDate]);

  // Only render PDFDownloadLink when client-side
  if (!isClient) return <div>Loading...</div>;
  return (
    <PDFDownloadLink
      fileName={`user-activity-logs.pdf`}
      document={memoizedDocument}
    >
      <Button variant={"default"} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Generate PDF
      </Button>
    </PDFDownloadLink>
  );
}

export default DownloadPdf;
