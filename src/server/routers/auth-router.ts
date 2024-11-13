import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { router } from "../__internals/router";
import { publicProcedure } from "../procedures";

export const authRouter = router({
  getDatabaseSyncStatus: publicProcedure.query(async ({ c }) => {
    const auth = await currentUser(); // get user data from clerk
    if (!auth)
      return c.json({
        status: "error",
        message: "Not authenticated",
        isSynced: false,
      });
    // Find user in database
    const user = await db.user.findUnique({
      where: {
        clerkId: auth.id,
      },
    });

    // If user doesn't exist, create it
    if (!user) {
      await db.user.create({
        data: {
          clerkId: auth.id, // assign clerk id
          quotaLimit: 100,
          email: auth.emailAddresses[0].emailAddress, // assign email address provided by clerk
        },
      });
      return c.json({
        status: "ok",
        message: "User created",
        isSynced: true,
      });
    }
    return c.json({ status: "ok", message: "User found", isSynced: true });
  }),
});
