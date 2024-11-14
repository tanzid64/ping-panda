import { CreateEventCategoryModal } from "@/components/dashboard/create-event-category-modal";
import { DashboardPageComponent } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { FC } from "react";
import { DashboardPageContent } from "./_components/dashboard-page-content";

const DashboardPage: FC = async () => {
  // Get auth user from clerk
  const auth = await currentUser();
  if (!auth) redirect("/sign-in");
  // Get user from db through clerk id
  const user = await db.user.findUnique({
    where: {
      clerkId: auth.id,
    },
  });
  if (!user) redirect("/sign-in");
  return (
    <DashboardPageComponent
      title="Dashboard"
      cta={
        <CreateEventCategoryModal>
          <Button>
            <PlusIcon className="size-4 mr-2" /> Add Category
          </Button>
        </CreateEventCategoryModal>
      }
    >
      <DashboardPageContent />
    </DashboardPageComponent>
  );
};

export default DashboardPage;
