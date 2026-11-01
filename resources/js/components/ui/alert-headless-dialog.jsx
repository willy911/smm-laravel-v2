"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const HeadlessAlertDialog = ({ isOpen, onClose, children }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {children}
      </Dialog>
    </Transition>
  );
};

const HeadlessAlertDialogOverlay = ({ className }) => (
  <TransitionChild
    as={Fragment}
    enter="ease-out duration-200"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="ease-in duration-200"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    <div
      className={cn("fixed inset-0 bg-black/50", className)}
      data-slot="alert-dialog-overlay"
    />
  </TransitionChild>
);

const HeadlessAlertDialogContent = ({ children, className, showClose = true, onClose }) => (
  <div className="fixed inset-0 z-10 overflow-y-auto">
    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <TransitionChild
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <DialogPanel
          className={cn(
            "border-border/25 bg-secondary relative w-full translate-y-0 transform overflow-hidden rounded-2xl border text-left shadow-xl transition-all sm:my-8 sm:max-w-3xl",
            className
          )}
          data-slot="alert-dialog-content"
        >
          {showClose && (
            <div className="absolute top-0 right-0 z-40 block pt-4 pr-4">
              <button
                type="button"
                onClick={onClose}
                className="ring-offset-background focus:ring-ring absolute top-4 right-4 cursor-pointer rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-6 w-6" />
              </button>
            </div>
          )}
          <div className="w-full p-6">{children}</div>
        </DialogPanel>
      </TransitionChild>
    </div>
  </div>
);

const HeadlessAlertDialogHeader = ({ children, className }) => (
  <div className={cn("mb-2", className)} data-slot="alert-dialog-header">
    {children}
  </div>
);

const HeadlessAlertDialogFooter = ({ children, className }) => (
  <div
    className={cn(
      "dark:from-muted dark:to-muted/50 mt-4 flex w-full items-center justify-end gap-1 rounded-b-xl bg-gradient-to-b from-gray-200 to-gray-200/40 p-2 px-4",
      className
    )}
    data-slot="alert-dialog-footer"
  >
    {children}
  </div>
);

const HeadlessAlertDialogTitle = ({ children, className }) => (
  <DialogTitle className={cn("text-lg font-semibold text-primary", className)}>
    {children}
  </DialogTitle>
);

const HeadlessAlertDialogDescription = ({ children, className }) => (
  <DialogDescription className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </DialogDescription>
);

// Optional trigger component (if needed)
const HeadlessAlertDialogTrigger = ({ as: Component = "button", ...props }) => (
  <Component data-slot="alert-dialog-trigger" {...props} />
);

export {
  HeadlessAlertDialog,
  HeadlessAlertDialogOverlay,
  HeadlessAlertDialogContent,
  HeadlessAlertDialogHeader,
  HeadlessAlertDialogFooter,
  HeadlessAlertDialogTitle,
  HeadlessAlertDialogDescription,
  HeadlessAlertDialogTrigger,
};
