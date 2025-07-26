"use client";
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { ActivityLogsType } from "./activity-logs-column";
import { formatDate } from "@/lib/utils";
import { headers } from "next/headers";
interface UserActivityDocumentTypes {
  logs: ActivityLogsType[];
  startDate: string;
  endDate: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: "10px",
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
    textAlign: "left",
    fontSize: "16px",
    fontWeight: "600",
  },
  header: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    fontSize: "15px",
    fontWeight: "600",
    border: "1px solid black",
    borderColor: "black",
    borderWidth: "1px",
    textAlign: "center",
  },
  row: {
    border: "1px solid black",
    borderColor: "black",
    borderWidth: "1px",
    borderBottomStyle: "solid",
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  column: {
    width: "19%",
    fontSize: "10px",
    borderColor: "black",
    borderRight: "1px",
    borderStyle: "solid",
    padding: "2px",
  },
  data: {
    textAlign: "left",
    fontSize: "10px",
    width: "19%",
    textTransform: "capitalize",
    borderColor: "black",
    borderRight: "1px",
    borderStyle: "solid",
    padding: "2px",
  },
  details: {
    width: "43%",
    fontSize: "8px",
    borderColor: "black",
    borderRight: "1px",
    borderStyle: "solid",
    padding: "2px",
  },
});
function UserActivityDocument({
  logs,
  startDate,
  endDate,
}: UserActivityDocumentTypes) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.title}>
          <Text>User Activity Logs</Text>
          <Text style={{ fontSize: "12px", fontWeight: "500" }}>
            From : {startDate} To : {endDate === "" ? "present" : endDate}
          </Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.column}>Name</Text>
          <Text style={styles.column}>Role</Text>
          <Text style={styles.details}>Details</Text>
          <Text style={styles.column}>Time Stamp</Text>
        </View>
        {logs.map((log) => (
          <View key={log._id} style={styles.row}>
            <Text style={styles.data}>{log.fullName}</Text>
            <Text style={styles.data}>{log.role}</Text>
            <Text style={styles.details}>
              <Text style={{ textTransform: "capitalize", fontWeight: "600" }}>
                {log.action}:
              </Text>{" "}
              {log.details ?? "-"}
            </Text>
            <Text style={styles.data}>{formatDate(log._creationTime)}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default UserActivityDocument;
