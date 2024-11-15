import { parseColor } from "@/lib/utils";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
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

  deleteCategory: privateProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ c, ctx, input }) => {
      const { name } = input;

      await ctx.db.eventCategory.delete({
        where: { name_userId: { name, userId: ctx.user.id } },
      });
      return c.json({ success: true });
    }),

  createEventCategory: privateProcedure
    .input(
      z.object({
        name: CATEGORY_NAME_VALIDATOR,
        color: z
          .string()
          .min(1, "Color is required")
          .regex(/^#[0-9A-F]{6}$/i, "Invalid color format."),
        emoji: z.string().emoji("Invalid emoji").optional(),
      })
    )
    .mutation(async ({ c, ctx, input }) => {
      const { user } = ctx;
      const { color, name, emoji } = input;

      // TODO: ADD PAID PLAN LOGIC

      const eventCategory = await ctx.db.eventCategory.create({
        data: {
          name: name.toLowerCase(),
          color: parseColor(color),
          emoji,
          userId: user.id,
        },
      });

      return c.json({ eventCategory });
    }),

  insertQuickStartCategories: privateProcedure.mutation(async ({ c, ctx }) => {
    const categories = await ctx.db.eventCategory.createMany({
      data: [
        {
          name: "bug",
          emoji: "🐞",
          color: 0xff6b6b,
        },
        {
          name: "sale",
          emoji: "💰",
          color: 0xffeb3b,
        },
        {
          name: "question",
          emoji: "🤔",
          color: 0x6c5ce7,
        },
      ].map((category) => ({
        ...category,
        userId: ctx.user.id,
      })),
    });

    return c.json({ success: true, count: categories.count });
  }),

  pollCategory: privateProcedure
    .input(z.object({ name: CATEGORY_NAME_VALIDATOR }))
    .query(async ({ c, ctx, input }) => {
      const { name } = input;

      const category = await ctx.db.eventCategory.findUnique({
        where: { name_userId: { name, userId: ctx.user.id } },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      });
      if (!category)
        throw new HTTPException(404, { message: "Category not found" });

      const hasEvents = category._count.events > 0;
      return c.json({ hasEvents });
    }),

  getEventsByCategoryName: privateProcedure
    .input(
      z.object({
        name: CATEGORY_NAME_VALIDATOR,
        page: z.number(),
        limit: z.number().max(50),
        timeRange: z.enum(["today", "week", "month"]),
      })
    )
    .query(async ({ c, ctx, input }) => {
      const { name, page, limit, timeRange } = input;

      // convert timeRange to date range
      const now = new Date();
      let startDate: Date;
      switch (timeRange) {
        case "today":
          startDate = startOfDay(now);
          break;
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 0 });
          break;
        case "month":
          startDate = startOfMonth(now);
          break;
      }

      // get events and event count, and unique field count from db
      const [events, eventsCount, uniqueFieldCount] = await Promise.all([
        // All the events for the category
        ctx.db.event.findMany({
          where: {
            eventCategory: {
              name,
              userId: ctx.user.id,
            },
            createdAt: { gte: startDate },
          },

          // Pagination
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),

        // event count
        ctx.db.event.count({
          where: {
            eventCategory: {
              name,
              userId: ctx.user.id,
            },
            createdAt: { gte: startDate },
          },
        }),

        // Unique Fields
        ctx.db.event
          .findMany({
            where: {
              eventCategory: {
                name,
                userId: ctx.user.id,
              },
              createdAt: { gte: startDate },
            },
            select: { fields: true },
            distinct: ["fields"],
          })
          .then((events) => {
            const fieldNames = new Set<string>();
            events.forEach((event) => {
              Object.keys(event.fields as object).forEach((fieldName) => {
                fieldNames.add(fieldName);
              });
            });
            return fieldNames.size;
          }),
      ]);

      // Return Response
      return c.superjson({
        events,
        eventsCount,
        uniqueFieldCount,
      });
    }),
});
