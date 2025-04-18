import { query } from "./_generated/server";

export const get = query({
    handler: async(ctx) =>{
        const interventions = await ctx.db.query('interventions').collect()
        return interventions
    }
})