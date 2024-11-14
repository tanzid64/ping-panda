import { cn } from "@/utils";
import { FC, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  contentClassName?: string;
}

export const Card: FC<CardProps> = ({
  className,
  contentClassName,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg bg-gray-50 text-card-foreground",
        className
      )}
      {...props}
    >
      <div className={cn("relative z-10 p-6", contentClassName)}>
        {children}
      </div>
      <div className="absolute inset-0 rounded-lg bg-white" />
      <div className="pointer-events-none absolute z-0 inset-px rounded-lg shadow-sm ring-1 ring-black/5" />
    </div>
  );
};
