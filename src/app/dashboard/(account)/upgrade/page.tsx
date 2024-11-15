import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FC } from "react";
import DashboardPage from "../../page";
import { DashboardPageComponent } from "@/components/dashboard/dashboard-page";

const UpgradePage: FC = async () => {
  const auth = await currentUser();
  if (!auth) redirect("/sign-in");
  const user = await db.user.findUnique({
    where: {
      clerkId: auth.id,
    },
  });
  if (!user) redirect("/sign-in");
  return <DashboardPageComponent title="Pro Membership" />;
};

export default UpgradePage;
