"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames();
  const mergedClassNames = {
    ...defaultClassNames,
    root: cn("w-fit", defaultClassNames.root),
    months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
    month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
    nav: cn("flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between", defaultClassNames.nav),
    button_previous: cn(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none", defaultClassNames.button_previous),
    button_next: cn(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none", defaultClassNames.button_next),
    month_caption: cn("flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)", defaultClassNames.month_caption),
    dropdowns: cn("w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5", defaultClassNames.dropdowns),
    dropdown_root: cn("relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md", defaultClassNames.dropdown_root),
    dropdown: cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown),
    caption_label: cn("select-none font-medium", defaultClassNames.caption_label),
    day: cn("rounded-full transition-all duration-200 hover:bg-gradient-to-r hover:from-chart-2 hover:to-chart-4 hover:text-primary focus:bg-gradient-to-r focus:from-chart-1 focus:to-chart-3 focus:text-primary", defaultClassNames.day),
    selected: cn("bg-gradient-to-r from-chart-1 to-chart-4 text-primary-foreground shadow-lg", defaultClassNames.selected),
    today: cn("bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none", defaultClassNames.today),
    outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
    disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
    hidden: cn("invisible", defaultClassNames.hidden),
    ...(classNames || {})
  };
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-gradient-to-br from-popover via-chart-1 to-chart-2 rounded-2xl shadow-2xl group/calendar p-4 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent transition-all duration-300",
        String.raw`rtl:**:[.rdp-button_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date: Date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={mergedClassNames}
      components={{
        Root: ({ className, rootRef, ...props }: { className?: string; rootRef?: React.Ref<HTMLDivElement>; [key: string]: any }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }: { className?: string; orientation?: "left" | "right" | "down"; [key: string]: any }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            );
          }
          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
