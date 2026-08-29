import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#22C55E] text-[#080C14] hover:bg-[#16a34a] font-semibold border border-[#22C55E]",
        destructive: "bg-[#EF4444] text-[#F8FAFC] hover:bg-[#dc2626]",
        outline: "border border-[#38BDF8] bg-transparent text-[#38BDF8] hover:bg-[#38BDF8]/10",
        secondary: "bg-[#0F172A] text-[#F8FAFC] border border-[#1E293B] hover:bg-[#1E293B] hover:text-[#38BDF8]",
        ghost: "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]",
        link: "text-[#38BDF8] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-8 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }