import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "~/lib/utils";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "button-primary",
      outline: "button-outline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Button({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
