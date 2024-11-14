"use client";
import { Heading } from "@/components/global/heading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FC, ReactNode } from "react";

interface DashboardPageComponentProps {
  title: string;
  children?: ReactNode;
  hideBackButton?: boolean;
  cta?: ReactNode;
}

export const DashboardPageComponent: FC<DashboardPageComponentProps> = ({
  title,
  children,
  cta,
  hideBackButton,
}) => {
  return (
    <section className="flex-1 h-full w-full flex flex-col">
      <div className="p-6 sm:p-8 flex justify-between border-b border-gray-200">
        <div className="flex flex-row sm:items-center gap-y-2 gap-x-6">
          {/* Back Button */}
          {hideBackButton ? null : (
            <Button className="w-fit bg-white" variant={"outline"}>
              <ArrowLeft className="size-4" />
            </Button>
          )}

          <Heading>{title}</Heading>

          {cta ? <div>{cta}</div> : null}
        </div>
      </div>
      
      <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto">
        {children}
      </div>
    </section>
  );
};
