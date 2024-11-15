import { db } from "@/db";
import { FREE_QUOTA, PRO_QUOTA } from "@/lib/config";
import { DiscordClient } from "@/lib/discord-client";
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const REQUEST_VALIDATOR = z
  .object({
    category: CATEGORY_NAME_VALIDATOR,
    fields: z.record(z.string().or(z.number()).or(z.boolean())).optional(),
    description: z.string().optional(),
  })
  .strict();

export const POST = async (req: NextRequest) => {
  try {
    // Get api key from request header
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Invalid auth header format. Expected: 'Bearer <API_KEY>'" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.split(" ")[1]; // bearer <API_KEY>

    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 });
    }

    // Find user in the db through validate api key
    const user = await db.user.findUnique({
      where: { apiKey },
      include: { eventCategories: true },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 });
    }

    if (!user.discordId) {
      return NextResponse.json(
        { message: "Please enter your discord ID in your account settings" },
        { status: 403 }
      );
    }

    // quota / request per month validation
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const quota = await db.quota.findUnique({
      where: { userId: user.id, month: currentMonth, year: currentYear },
    });

    const quotaLimit =
      user.plan === "FREE"
        ? FREE_QUOTA.maxEventsPerMonth
        : PRO_QUOTA.maxEventsPerMonth;

    if (quota && quota.count >= quotaLimit) {
      return NextResponse.json(
        {
          message:
            "Monthly quota limit reached. Please upgrade your plan for more events.",
        },
        { status: 429 }
      );
    }

    // Discord integration
    const discord = new DiscordClient(process.env.DISCORD_BOT_TOKEN);

    const dmChannel = await discord.createDM(user.discordId);

    // handle response data
    let requestData: unknown;
    try {
      requestData = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validationResult = REQUEST_VALIDATOR.parse(requestData);

    const category = user.eventCategories.find(
      (category) => category.name === validationResult.category
    );

    if (!category) {
      return NextResponse.json(
        {
          message: `You don't have a category named ${validationResult.category}`,
        },
        { status: 404 }
      );
    }

    // handle event data
    const eventData = {
      title: `${category.emoji || "🔔"} ${
        category.name.charAt(0).toUpperCase() + category.name.slice(1)
      }`,
      description:
        validationResult.description ||
        `A new ${category.name} event has occured!`,
      color: category.color,
      timeStamp: new Date().toISOString(),
      fields: Object.entries(validationResult.fields || {}).map(
        ([key, value]) => {
          return {
            name: key,
            value: String(value),
            inline: true,
          };
        }
      ),
    };

    // create event in db
    const event = await db.event.create({
      data: {
        name: category.name,
        formattedMessage: `${eventData.title}\n\n${eventData.description}`,
        userId: user.id,
        fields: validationResult.fields || {},
        eventCategoryId: category.id,
      },
    });

    // send event to discord
    try {
      await discord.sendEmbed(dmChannel.id, eventData);
      // update event delivery status after sending it to discord
      await db.event.update({
        where: { id: event.id },
        data: {
          deliveryStatus: "DELIVERED",
        },
      });

      // update quota for user
      await db.quota.upsert({
        where: { userId: user.id, month: currentMonth, year: currentYear },
        update: {
          count: {
            increment: 1,
          },
        },
        create: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
          count: 1,
        },
      });
    } catch (error) {
      // update event delivery status if there is an error
      await db.event.update({
        where: { id: event.id },
        data: {
          deliveryStatus: "FAILED",
        },
      });
      console.log(error);
      return NextResponse.json(
        { message: "Failed to send event to Discord", eventId: event.id },
        { status: 500 }
      );
    }

    // if everything is good, send a success response
    return NextResponse.json(
      { message: "Event processed successfully", eventId: event.id },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
