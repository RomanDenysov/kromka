"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DialogLegacyDismissHandlers = {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: Event) => void;
};

const DialogLegacyDismissContext = createContext<{
  setHandlers: (handlers: DialogLegacyDismissHandlers) => void;
} | null>(null);

function Dialog({
  onOpenChange,
  ...props
}: ComponentProps<typeof DialogPrimitive.Root>) {
  const legacyHandlersRef = useRef<DialogLegacyDismissHandlers>({});

  const handleOpenChange = useCallback(
    (
      open: boolean,
      eventDetails: DialogPrimitive.Root.ChangeEventDetails
    ) => {
      if (!open) {
        if (
          eventDetails.reason === "escape-key" &&
          legacyHandlersRef.current.onEscapeKeyDown
        ) {
          const event = eventDetails.event;
          legacyHandlersRef.current.onEscapeKeyDown(event);
          if (event.defaultPrevented) {
            eventDetails.cancel();
            return;
          }
        }

        if (
          eventDetails.reason === "outside-press" &&
          legacyHandlersRef.current.onInteractOutside
        ) {
          const event = eventDetails.event;
          legacyHandlersRef.current.onInteractOutside(event);
          if (event.defaultPrevented) {
            eventDetails.cancel();
            return;
          }
        }
      }

      onOpenChange?.(open, eventDetails);
    },
    [onOpenChange]
  );

  return (
    <DialogLegacyDismissContext.Provider
      value={{
        setHandlers: (handlers) => {
          legacyHandlersRef.current = handlers;
        },
      }}
    >
      <DialogPrimitive.Root
        data-slot="dialog"
        onOpenChange={handleOpenChange}
        {...props}
      />
    </DialogLegacyDismissContext.Provider>
  );
}

function DialogTrigger({
  render,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      render={render}
      {...props}
    >
      {children}
    </DialogPrimitive.Trigger>
  );
}

function DialogPortal({
  ...props
}: ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  render,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      render={render}
      {...props}
    >
      {children}
    </DialogPrimitive.Close>
  );
}

function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/50 data-closed:animate-out data-open:animate-in",
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onEscapeKeyDown,
  onInteractOutside,
  ...props
}: ComponentProps<typeof DialogPrimitive.Popup> & {
  showCloseButton?: boolean;
  /** @deprecated Prefer `onOpenChange` on `Dialog` with `eventDetails.cancel()` */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** @deprecated Prefer `onOpenChange` on `Dialog` with `eventDetails.cancel()` */
  onInteractOutside?: (event: Event) => void;
}) {
  const legacyDismiss = useContext(DialogLegacyDismissContext);

  useEffect(() => {
    legacyDismiss?.setHandlers({ onEscapeKeyDown, onInteractOutside });
    return () => {
      legacyDismiss?.setHandlers({});
    };
  }, [legacyDismiss, onEscapeKeyDown, onInteractOutside]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        className={cn(
          "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-closed:animate-out data-open:animate-in sm:max-w-lg",
          className
        )}
        data-slot="dialog-content"
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                className="absolute top-4 right-4"
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="dialog-footer"
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-semibold text-lg leading-none", className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
