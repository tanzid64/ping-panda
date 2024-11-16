import { CreateEventCategoryModal } from "@/components/dashboard/create-event-category-modal";
import { DashboardPageComponent } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { createCheckoutSession } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { FC } from "react";
import { DashboardPageContent } from "./_components/dashboard-page-content";
import { PaymentSuccessModal } from "@/components/global/payment-success-modal";

interface DashboardPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const DashboardPage: FC<DashboardPageProps> = async ({ searchParams }) => {
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

  const intent = searchParams.intent;
  if (intent === "upgrade") {
    const session = await createCheckoutSession({
      userEmail: user.email,
      userId: user.id,
    });
    if (session.url) redirect(session.url);
  }

  const success = searchParams.success;
  return (
    <>
      {success && <PaymentSuccessModal />}
      <DashboardPageComponent
        title="Dashboard"
        cta={
          <CreateEventCategoryModal>
            <Button className="w-full sm:w-fit">
              <PlusIcon className="size-4 mr-2" /> Add Category
            </Button>
          </CreateEventCategoryModal>
        }
      >
        <DashboardPageContent />
      </DashboardPageComponent>
    </>
  );
};

export default DashboardPage;
