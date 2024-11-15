import { parseColor } from "@/lib/utils";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { startOfMonth } from "date-fns";
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
});
