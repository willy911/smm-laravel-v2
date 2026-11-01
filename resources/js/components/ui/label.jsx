"use client"

import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

function Label({
  className,
  isRequired = false,
  tooltip = '',
  children,
  ...props
}) {
  return (
    (<LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        isRequired ? 'gap-1' : 'gap-2',
        className
      )}
      {...props}>
        {children}
        {tooltip && <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <tooltip.icon className="size-3.5 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent align="start">
                    <p>{tooltip.content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>}
        {isRequired && <span className="text-destructive">*</span>}
      </LabelPrimitive.Root>)
  );
}

export { Label }
