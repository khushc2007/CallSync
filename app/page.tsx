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

  const HOW_IT_WORKS_URL = "https://your-deployed-site.vercel.app/how-it-works"

  return (
    <>
      {/* Spline fixed background — never clipped */}
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

      {/* Page shell — hard locked to screen, no overflow */}
      <div
        className="relative z-10 flex flex-col overflow-hidden"
        style={{ height: "100dvh" }}
      >
        {/* Nav */}
        <nav className="flex-shrink-0 px-5 sm:px-10 md:px-16 py-4 flex items-center">
          <span className="text-white font-bold tracking-[0.2em] text-xs sm:text-sm">
            CALLSYNC AI
          </span>
        </nav>

        {/* Hero — fills remaining height exactly */}
        <div
          className="flex-1 flex flex-col md:flex-row items-center justify-between overflow-hidden"
          style={{ padding: "0 clamp(1.25rem, 6vw, 4rem)" }}
        >
          {/* Left copy */}
          <div className="flex-1 max-w-xl w-full flex flex-col justify-center gap-0">

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              <div className="h-px w-5 bg-red-400/60 flex-shrink-0" />
              <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300/75 leading-none">
                VOICE AI · TRACK 3.3 · HACK&apos;A&apos;WAR GenAI × AWS
              </p>
            </div>

            {/* Headline — clamp keeps it from ever overflowing */}
            <h1
              className="font-bold leading-[1.05] text-white mb-2 sm:mb-4"
              style={{ fontSize: "clamp(1.4rem, 4.8vw, 3.6rem)" }}
            >
              YOUR RECEPTIONIST.
              <br />
              MINUS THE SALARY.
              <br />
              <span className="text-red-300 drop-shadow-[0_0_30px_rgba(239,68,68,0.45)]">
                WITH CALLSYNC AI.
              </span>
            </h1>

            {/* Body */}
            <p
              className="max-w-lg leading-relaxed text-white/60 mb-4 sm:mb-6"
              style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.9375rem)" }}
            >
              An AI voice agent that handles appointment booking, rescheduling, and
              cancellations over a natural phone call. No app, no form, no hold music.
              Runs 24/7 with proactive reminder calls that cut no-shows by up to 40%.
            </p>

            {/* CTA */}
            <div className="mb-4 sm:mb-8">
              <Button
                asChild
                className="rounded-full bg-white px-6 sm:px-8 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#12083a] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_28px_rgba(255,255,255,0.2)] h-10 sm:h-11"
              >
                <a href={HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
                  SEE HOW IT WORKS
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-8">
              {[
                { val: `${noShowReduction}%`, suffix: "reduction", label: "No-show rate" },
                { val: "24/7", suffix: "", label: "Zero downtime" },
                { val: `${deskTimeRecovered}%`, suffix: "recovered", label: "Front-desk time" },
              ].map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span className="text-red-300 font-bold leading-none tabular-nums drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                        style={{ fontSize: "clamp(0.95rem, 2vw, 1.25rem)" }}>
                    {m.val}
                    {m.suffix && (
                      <span className="text-red-300/50 text-[10px] ml-1 font-normal">{m.suffix}</span>
                    )}
                  </span>
                  <span className="text-white/30 text-[10px] tracking-wide mt-1">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone image, hidden on mobile so copy has full room */}
          <div className="hidden md:flex relative flex-shrink-0 items-center justify-center self-stretch">
            <div
              className="relative"
              style={{
                width: "clamp(180px, 28vw, 460px)",
                height: "clamp(260px, 42vw, 660px)",
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

      {/* Prevent any html/body scroll */}
      <style>{`
        html, body { overflow: hidden; height: 100%; }
      `}</style>
    </>
  )
}
