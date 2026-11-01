import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  variant = '',
  ...props
}) {
  return (
    (<ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        variant === 'info' ? 'bg-blue-400/20' : 'bg-primary/20',
        "relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          variant === 'info' ? 'bg-gradient-to-b dark:bg-gradient-to-t from-blue-400/75 dark:from-blue-400/50 to-blue-500 text-primary-foreground shadow-md hover:from-blue-400 hover:to-blue-600 dark:hover:to-blue-500/40 h-full w-full flex-1 transition-all' : "bg-primary h-full w-full flex-1 transition-all"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
    </ProgressPrimitive.Root>)
  );
}

export { Progress }
