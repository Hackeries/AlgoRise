"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ContainerSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";

const sizeClassName: Record<ContainerSize, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  "3xl": "max-w-3xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  size?: ContainerSize;
  padding?: boolean; // controls horizontal padding
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      as: Comp = "div",
      size = "7xl",
      padding = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const maxWidthClass = sizeClassName[size] ?? sizeClassName["7xl"];
    const paddingClass = padding ? "px-4 sm:px-6 lg:px-8" : "px-0";

    return (
      <Comp
        ref={ref as any}
        className={cn("mx-auto w-full", maxWidthClass, paddingClass, className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Container.displayName = "Container";
