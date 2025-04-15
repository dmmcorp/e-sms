import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";


export const getSubjects = query({
    handler: async(ctx) =>{
        
        const teacherId = await getAuthUserId(ctx);
        const subjectTaught = await ctx.db.query("subjectTaught").filter(q => q.eq(q.field('teacherId'), teacherId)).collect();


        return subjectTaught
    }
})