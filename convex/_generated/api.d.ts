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
import type * as files from "../files.js";
import type * as highestScores from "../highestScores.js";
import type * as http from "../http.js";
import type * as sections from "../sections.js";
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
  files: typeof files;
  highestScores: typeof highestScores;
  http: typeof http;
  sections: typeof sections;
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
