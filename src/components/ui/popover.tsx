import * as React from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({
                                           open,
                                           onOpenChange,
                                           children
                                         }) => {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const triggerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <PopoverContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange, triggerRef }}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  );
};

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined);

const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover");
  }
  return context;
};

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
}

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({
                                                         asChild = false,
                                                         children
                                                       }) => {
  const { open, onOpenChange, triggerRef } = usePopoverContext();
  const handleClick = () => onOpenChange(!open);

  const child = React.Children.only(children) as React.ReactElement;
  const props = {
    ref: triggerRef,
    onClick: handleClick,
    "aria-expanded": open,
    ...child.props,
  };

  return asChild ? React.cloneElement(child, props) : (
    <button {...props}>{child}</button>
  );
};

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  children: React.ReactNode;
}

const PopoverContent: React.FC<PopoverContentProps> = ({
                                                         className,
                                                         align = "center",
                                                         side = "bottom",
                                                         sideOffset = 4,
                                                         alignOffset = 0,
                                                         children,
                                                         ...props
                                                       }) => {
  const { open, triggerRef } = usePopoverContext();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [stylePos, setStylePos] = React.useState<React.CSSProperties>({ visibility: "hidden" });

  React.useLayoutEffect(() => {
    if (open && triggerRef.current && contentRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = side === "bottom" ? rect.bottom + sideOffset : side === "top" ? rect.top - sideOffset - contentRef.current.offsetHeight : rect.top;
      let left = side === "right" ? rect.right + sideOffset : side === "left" ? rect.left - sideOffset - contentRef.current.offsetWidth : rect.left;
      if (side === "bottom" || side === "top") {
        if (align === "center") {
          left = rect.left + rect.width / 2 - contentRef.current.offsetWidth / 2 + alignOffset;
        } else if (align === "end") {
          left = rect.right - contentRef.current.offsetWidth + alignOffset;
        } else {
          left = rect.left + alignOffset;
        }
      } else {
        if (align === "center") {
          top = rect.top + rect.height / 2 - contentRef.current.offsetHeight / 2 + alignOffset;
        } else if (align === "end") {
          top = rect.bottom - contentRef.current.offsetHeight + alignOffset;
        } else {
          top = rect.top + alignOffset;
        }
      }
      setStylePos({
        position: "absolute",
        top: top + window.scrollY,
        left: left + window.scrollX,
        visibility: "visible",
      });
    }
  }, [open, side, align, sideOffset, alignOffset]);

  if (!open) return null;

  const popoverEl = (
    <div
      ref={contentRef}
      className={cn(
        "z-[9999] w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      style={stylePos}
      {...props}
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(popoverEl, document.body);
};

export { Popover, PopoverTrigger, PopoverContent };
