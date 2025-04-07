import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
 
const schema = defineSchema({
  ...authTables,
  // Your other tables...
  users: defineTable({
    fullName: v.string(),
    role: v.union(
        v.literal("admin"),
        v.literal("teacher"),
        v.literal("school-head"),
        v.literal("registrar")
    ), 
    schoolHeadType: v.optional(v.union(
        v.literal("junior-high"),
        v.literal("senior-high")
    )),
    teacherType: v.optional(v.union(
        v.literal('subject-teacher'),
        v.literal('adviser'),
        v.literal('adviser/subject-teacher')
    )),
    isActive: v.optional(v.boolean()),
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
  }),
  systemSettings: defineTable({
    schoolImage: v.optional(v.string()),
    schoolName: v.optional(v.string()),
  })
});
 
export default schema;