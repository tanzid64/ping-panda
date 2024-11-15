import { DashboardPageComponent } from "@/components/dashboard/dashboard-page";
import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { FC } from "react";
import { CategoryPageContent } from "../../_components/category-page-content";

interface CategoryPageProps {
  params: {
    name: string | string[] | undefined;
  };
}

const CategoryPage: FC<CategoryPageProps> = async ({ params }) => {
  if (typeof params.name !== "string") return notFound();
  const auth = await currentUser();
  if (!auth) return notFound();

  const user = await db.user.findUnique({
    where: {
      clerkId: auth.id,
    },
  });

  if (!user) return notFound();

  const category = await db.eventCategory.findUnique({
    where: {
      name_userId: {
        name: params.name,
        userId: user.id,
      },
    },
    include: {
      _count: {
        select: {
          events: true,
        },
      },
    },
  });

  if (!category) return notFound();

  const hasEvents = category._count.events > 0;
  return (
    <>
      <DashboardPageComponent
        title={`${category.emoji} ${category.name} events`}
      >
        <CategoryPageContent hasEvents={hasEvents} category={category}/>
      </DashboardPageComponent>
    </>
  );
};

export default CategoryPage;
