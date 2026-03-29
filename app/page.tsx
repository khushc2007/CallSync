"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

function useCounter(target: number, trigger: boolean) {
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

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const noShowReduction = useCounter(40, statsVisible)
  const deskTimeRecovered = useCounter(40, statsVisible)

  // ← swap this for your deployed URL
  const HOW_IT_WORKS_URL = "https://your-deployed-site.vercel.app/how-it-works"

  return (
    <>
      {/* Spline in a fixed layer — never clipped by any parent overflow */}
      <div className="fixed inset-0 z-0 bg-[#0b0717]">
        <iframe
          src="https://my.spline.design/motiontrails-mQJiWP02BoJRJj7QScWZ8Yil/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="h-full w-full"
        />
      </div>

      {/* Bottom vignette */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0b0717] to-transparent z-[1] pointer-events-none" />

      {/* Page shell */}
      <div className="relative z-10 flex flex-col" style={{ minHeight: "100dvh" }}>

        {/* Nav — logo only */}
        <nav className="px-5 sm:px-10 md:px-16 py-5 flex items-center">
          <span className="text-white font-bold tracking-[0.2em] text-xs sm:text-sm">
            CALLSYNC AI
          </span>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-between px-5 sm:px-10 md:px-16 gap-4 md:gap-8 pb-8 md:pb-0">

          {/* Left copy */}
          <div className="flex-1 max-w-xl w-full flex flex-col justify-center py-4">

            <div className="flex items-center gap-2 mb-3 sm:mb-5">
              <div className="h-px w-6 bg-red-400/60" />
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300/75">
                VOICE AI · TRACK 3.3 · HACK&apos;A&apos;WAR GenAI × AWS
              </p>
            </div>

            <h1
              className="mb-3 sm:mb-6 font-bold leading-[1.05] text-white"
              style={{ fontSize: "clamp(1.75rem, 5.5vw, 3.6rem)" }}
            >
              YOUR RECEPTIONIST.
              <br />
              MINUS THE SALARY.
              <br />
              <span className="text-red-300 drop-shadow-[0_0_30px_rgba(239,68,68,0.45)]">
                WITH CALLSYNC AI.
              </span>
            </h1>

            <p className="mb-5 sm:mb-8 max-w-lg text-xs sm:text-sm md:text-[15px] leading-relaxed text-white/60">
              An AI voice agent that handles appointment booking, rescheduling, and
              cancellations over a natural phone call. No app, no form, no hold music.
              Runs 24/7 with proactive reminder calls that cut no-shows by up to 40%.
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

            {/* Animated stats */}
            <div className="flex flex-wrap gap-5 sm:gap-8">
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

          {/* Right — phone image, hidden on mobile */}
          <div className="hidden sm:flex relative flex-shrink-0 items-center justify-center self-stretch">
            <div
              className="relative"
              style={{
                width: "clamp(200px, 30vw, 460px)",
                height: "clamp(290px, 44vw, 660px)",
              }}
            >
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
    </>
  )
}
