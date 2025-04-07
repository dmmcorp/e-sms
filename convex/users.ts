import { createAccount, getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const UserRole = v.union(
    v.literal("admin"),
    v.literal("teacher"),
    v.literal("school-head"),
    v.literal("staff")
);

export const createUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        middleName: v.optional(v.string()),
        role: v.union(
            v.literal("admin"),
            v.literal("teacher"),
            v.literal("school-head"),
            v.literal("staff")
        ),
        contactNumber: v.string(),
        department: v.optional(v.string()),
        specialization: v.optional(v.string()),
        yearsOfExperience: v.optional(v.number()),
        birthDate: v.string(),
        isActive: v.optional(v.boolean()),
        region: v.optional(v.string()),
        province: v.optional(v.string()),
        city: v.optional(v.string()),
        barangay: v.optional(v.string()),
        street: v.optional(v.string()),
        houseNumber: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        imageStorageId: v.optional(v.string()),
        gender: v.optional(v.string()),
        description: v.optional(v.string()),
        employeeId: v.optional(v.string()),
        position: v.optional(v.string()),
        advisoryClass: v.optional(v.string()),
        subjectId: v.optional(v.array(v.id('subjects'))),
        schoolHeadType: v.optional(v.union(v.literal("junior-high"), v.literal("senior-high"))),
    },
    handler: async (ctx, args) => {
        try {
            // Only admin can create users
            const adminId = await getAuthUserId(ctx);
            if (!adminId) throw new ConvexError("Not authenticated");

            const admin = await ctx.db.get(adminId);
            if (!admin || admin.role !== "admin") {
                throw new ConvexError("Unauthorized - Only admins can create users");
            }

            // Check if email already exists
            const existingUser = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), args.email))
                .first();

            if (existingUser) throw new ConvexError("Email already exists");

            // Create account
            const { email, password, imageStorageId, ...userData } = args;

            // @ts-expect-error - type error in convex auth
            const accountResponse = await createAccount(ctx, {
                provider: "password",
                account: {
                    id: email,
                    secret: password,
                },
                profile: {
                    email,
                    imageStorageId,
                    ...userData,
                },
            });

            if (!accountResponse?.user?._id) {
                throw new ConvexError("Failed to create account");
            }

            return accountResponse.user;
        } catch (error) {
            console.error("Error in createUser:", error);
            throw error;
        }
    },
});

export const createTeacher = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        middleName: v.optional(v.string()),
        employeeId: v.string(),
        contactNumber: v.string(),
        birthDate: v.string(),
        gender: v.string(),
        specialization: v.string(),
        yearsOfExperience: v.number(),
        // position: v.string(),
        // advisoryClass: v.optional(v.string()),
        region: v.optional(v.string()),
        province: v.optional(v.string()),
        city: v.optional(v.string()),
        barangay: v.optional(v.string()),
        street: v.optional(v.string()),
        imageStorageId: v.optional(v.string()),
        subjectId: v.optional(v.array(v.id('subjects'))),
    },
    handler: async (ctx, args) => {
        try {
            // Only admin can create teachers
            const adminId = await getAuthUserId(ctx);
            if (!adminId) throw new ConvexError("Not authenticated");

            const admin = await ctx.db.get(adminId);
            if (!admin || admin.role !== "admin") {
                throw new ConvexError("Unauthorized - Only admins can create teachers");
            }

            // Check if email already exists
            const existingUser = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), args.email))
                .first();

            if (existingUser) throw new ConvexError("Email already exists");

            // Create the teacher using createUser
            return createUser(ctx, {
                ...args,
                role: "teacher",
                isActive: true,
            });
        } catch (error) {
            console.error("Error in createTeacher:", error);
            throw error;
        }
    },
});

export const createStaff = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        firstName: v.string(),
        lastName: v.string(),
        middleName: v.optional(v.string()),
        contactNumber: v.string(),
        department: v.string(),
        birthDate: v.string(),
        gender: v.string(),
        description: v.optional(v.string()),
        region: v.optional(v.string()),
        province: v.optional(v.string()),
        city: v.optional(v.string()),
        barangay: v.optional(v.string()),
        street: v.optional(v.string()),
        imageStorageId: v.optional(v.string()),
        employeeId: v.optional(v.string()),
        yearsOfExperience: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        try {
            // Only admin can create staff
            const adminId = await getAuthUserId(ctx);
            if (!adminId) throw new ConvexError("Not authenticated");

            const admin = await ctx.db.get(adminId);
            if (!admin || admin.role !== "admin") {
                throw new ConvexError("Unauthorized - Only admins can create staff");
            }

            // Check if email already exists
            const existingUser = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), args.email))
                .first();

            if (existingUser) throw new ConvexError("Email already exists");

            // Create the staff using createUser
            return createUser(ctx, {
                ...args,
                role: "staff",
                isActive: true,
            });
        } catch (error) {
            console.error("Error in createStaff:", error);
            throw error;
        }
    },
});

export const current = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        return await ctx.db.get(userId);
    },
});

export const role = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        return user?.role;
    },
});

export const updateUser = mutation({
    args: {
        id: v.id("users"),
        email: v.string(),
        firstName: v.string(),
        middleName: v.optional(v.string()),
        lastName: v.string(),
        contactNumber: v.string(),
        department: v.optional(v.string()),
        specialization: v.optional(v.string()),
        yearsOfExperience: v.optional(v.number()),
        birthDate: v.string(),
        isActive: v.boolean(),
        region: v.optional(v.string()),
        province: v.optional(v.string()),
        city: v.optional(v.string()),
        barangay: v.optional(v.string()),
        street: v.optional(v.string()),
        houseNumber: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        imageStorageId: v.optional(v.string()),
        gender: v.optional(v.string()),
        description: v.optional(v.string()),
        schoolHeadType: v.optional(v.union(
            v.literal("junior-high"),
            v.literal("senior-high")
        )),
        employeeId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.get(args.id);
        if (!existingUser) {
            throw new Error("User not found");
        }

        // If there's a new image and an old one exists, you might want to delete the old one
        if (args.imageStorageId && existingUser.imageStorageId && args.imageStorageId !== existingUser.imageStorageId) {
            try {
                await ctx.storage.delete(existingUser.imageStorageId);
            } catch (error) {
                console.error("Failed to delete old image:", error);
                // Continue with update even if delete fails
            }
        }

        if (args.schoolHeadType && args.schoolHeadType !== existingUser.schoolHeadType) {
            const existingSchoolHead = await ctx.db
                .query("users")
                .filter((q) =>
                    q.and(
                        q.eq(q.field("role"), "school-head"),
                        q.eq(q.field("schoolHeadType"), args.schoolHeadType),
                        q.eq(q.field("isActive"), true),
                        q.neq(q.field("_id"), args.id)
                    )
                )
                .first();

            if (existingSchoolHead) {
                await ctx.db.patch(existingSchoolHead._id, { isActive: false });
            }
        }

        // Update user
        return await ctx.db.patch(args.id, {
            email: args.email,
            firstName: args.firstName,
            middleName: args.middleName,
            lastName: args.lastName,
            contactNumber: args.contactNumber,
            department: args.department,
            specialization: args.specialization,
            yearsOfExperience: args.yearsOfExperience,
            birthDate: args.birthDate,
            isActive: args.isActive,
            region: args.region,
            province: args.province,
            city: args.city,
            barangay: args.barangay,
            street: args.street,
            houseNumber: args.houseNumber,
            postalCode: args.postalCode,
            imageStorageId: args.imageStorageId,
            gender: args.gender,
            description: args.description,
            schoolHeadType: args.schoolHeadType,
        });
    },
});

export const getUser = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const deleteUserImage = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) {
            throw new Error("User not found");
        }

        if (user.imageStorageId) {
            try {
                await ctx.storage.delete(user.imageStorageId);
                await ctx.db.patch(args.userId, {
                    imageStorageId: undefined
                });
            } catch (error) {
                console.error("Failed to delete image:", error);
                throw new Error("Failed to delete image");
            }
        }

        return true;
    },
});

export const createSchoolHead = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        firstName: v.string(),
        middleName: v.optional(v.string()),
        lastName: v.string(),
        contactNumber: v.string(),
        birthDate: v.string(),
        gender: v.string(),
        description: v.optional(v.string()),
        region: v.optional(v.string()),
        province: v.optional(v.string()),
        city: v.optional(v.string()),
        barangay: v.optional(v.string()),
        street: v.optional(v.string()),
        houseNumber: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        imageStorageId: v.optional(v.string()),
        schoolHeadType: v.union(v.literal("junior-high"), v.literal("senior-high")),
    },
    handler: async (ctx, args) => {
        const { schoolHeadType, ...userData } = args;

        const existingSchoolHead = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.eq(q.field("role"), "school-head"),
                    q.eq(q.field("schoolHeadType"), schoolHeadType),
                    q.eq(q.field("isActive"), true)
                )
            )
            .first();

        if (existingSchoolHead) {
            await ctx.db.patch(existingSchoolHead._id, { isActive: false });
        }

        // Create the principal using createUser
        return createUser(ctx, {
            ...userData,
            role: "school-head",
            isActive: true,
            description: userData.description,
            schoolHeadType: schoolHeadType,
        });
    },
});

export const getTeachers = query({
    handler: async (ctx) => {
        const teachers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "teacher"))
            .order("desc")
            .collect();

        return teachers.map(teacher => ({
            id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            middleName: teacher.middleName,
            email: teacher.email,
            employeeId: teacher.employeeId || "",
            position: teacher.position || "",
            specialization: teacher.specialization || "",
            advisoryClass: teacher.advisoryClass,
            imageUrl: teacher.image,
            isActive: teacher.isActive,
            contactNumber: teacher.contactNumber,
            gender: teacher.gender,
            yearsOfExperience: teacher.yearsOfExperience,
        }));
    },
});

export const updateTeacher = mutation({
    args: {
        id: v.id("users"),
        email: v.string(),
        firstName: v.string(),
        middleName: v.optional(v.string()),
        lastName: v.string(),
        contactNumber: v.string(),
        employeeId: v.optional(v.string()),
        // position: v.optional(v.string()),
        specialization: v.optional(v.string()),
        yearsOfExperience: v.optional(v.number()),
        birthDate: v.string(),
        gender: v.optional(v.string()),
        region: v.optional(v.string()),
        province: v.optional(v.string()),
        city: v.optional(v.string()),
        barangay: v.optional(v.string()),
        street: v.optional(v.string()),
        // advisoryClass: v.optional(v.string()),
        // subjectId: v.optional(v.array(v.id('subjects'))),
        imageStorageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Only admin can update teachers
        const adminId = await getAuthUserId(ctx);
        if (!adminId) throw new ConvexError("Not authenticated");

        const admin = await ctx.db.get(adminId);
        if (!admin || admin.role !== "admin") {
            throw new ConvexError("Unauthorized - Only admins can update teachers");
        }

        const teacher = await ctx.db.get(args.id);
        if (!teacher) throw new ConvexError("Teacher not found");
        if (teacher.role !== "teacher") throw new ConvexError("User is not a teacher");

        return await ctx.db.patch(args.id, {
            email: args.email,
            firstName: args.firstName,
            middleName: args.middleName,
            lastName: args.lastName,
            contactNumber: args.contactNumber,
            employeeId: args.employeeId,
            // position: args.position,
            specialization: args.specialization,
            yearsOfExperience: args.yearsOfExperience,
            birthDate: args.birthDate,
            gender: args.gender,
            region: args.region,
            province: args.province,
            city: args.city,
            barangay: args.barangay,
            street: args.street,
            // advisoryClass: args.advisoryClass,
            // subjectId: args.subjectId,
            imageStorageId: args.imageStorageId,
        });
    },
});

export const getTeacher = query({
    args: { teacherId: v.id("users") },
    handler: async (ctx, args) => {
        const teacher = await ctx.db.get(args.teacherId);
        if (!teacher) throw new ConvexError("Teacher not found");
        if (teacher.role !== "teacher") throw new ConvexError("User is not a teacher");
        return teacher;
    },
});

export const teacher = query({
    handler: async (ctx) => {
        const teacherId = await getAuthUserId((ctx));
        if (!teacherId) throw new ConvexError("No teacher Id");
        const teacher = await ctx.db.get(teacherId)
        if (!teacher) throw new ConvexError("No teacher Found")
        if (teacher.role !== "teacher") throw new ConvexError("User is not a teacher");
        return teacher;
    },
});

export const getSubjects = query({
    args: {
        subjectIds: v.optional(v.array(v.id("subjects")))
    },
    handler: async (ctx, args) => {
        if (!args.subjectIds || args.subjectIds.length === 0) {
            return []
        }

        // @ts-expect-error this is correctly typed.
        const subjectQueries = args.subjectIds.map((id) => q.eq(q.field("_id")))

        return await ctx.db
            .query("subjects")
            .filter((q) => q.or(...subjectQueries))
            .collect()
    }
})

export const getSchoolHeads = query({
    args: {
        type: v.optional(v.union(
            v.literal("junior-high"),
            v.literal("senior-high")
        )),
    },
    handler: async (ctx, args) => {
        let query = ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "school-head"));

        if (args.type) {
            query = query.filter((q) => q.eq(q.field("schoolHeadType"), args.type));
        }

        return await query.collect();
    },
});

export const fetchRegistrars = query({
    handler: async (ctx) => {
        const registrars = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.eq(q.field("role"), "staff"),
                    q.eq(q.field("department"), "Registrar's Office")
                )
            )
            .collect();

        return registrars
    }
})

// Add this new query after your existing queries
export const list = query({
    args: {
        role: v.optional(UserRole),
        isActive: v.optional(v.boolean()),
        schoolHeadType: v.optional(v.union(
            v.literal("junior-high"),
            v.literal("senior-high")
        ))
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("users");

        // Filter by role if provided
        if (args.role) {
            query = query.filter(q =>
                q.eq(q.field("role"), args.role)
            );
        }

        // Filter by active status if provided
        if (args.isActive !== undefined) {
            query = query.filter(q =>
                q.eq(q.field("isActive"), args.isActive)
            );
        }

        // Filter by school head type if provided
        if (args.schoolHeadType) {
            query = query.filter(q =>
                q.eq(q.field("schoolHeadType"), args.schoolHeadType)
            );
        }

        const users = await query.collect();

        return users.map(user => ({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            email: user.email,
            role: user.role,
            isActive: user.isActive ?? false,
            schoolHeadType: user.schoolHeadType,
            department: user.department,
            imageStorageId: user.imageStorageId
        }));
    }
});

export const getCounts = query({
    handler: async (ctx) => {
        // Get total registrars
        const registrars = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.eq(q.field("role"), "staff"),
                    q.eq(q.field("department"), "Registrar's Office"),
                    q.eq(q.field("isActive"), true)
                )
            )
            .collect();

        // Get total teachers
        const teachers = await ctx.db
            .query("users")
            .filter((q) =>
                q.and(
                    q.eq(q.field("role"), "teacher"),
                    q.eq(q.field("isActive"), true)
                )
            )
            .collect();

        // Get total students
        const students = await ctx.db
            .query("students")
            .filter(q =>
                q.eq(q.field("enrollmentStatus"), "Enrolled")
            )
            .collect();

        return {
            totalRegistrars: registrars.length,
            totalTeachers: teachers.length,
            totalStudents: students.length
        };
    }
});
