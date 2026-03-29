"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

/* ─── Animated counter hook ─── */
function useCounter(target: number, duration = 1800, trigger: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = () => {
      start += 1
      setVal(Math.min(Math.round((start / 60) * target), target))
      if (start < 60) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, trigger])
  return val
}

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const noShowReduction = useCounter(40, 1600, statsVisible)
  const deskTimeRecovered = useCounter(40, 1800, statsVisible)

  // Replace with your deployed detail page URL
  const HOW_IT_WORKS_URL = "https://your-deployed-site.vercel.app/how-it-works"

  return (
    <div className="relative w-full bg-[#0b0717]" style={{ height: "100dvh", overflow: "hidden" }}>

      {/* Spline background */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://my.spline.design/motiontrails-mQJiWP02BoJRJj7QScWZ8Yil/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="h-full w-full"
        />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0b0717] to-transparent z-[1] pointer-events-none" />

      {/* Top nav */}
      <nav className="relative z-10 px-5 sm:px-10 md:px-16 py-5 flex items-center justify-between">
        <span className="text-white font-bold tracking-[0.2em] text-xs sm:text-sm">CALLSYNC AI</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:block text-[10px] font-bold tracking-[0.18em] text-white/30 uppercase">
            Track 3.3 · Voice AI
          </span>
          <div className="h-3 w-px bg-white/15 hidden sm:block" />
          <span className="text-[10px] font-bold tracking-[0.15em] text-red-300/60 uppercase">
            HACK&apos;A&apos;WAR GenAI × AWS
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div
        className="relative z-10 flex flex-col md:flex-row items-center justify-between
                   px-5 sm:px-10 md:px-16
                   gap-4 md:gap-8"
        style={{ height: "calc(100dvh - 72px)" }}
      >
        {/* Left copy */}
        <div className="flex-1 max-w-xl w-full flex flex-col justify-center py-4">

          <div className="flex items-center gap-2 mb-3 sm:mb-5">
            <div className="h-px w-6 bg-red-400/60" />
            <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300/75">
              VOICE AI · TRACK 3.3 · HACK&apos;A&apos;WAR GenAI × AWS
            </p>
          </div>

          <h1 className="mb-3 sm:mb-6 font-bold leading-[1.05] text-white"
              style={{ fontSize: "clamp(1.6rem, 5vw, 3.6rem)" }}>
            YOUR RECEPTIONIST.
            <br />
            MINUS THE SALARY.
            <br />
            <span className="text-red-300 drop-shadow-[0_0_30px_rgba(239,68,68,0.45)]">
              WITH CALLSYNC AI.
            </span>
          </h1>

          <p className="mb-5 sm:mb-8 max-w-lg text-xs sm:text-sm md:text-[15px] leading-relaxed text-white/60">
            An AI voice agent that handles appointment booking, rescheduling, and cancellations over a natural phone call.
            No app, no form, no hold music. Runs 24/7 with proactive reminder calls that cut no-shows by up to 40%.
          </p>

          <div className="flex flex-wrap gap-3 mb-6 sm:mb-10">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-6 sm:px-8 text-[11px] font-bold uppercase tracking-widest text-[#12083a] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_28px_rgba(255,255,255,0.2)]"
            >
              <a href={HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
                SEE HOW IT WORKS
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="flex flex-wrap gap-5 sm:gap-8">
            {[
              { val: `${noShowReduction}%`, suffix: "reduction", label: "No-show rate" },
              { val: "24/7", suffix: "", label: "Zero downtime" },
              { val: `${deskTimeRecovered}%`, suffix: "recovered", label: "Front-desk time" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col">
                <span className="text-red-300 font-bold text-lg sm:text-xl leading-none tabular-nums drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                  {m.val}
                  {m.suffix && (
                    <span className="text-red-300/50 text-xs ml-1 font-normal">{m.suffix}</span>
                  )}
                </span>
                <span className="text-white/30 text-xs tracking-wide mt-1">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right phone image — hidden on mobile */}
        <div className="hidden sm:flex relative flex-shrink-0 items-center justify-center self-stretch">
          <div className="relative w-[220px] h-[320px] sm:w-[280px] sm:h-[400px] md:w-[360px] md:h-[520px] lg:w-[440px] lg:h-[630px]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png"
              alt="CallSync AI"
              fill
              className="object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 50px rgba(239,68,68,0.6)) drop-shadow(0 0 100px rgba(239,68,68,0.3))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
