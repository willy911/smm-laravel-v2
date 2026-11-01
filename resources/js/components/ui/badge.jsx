import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b dark:bg-gradient-to-t from-primary/75 dark:from-primary/50 to-primary text-primary-foreground hover:from-primary hover:to-primary/90 dark:hover:to-primary/70 [a&]:hover:bg-primary/90",
        indigo:
          "bg-gradient-to-b dark:bg-gradient-to-t from-indigo-500/75 dark:from-indigo-500/50 to-indigo-600 text-primary-foreground hover:from-indigo-500 hover:to-indigo-800/90 dark:hover:to-indigo-500/40",
        amber:
          "bg-gradient-to-b dark:bg-gradient-to-t from-amber-500/75 dark:from-amber-500/50 to-amber-600 text-primary-foreground hover:from-amber-500 hover:to-amber-800/90 dark:hover:to-amber-500/40",
        green:
          "bg-gradient-to-b dark:bg-gradient-to-t from-green-500/75 dark:from-green-500/50 to-green-600 text-primary-foreground hover:from-green-500 hover:to-green-800/90 dark:hover:to-green-500/40",
        blue:
          "bg-gradient-to-b dark:bg-gradient-to-t from-blue-500/75 dark:from-blue-500/50 to-blue-600 text-primary-foreground hover:from-blue-500 hover:to-blue-800/90 dark:hover:to-blue-500/40",
        red:
          "bg-gradient-to-b dark:bg-gradient-to-t from-red-500/75 dark:from-red-500/50 to-red-600 text-primary-foreground hover:from-red-500 hover:to-red-800/90 dark:hover:to-red-500/40",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    (<Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />)
  );
}

export { Badge, badgeVariants }
