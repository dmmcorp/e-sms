import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";


export const getSubjects = query({
    handler: async(ctx) =>{
        
        const teacherId = await getAuthUserId(ctx);
        const subjectThought = await ctx.db.query("subjectThought").filter(q => q.eq(q.field('teacherId'), teacherId)).collect();


        return subjectThought
    }
})