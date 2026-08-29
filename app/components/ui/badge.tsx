import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-[#1E293B] px-3 py-1 text-xs font-semibold font-mono transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#22C55E] text-[#080C14]",
        secondary: "border-[#1E293B] bg-[#0F172A] text-[#38BDF8]",
        destructive: "border-transparent bg-[#EF4444] text-[#F8FAFC]",
        outline: "border-[#1E293B] text-[#F8FAFC]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }