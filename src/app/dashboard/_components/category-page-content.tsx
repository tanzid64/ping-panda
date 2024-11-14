"use client";
import { EventCategory } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { EmptyCategoryState } from "./empty-category-state";

interface CategoryPageContentProps {
  hasEvents: boolean;
  category: EventCategory;
}

export const CategoryPageContent: FC<CategoryPageContentProps> = ({
  hasEvents: initialHasEvents,
  category,
}) => {
  const { data: pollingData } = useQuery({
    queryKey: ["category", category.name, "hasEvents"],
    initialData: {
      hasEvents: initialHasEvents,
    },
  });

  if (!pollingData.hasEvents) {
    return <EmptyCategoryState categoryName={category.name} />;
  }
  return <div className="">CategoryPageContent</div>;
};
