"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({
  ...props
}) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}) {
  return (<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />);
}

function AlertDialogPortal({
  ...props
}) {
  return (<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />);
}

function AlertDialogOverlay({
  className,
  isBlur = false,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "overflow-y-auto",
        "py-10",
        isBlur && "backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  isBlur = false,
  ...props
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay isBlur={isBlur}>
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          className={cn(
            "relative z-50",
            "mx-auto w-full max-w-[calc(100%-2rem)] sm:max-w-lg",
            "rounded-lg border bg-background p-6 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-200",
            className
          )}
          {...props}
        />
      </AlertDialogOverlay>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props} />)
  );
}

function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props} />)
  );
}

function AlertDialogTitle({
  className,
  ...props
}) {
  return (
    (<AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props} />)
  );
}

function AlertDialogDescription({
  className,
  ...props
}) {
  return (
    (<AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />)
  );
}

function AlertDialogAction({
  className,
  ...props
}) {
  return (<AlertDialogPrimitive.Action className={cn('cursor-pointer', buttonVariants(), className)} {...props} />);
}

function AlertDialogCancel({
  className,
  ...props
}) {
  return (
    (<AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props} />)
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
