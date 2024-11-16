import { DashboardPageComponent } from "@/components/dashboard/dashboard-page";
import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FC } from "react";
import { APIKeyContent } from "../../_components/api-key-content";

const APIKeyPage: FC = async () => {
  const auth = await currentUser();

  if (!auth) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: auth.id },
  });

  if (!user) {
    redirect("/sign-in");
  }
  return <DashboardPageComponent title="API Key">
    <APIKeyContent apiKey={user.apiKey ?? ""} />
  </DashboardPageComponent>;
};

export default APIKeyPage;
