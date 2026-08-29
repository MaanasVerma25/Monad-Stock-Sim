"use client"

import Link from "next/link"
import Image from "next/image"
import { Instrument_Serif } from "next/font/google"

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
})

export function PulseStockLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group select-none">
      {/* Seamless Translucent Glass Container for Logo Mark */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-950/80 border border-white/10 p-1.5 shadow-md group-hover:border-emerald-500/40 transition-all duration-300">
        {/* Soft Background Glow Accent */}
        <div className="absolute inset-0 rounded-xl bg-emerald-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Transparent Logo Mark */}
        <Image
          src="/logo.png"
          alt="PulseStock Emblem"
          width={28}
          height={28}
          priority
          className="object-contain relative z-10 filter drop-shadow-[0_0_8px_rgba(34,197,94,0.35)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Styled Brand Typography */}
      <div className="flex items-baseline text-xl tracking-tight">
        <span className="font-sans font-bold text-white">Pulse</span>
        <span className={`${instrumentSerif.className} italic text-zinc-400 font-normal ml-1`}>Stock</span>
      </div>
    </Link>
  )
}
