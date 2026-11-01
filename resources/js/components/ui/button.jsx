import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b dark:bg-gradient-to-t from-primary/75 dark:from-primary/50 to-primary text-primary-foreground shadow-md hover:from-primary hover:to-primary/90 dark:hover:to-primary/70",
        warning: "bg-gradient-to-b dark:bg-gradient-to-t from-amber-500/75 dark:from-amber-500/50 to-amber-600 text-primary-foreground shadow-md hover:from-amber-500 hover:to-amber-800/90 dark:hover:to-amber-500/40",
        info: "bg-gradient-to-b dark:bg-gradient-to-t from-blue-400/75 dark:from-blue-400/50 to-blue-500 text-primary-foreground shadow-md hover:from-blue-400 hover:to-blue-600 dark:hover:to-blue-500/40",
        success:
            "bg-gradient-to-b dark:bg-gradient-to-t from-green-500/75 dark:from-green-500/50 to-green-600 text-primary-foreground shadow-md hover:from-green-500 hover:to-green-800/90 dark:hover:to-green-500/40",
        destructive:
          "bg-gradient-to-b dark:bg-gradient-to-t from-destructive/75 dark:from-destructive/50 to-destructive text-white shadow-md hover:from-destructive hover:to-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/75",
        secondary:
          "bg-gradient-to-b dark:bg-gradient-to-t from-secondary/75 dark:from-secondary/50 to-secondary text-secondary-foreground shadow-md hover:from-secondary hover:to-secondary/90",
        ghost:
          "hover:bg-accent/75 hover:text-accent-foreground dark:hover:bg-accent/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({ className, variant, size, type = 'button', asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp data-slot="button" type={type} className={cn(buttonVariants({ variant, size, className }), ['submit', 'button'].includes(type) && 'cursor-pointer')} {...props} />;
}

export { Button, buttonVariants };
