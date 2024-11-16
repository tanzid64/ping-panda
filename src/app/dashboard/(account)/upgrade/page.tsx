import { DashboardPageComponent } from "@/components/dashboard/dashboard-page";
import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FC } from "react";
import { UpgradePageContent } from "../../_components/upgrade-page-content";

const UpgradePage: FC = async () => {
  const auth = await currentUser();
  if (!auth) redirect("/sign-in");
  const user = await db.user.findUnique({
    where: {
      clerkId: auth.id,
    },
  });
  if (!user) redirect("/sign-in");
  return (
    <DashboardPageComponent title="Pro Membership">
      <UpgradePageContent plan={user.plan} />
    </DashboardPageComponent>
  );
};

export default UpgradePage;
