/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as backup from "../backup.js";
import type * as classRecords from "../classRecords.js";
import type * as dashboard from "../dashboard.js";
import type * as enrollment from "../enrollment.js";
import type * as files from "../files.js";
import type * as highestScores from "../highestScores.js";
import type * as http from "../http.js";
import type * as principal from "../principal.js";
import type * as registrar from "../registrar.js";
import type * as sections from "../sections.js";
import type * as students from "../students.js";
import type * as subjectThought from "../subjectThought.js";
import type * as systemSettings from "../systemSettings.js";
import type * as teachingLoad from "../teachingLoad.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  backup: typeof backup;
  classRecords: typeof classRecords;
  dashboard: typeof dashboard;
  enrollment: typeof enrollment;
  files: typeof files;
  highestScores: typeof highestScores;
  http: typeof http;
  principal: typeof principal;
  registrar: typeof registrar;
  sections: typeof sections;
  students: typeof students;
  subjectThought: typeof subjectThought;
  systemSettings: typeof systemSettings;
  teachingLoad: typeof teachingLoad;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
