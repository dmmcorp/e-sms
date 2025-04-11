import { v } from "convex/values";
import { query } from "./_generated/server";

export const getScores = query({
    args:{
        loadId: v.id('teachingLoad')
    },
    handler: async(ctx, args) =>{
        const scores = await ctx.db.query('highestScores')
        .filter(q => q.eq(q.field('teachingLoadId'), args.loadId))
        .collect()

        return scores
    }
})