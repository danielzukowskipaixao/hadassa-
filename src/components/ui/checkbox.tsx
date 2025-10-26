"use client";
import * as React from "react";
import { cn } from "@/lib/ui";

type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  "aria-label"?: string;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, defaultChecked, onCheckedChange, className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "h-5 w-5 rounded-md border border-rose-400 bg-white align-middle",
          "accent-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2",
          "transition-transform duration-150 ease-out active:scale-95",
          className
        )}
        {...rest}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
