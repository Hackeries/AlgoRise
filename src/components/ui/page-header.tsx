"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  noBorder?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  noBorder,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8",
        noBorder ? undefined : "border-b border-border pb-6",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground mt-2 text-base leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
