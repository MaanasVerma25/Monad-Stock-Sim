import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[#dfd0be] group-[.toaster]:text-[#39342f] group-[.toaster]:border group-[.toaster]:border-[#94806c]/40 group-[.toaster]:shadow-none font-sans",
          description: "group-[.toast]:text-[#65584c]",
          actionButton: "group-[.toast]:bg-[#39342f] group-[.toast]:text-[#f7f3ed]",
          cancelButton: "group-[.toast]:bg-[#f7f3ed] group-[.toast]:text-[#39342f]",
        },
      }}
    />
  )
}