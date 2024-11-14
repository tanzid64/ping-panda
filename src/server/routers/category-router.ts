import { startOfMonth } from "date-fns";
import { router } from "../__internals/router";
import { privateProcedure } from "../procedures";

export const categoryRouter = router({
  getEventCategories: privateProcedure.query(async ({ c, ctx }) => {
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);

    const categories = await ctx.db.eventCategory.findMany({
      where: { userId: ctx.user.id },
      select: {
        id: true,
        name: true,
        emoji: true,
        color: true,
        updatedAt: true,
        createdAt: true,
        // Get each categoriy's events for current month
        events: {
          where: {
            createdAt: { gte: firstDayOfMonth },
          },
          select: {
            fields: true,
            createdAt: true,
          },
        },
        // Get count of each category events for current month
        _count: {
          select: {
            events: {
              where: {
                createdAt: { gte: firstDayOfMonth },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Post-processing -> to get unique field count of each category, and the most recent event
    const categoriesWithCounts = categories.map((category) => {
      const uniqueFieldNames = new Set<string>();
      let lastPing: Date | null = null;

      category.events.forEach((event) => {
        Object.keys(event.fields as object).forEach((fieldName) => {
          uniqueFieldNames.add(fieldName);
        });

        if (!lastPing || event.createdAt > lastPing) {
          lastPing = event.createdAt;
        }
      });

      return {
        id: category.id,
        name: category.name,
        emoji: category.emoji,
        color: category.color,
        updatedAt: category.updatedAt,
        createdAt: category.createdAt,
        uniqueFieldCount: uniqueFieldNames.size,
        eventsCount: category._count.events,
        lastPing,
      };
    });

    // super json can handle dates but json can't -> more in superjson documentation
    return c.superjson({ categories: categoriesWithCounts });
  }),
});
