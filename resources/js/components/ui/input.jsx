import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { AlertCircleIcon } from "hugeicons-react";

function Input({
  className,
  type,
  ...props
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    (
    <div className="relative">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:focus-visible:ring-ring/70 aria-invalid:ring-destructive/50 aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:placeholder:text-destructive aria-invalid:border-2 dark:aria-invalid:ring-destructive/50",
            "file:text-primary file:bg-primary/10 hover:file:bg-primary/20 aria-invalid:file:bg-destructive/10 hover:aria-invalid:file:bg-destructive/20 aria-invalid:file:text-destructive file:mr-2 file:-ml-2 file:items-center file:rounded-md file:border-0 file:px-4 file:py-0 file:text-sm file:font-semibold",
            type === 'password' && 'pr-10',
            className
          )}
          {...props} />
          {type === 'password' && (
              <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800 focus:outline-none">
                    {showPassword ? <EyeOff strokeWidth="2" className={cn('w-4 h-4', props['aria-invalid'] && 'text-destructive')} /> : <Eye strokeWidth="2" className={cn('w-4 h-4', props['aria-invalid'] && 'text-destructive')} />}
                </button>
          )}
          {props['aria-invalid'] && type !== 'password' && (
              <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800 focus:outline-none">
                  <AlertCircleIcon strokeWidth="2" className={cn('w-4 h-4', props['aria-invalid'] && 'text-destructive')} />
              </button>
          )}
    </div>)
  );
}

export { Input }
