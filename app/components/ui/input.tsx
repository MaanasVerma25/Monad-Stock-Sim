import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-[#1E293B] bg-[#080C14] px-4 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] focus-visible:border-[#38BDF8] disabled:cursor-not-allowed disabled:opacity-50 font-mono transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }